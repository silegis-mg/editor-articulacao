/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import EditorArticulacaoController from './EditorArticulacaoController';
import { TipoDispositivo, TipoDispositivoOuAgrupador } from './TipoDispositivo';
import { TArticulacao, interpretarArticulacao, transformarQuebrasDeLinhaEmP } from './interpretadorArticulacao';
import { obterElemento } from './util';
import ValidacaoController from './validacao/ValidacaoController';

/**
 * Controlador da área de transferência do editor de articulação.
 */
export default class ClipboardController {
    constructor(private readonly editorCtrl: EditorArticulacaoController, private readonly validacaoCtrl: ValidacaoController) {
        editorCtrl.registrarEventListener('paste', (event) => aoColar(event, this));
    }

    /**
     * Cola um texto de articulação no editor.
     * 
     * @param texto Texto a ser colado. 
     */
    colarTexto(texto: string): void {
        const selecao = this.editorCtrl.getSelection();
        const range = selecao.getRangeAt(0);

        if (!range.collapsed) {
            range.deleteContents();
            this.editorCtrl.atualizarContexto();
        }

        const brs = obterElemento(range.endContainer.nodeType === Node.TEXT_NODE ? range.endContainer.parentNode : range.endContainer).querySelectorAll('br');

        for (let i = 0; i < brs.length; i++) {
            brs[i].remove();
        }

        const fragmento = transformar(texto, this.editorCtrl.contexto.cursor.tipo);

        colarFragmento(fragmento, this.editorCtrl, this.validacaoCtrl);
    }
}

/**
 * Transforma um texto em um fragmento a ser colado.
 * 
 * @param texto Texto a ser transformado.
 * @param tipo Tipo do contexto atual do cursor.
 */
function transformar(texto: string, tipo: TipoDispositivoOuAgrupador | 'desconhecido') {
    let fragmento;

    if (tipo === 'continuacao') {
        fragmento = transformarTextoPuro(texto, 'continuacao');
    } else {
        const dados = interpretarArticulacao(texto, 'json');

        if (dados.textoAnterior) {
            fragmento = transformarTextoPuro(dados.textoAnterior, tipo !== 'desconhecido' ? tipo : TipoDispositivo.ARTIGO);
        }

        if (dados.articulacao.length > 0) {
            const fragmentoArticulacao = transformarArticulacao(dados.articulacao);

            if (fragmento) {
                fragmento.appendChild(fragmentoArticulacao);
            } else {
                fragmento = fragmentoArticulacao;
            }
        }
    }

    return fragmento;
}

/**
 * Trata a colagem da área de transferência.
 */
function aoColar(event: ClipboardEvent, clipboardCtrl: ClipboardController) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const itens = clipboardData.items;

    if (itens) {
        for (let i = 0; i < itens.length; i++) {
            if (itens[i].type === 'text/plain') {
                itens[i].getAsString(clipboardCtrl.colarTexto.bind(clipboardCtrl));
                event.preventDefault();
            }
        }
    } else if (clipboardData.getData) {
        clipboardCtrl.colarTexto(clipboardData.getData('text/plain'));
        event.preventDefault();
    }
}

/**
 * Cola um fragmento no DOM.
 */
function colarFragmento(fragmento: DocumentFragment, editorCtrl: EditorArticulacaoController, validacaoCtrl: ValidacaoController): void {
    prepararDesfazer(fragmento, editorCtrl);

    const proximaSelecao = fragmento.lastChild;
    const selecao = editorCtrl.getSelection();
    let range = selecao.getRangeAt(0);
    const noInicial = range.startContainer;
    const excluirNoAtual = fragmento.firstChild.nodeType !== Node.TEXT_NODE && noInicial !== editorCtrl._elemento && noInicial.textContent.trim().length === 0;
    let primeiroElementoAValidar: Element;

    // Se a seleção estiver no container, então devemos inserir elementos filhos...
    if (range.collapsed && noInicial === editorCtrl._elemento) {
        // Remove as quebras de linha, usada como placeholder pelos contentEditable.
        for (let itens = editorCtrl._elemento.querySelectorAll('br'), i = 0; i < itens.length; i++) {
            itens[i].remove();
        }

        // Remove os elementos vazios.
        for (let itens = editorCtrl._elemento.querySelectorAll('*:empty'), i = 0; i < itens.length; i++) {
            itens[i].remove();
        }

        // Transforma os nós textuais em parágrafos.
        for (let item = fragmento.firstChild; item && item.nodeType === Node.TEXT_NODE; item = fragmento.firstChild) {
            const p = document.createElement('p');
            p.appendChild(item);
            p.setAttribute('data-tipo', TipoDispositivo.ARTIGO);
            fragmento.insertBefore(p, fragmento.firstElementChild);
        }

        primeiroElementoAValidar = fragmento.firstElementChild;
        range.insertNode(fragmento);
    } else {
        if (excluirNoAtual) {
            primeiroElementoAValidar = fragmento.firstElementChild;
        } else {
            primeiroElementoAValidar = noInicial instanceof Element ? noInicial : noInicial.parentElement;
        }

        // Insere os primeiros nós textuais na própria seleção.
        for (let item = fragmento.firstChild; item && item.nodeType === Node.TEXT_NODE; item = fragmento.firstChild) {
            range.insertNode(item);
        }

        // Insere os elementos em seguida, no container, pois não podem estar aninhados ao elemento da seleção.
        let referencia = range.endContainer;

        while (referencia.parentElement !== editorCtrl._elemento) {
            referencia = referencia.parentElement;
        }
        
        referencia.parentElement.insertBefore(fragmento, referencia.nextSibling);
    }

    if (excluirNoAtual) {
        noInicial.parentNode.removeChild(noInicial);
    }

    // Altera a seleção.
    selecao.removeAllRanges();
    range = document.createRange();

    range.setStartAfter(proximaSelecao);
    selecao.addRange(range);
    
    editorCtrl.atualizarContexto();

    // Realiza validação do fragmento colado.
    const ultimoElementoAValidar = proximaSelecao.nodeType === Node.ELEMENT_NODE ? proximaSelecao : proximaSelecao.parentElement;

    for (let noAlterado = primeiroElementoAValidar; noAlterado && noAlterado !== ultimoElementoAValidar; noAlterado = noAlterado.nextElementSibling) {
        validacaoCtrl.validar(noAlterado);
    }
}

/**
 * Realiza uma cópia do fragmento e monitora ctrl+z para remover fragmentos.
 */
function prepararDesfazer(fragmento: DocumentFragment, editorCtrl: EditorArticulacaoController) {
    const copia: Node[] = [];

    for (let i = 0, l = fragmento.childNodes.length; i < l; i++) {
        copia.push(fragmento.childNodes[i]);
    }

    const desfazer = function() {
        const anterior = copia[0].previousSibling;
        const posterior = copia[copia.length - 1].nextSibling;

        // Remove os elementos
        for (let i = 0; i < copia.length; i++) {
            copia[i].parentNode.removeChild(copia[i]);
        }

        removerListeners();

        // Restaura o cursor.
        const selecao = editorCtrl.getSelection();
        const range = document.createRange();

        if (anterior) {
            range.setStartAfter(anterior);
            selecao.removeAllRanges();
            selecao.addRange(range);
        } else if (posterior) {
            range.setStartBefore(posterior);
            selecao.removeAllRanges();
            selecao.addRange(range);
        }
    };

    const keyDownListener = function(keyboardEvent: KeyboardEvent) {
        // Desfaz se pressionar o ctrl+z
        if (keyboardEvent.ctrlKey && (keyboardEvent.key === 'z' || keyboardEvent.key === 'Z')) {
            desfazer();
            keyboardEvent.preventDefault();
        }
    };

    const bakExecCommand = document.execCommand;

    const removerListeners = function() {
        editorCtrl._elemento.removeEventListener('keydown', keyDownListener);
        editorCtrl._elemento.removeEventListener('keypress', removerListeners);
        document.execCommand = bakExecCommand;
    };

    editorCtrl._elemento.addEventListener('keydown', keyDownListener);
    editorCtrl._elemento.addEventListener('keypress', removerListeners);

    document.execCommand = function(comando) {
        if (comando === 'undo') {
            desfazer();
        } else {
            // eslint-disable-next-line prefer-rest-params
            return bakExecCommand.apply(document, arguments);
        }
    };
}

/**
 * Insere texto simples no contexto atual.
 * 
 * @param texto  Texto a ser interpretado.
 * @param tipo Tipo atual.
 * @returns Fragmento gerado para colagem.
 */
function transformarTextoPuro(texto: string, tipo: TipoDispositivoOuAgrupador): DocumentFragment | null {
    if (texto.length === 0) {
        return null;
    }

    const fragmento = document.createDocumentFragment();
    const primeiraQuebra = texto.indexOf('\n');

    if (primeiraQuebra !== 0) {
        /* A primeira linha deve ser inserida no dispositivo atual.
         * Para tanto, utiliza-se um TextNode.
         */
        const textNode = document.createTextNode(primeiraQuebra > 0 ? texto.substring(0, primeiraQuebra) : texto);
        fragmento.appendChild(textNode);
    }

    if (primeiraQuebra !== -1) {
        // Demais linhas devem ser criadas em novos parágrafos.
        const novoTexto = transformarQuebrasDeLinhaEmP(texto.substring(primeiraQuebra + 1));
        fragmento.appendChild(novoTexto);

        /**
         * Define o tipo para cada P, formatando automaticamente com base na terminação de dois pontos (:) ou ponto final(.).
         */
        const anterior: TipoDispositivoOuAgrupador[] = [];

        if (fragmento.firstChild.nodeType === Node.TEXT_NODE && fragmento.firstChild.textContent.endsWith(':')) {
            const enumeracao = novoTipoEnumeracao(tipo);

            if (tipo !== enumeracao) {
                anterior.push(tipo);
                tipo = enumeracao;
            }
        }

        for (let item = fragmento.firstElementChild; item; item = item.nextElementSibling) {
            item.setAttribute('data-tipo', tipo);

            if (item.textContent.endsWith(':')) {
                const enumeracao = novoTipoEnumeracao(tipo);

                if (tipo !== enumeracao) {
                    anterior.push(tipo);
                    tipo = enumeracao;
                }
            } else if (anterior.length > 0 && item.textContent.endsWith('.')) {
                tipo = anterior.pop();
            }
        }
    }

    return fragmento;
}

function novoTipoEnumeracao(tipoAtual: TipoDispositivoOuAgrupador): TipoDispositivoOuAgrupador | null {
    switch (tipoAtual) {
        case TipoDispositivo.ARTIGO:
        case TipoDispositivo.PARAGRAFO:
            return TipoDispositivo.INCISO;

        case TipoDispositivo.INCISO:
            return TipoDispositivo.ALINEA;

        case TipoDispositivo.ALINEA:
            return TipoDispositivo.ITEM;

        default:
            return null;
    }
}

function transformarArticulacao(articulacao: TArticulacao): DocumentFragment {
    const fragmento = document.createDocumentFragment();

    articulacao.forEach(item => fragmento.appendChild(item.paraEditor()));

    return fragmento;
}

export { ClipboardController, transformarQuebrasDeLinhaEmP, transformarTextoPuro, transformar };