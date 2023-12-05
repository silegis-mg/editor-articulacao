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

import ContextoArticulacaoAtualizadoEvent from './eventos/ContextoArticulacaoAtualizadoEvent';
import ContextoArticulacao, { Permissoes } from './ContextoArticulacao';
import adicionarTransformacaoAutomatica from './transformacaoAutomatica/transformacaoAutomatica';
import hackChrome from './hacks/chrome';
import hackIE from './hacks/ie';
import polyfill from './hacks/polyfill';
import importarDeLexML from './lexml/importarDeLexML';
import exportarParaLexML from './lexml/exportarParaLexML';
import ClipboardController from './ClipboardController';
import { ControleAlteracao, criarControleAlteracao } from './ControleAlteracao';
import css from './editor-articulacao-css.js';
import cssShadow from './editor-articulacao-css-shadow.js';
import ArticulacaoInvalidaException from './lexml/ArticulacaoInvalidaException';
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo, obterElemento } from './util';
import ValidacaoController from './validacao/ValidacaoController';
import padrao from './opcoesPadrao';
import IOpcoesEditorArticulacaoController from './IOpcoesEditorArticulacaoController';
import EventoInterno from './eventos/EventoInterno';
import { TipoAgrupador, TipoDispositivo, TipoDispositivoOuAgrupador } from './TipoDispositivo';

/**
 * Controlador do editor de articulação.
 */
class EditorArticulacaoController {

    /**
     * Elemento do editor de articulação controlado por esta instância.
     */
    public readonly _elemento: Element;

    /**
     * Opções efetivas deste editor.
     */
    private readonly opcoes: IOpcoesEditorArticulacaoController;

    /**
     * 
     */
    private _contexto: ContextoArticulacao;

    get contexto() { return this._contexto; }

    /**
     * Eventos registrados por este controlador no elemento no DOM.
     */
    private _handlers: {
        evento: string;
        listener: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
    }[] = [];

    private readonly controleAlteracao: ControleAlteracao;
    private readonly validacaoCtrl: ValidacaoController;
    private readonly clipboardCtrl: ClipboardController;

    /**
     * Elemento do DOM que será utilizado como editor de articulação.
     * 
     * @param elemento Elemento que receberá o editor de articulação.
     * @param opcoes Opções do editor de articulação
     */
    constructor(elemento: HTMLElement, opcoes: IOpcoesEditorArticulacaoController) {
        if (!(elemento instanceof Element)) {
            throw new Error('Elemento não é um elemento do DOM.');
        }

        this._elemento = elemento;

        polyfill();

        const opcoesEfetivas = Object.create(padrao);
        Object.assign(opcoesEfetivas, opcoes);

        if (opcoes && opcoes.rotulo) {
            Object.setPrototypeOf(opcoesEfetivas.rotulo, padrao.rotulo);
        }

        this.opcoes = opcoesEfetivas;
        Object.freeze(opcoesEfetivas);
        Object.freeze(opcoesEfetivas.rotulo);
        Object.freeze(opcoesEfetivas.validacao);

        elemento = transformarEmEditor(elemento, this, opcoesEfetivas);

        if (!this.opcoes.somenteLeitura) {
            this._registrarEventos();

            if (opcoesEfetivas.transformacaoAutomatica) {
                adicionarTransformacaoAutomatica(this, elemento);
            }

            this.controleAlteracao = criarControleAlteracao(this);
            this.validacaoCtrl = new ValidacaoController(this.opcoes.validacao);
            this.clipboardCtrl = new ClipboardController(this, this.validacaoCtrl);

            // Executa hack se necessário.
            if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                hackChrome(this);
            }

            if (/Trident\//.test(navigator.userAgent)) {
                hackIE(this);
            }
        }

        this.limpar();
    }

    /**
     * Dispara evento no DOM. Deve-se usar este método, pois caso seja utilizado
     * ShadowDOM, este método é substituído para propagação externa de evento.
     */
    dispatchEvent(eventoInterno: EventoInterno<unknown>) {
        this._elemento.dispatchEvent(eventoInterno.getCustomEvent());
    }

    getSelection(): Selection {
        return document.getSelection();
    }

    get vazio(): boolean {
        return !this._elemento.firstElementChild || this._elemento.firstElementChild === this._elemento.lastElementChild && this._elemento.textContent === '';
    }

    get lexml(): Node {
        try {
            return this.vazio ? document.createDocumentFragment() : exportarParaLexML(this._elemento, this.opcoes.rotulo);
        } catch (e) {
            if (e instanceof ArticulacaoInvalidaException) {
                for (let filho = this._elemento.firstElementChild; filho; filho = filho.nextElementSibling) {
                    this._normalizarDispositivo(filho);
                }

                return exportarParaLexML(this._elemento, this.opcoes.rotulo);
            }

            throw e;
        }
    }

    set lexml(valor: Node | string) {
        const articulacao = importarDeLexML(valor);

        this._elemento.innerHTML = '';
        this._elemento.appendChild(articulacao);

        if (this.vazio) {
            this.limpar();
        }

        if (!this.opcoes.somenteLeitura) {
            this.controleAlteracao.comprometer();

            if (this.opcoes.validarAoAtribuir) {
                for (let dispositivo = this._elemento.firstElementChild; dispositivo; dispositivo = dispositivo.nextElementSibling) {
                    this.validacaoCtrl.validar(dispositivo);
                }
            }
        }
    }

    limpar(): void {
        this._elemento.innerHTML = '<p data-tipo="artigo"><br></p>';
    }

    get lexmlString(): string {
        const xml = this.lexml;
        const xmlSerializer = new XMLSerializer();
        const resultado = xmlSerializer.serializeToString(xml);

        return this.opcoes.escaparXML ? escaparXml(resultado) : resultado;
    }

    set lexmlString(valor) {
        this.lexml = valor;
    }

    get alterado(): boolean {
        return this.controleAlteracao.alterado;
    }

    /**
     * Adiciona tratamento de eventos no DOM, que pode ser removido em seguida
     * por meio do método "desregistrar".
     */
    private _registrarEventos(): void {
        const eventHandler = this._cursorEventHandler.bind(this);
        const eventos: (keyof HTMLElementEventMap)[] = ['focus', 'keyup', 'mousedown', 'touchstart', 'mouseup', 'touchend'];

        eventos.forEach(evento => this.registrarEventListener(evento, eventHandler));
        this.registrarEventListener('keydown', this._keyDownEventHandler.bind(this));

        this.registrarEventListener('blur', () => {
            if (!this.opcoes.somenteLeitura) {
                if (this.vazio) {
                    this.limpar();
                }

                const contexto = this._contexto;

                if (contexto && contexto.cursor.dispositivo) {
                    this.validacaoCtrl.validar(this._contexto.cursor.dispositivo);
                }
            }
        });
    }

    /**
     * Adiciona um tratamento de evento no elemento do editor no DOM.
     * 
     * @param evento Evento a ser capturado.
     */
    registrarEventListener<K extends keyof HTMLElementEventMap>(evento: K, listener: (this: Element, ev: HTMLElementEventMap[K]) => unknown): void;
    registrarEventListener<K extends keyof HTMLElementEventMap>(evento: K, listener: (this: Element, ev: HTMLElementEventMap[K]) => unknown, useCapture: boolean): void;
    registrarEventListener<K extends keyof HTMLElementEventMap>(evento: K, listener: (this: Element, ev: HTMLElementEventMap[K]) => unknown, options: AddEventListenerOptions): void;
    registrarEventListener(evento: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        this._handlers.push({ evento: evento, listener: listener, options });
        this._elemento.addEventListener(evento, listener, options);
    }

    desregistrar() {
        this._handlers.forEach(registro => this._elemento.removeEventListener(registro.evento, registro.listener, registro.options));
        this._handlers = [];
    }

    /**
     * Trata evento de alteração de cursor.
     */
    private _cursorEventHandler(event: Event) {
        this.atualizarContexto();
        this._normalizarContexto();

        if (event instanceof KeyboardEvent && event.key && event.key.length === 1 && this._contexto.cursor.dispositivo && this._contexto.cursor.dispositivo.hasAttribute('data-invalido')) {
            this._contexto.cursor.dispositivo.removeAttribute('data-invalido');
        }
    }

    private _keyDownEventHandler(event: KeyboardEvent) {
        if (!this._contexto || !this._contexto.cursor.dispositivo) {
            this._cursorEventHandler(event);
        }

        const elementoSelecionado = obterSelecao(this);

        if (!this._contexto || elementoSelecionado !== this._contexto.cursor.dispositivo) {
            this._cursorEventHandler(event);
        }
    }

    private  _normalizarContexto(): void {
        if (!this._contexto) {
            return;
        }

        const dispositivo = this._contexto.cursor.dispositivo;

        if (dispositivo) {
            this._normalizarDispositivo(dispositivo.previousElementSibling);
            this._normalizarDispositivo(dispositivo, this._contexto);
            this._normalizarDispositivo(dispositivo.nextElementSibling);

            if (!this.opcoes.somenteLeitura) {
                this.validacaoCtrl.validar(dispositivo.previousElementSibling);
                this.validacaoCtrl.validar(dispositivo.nextElementSibling);
            }
        }
    }

    /**
     * Atualiza a variável de análise do contexto do cursor.
     */
    atualizarContexto() {
        let elementoSelecionado = obterSelecao(this);

        if (!elementoSelecionado) {
            if (!this._contexto) {
                return;
            }

            elementoSelecionado = this._contexto.cursor.elemento;
        }

        /* Se a seleção estiver no container e não houver nenhum conteúdo,
         * então devemos recriar o conteúdo mínimo.
         */
        if (elementoSelecionado === this._elemento && (!this._elemento.firstElementChild || this._elemento.firstElementChild === this._elemento.lastElementChild && this._elemento.firstElementChild.tagName === 'BR')) {
            this.limpar();
            elementoSelecionado = this._elemento.firstElementChild;

            const selecao = this.getSelection();
            selecao.removeAllRanges();
            const range = document.createRange();

            range.selectNodeContents(elementoSelecionado);
            selecao.addRange(range);
        }

        const novoCalculo = new ContextoArticulacao(this._elemento, elementoSelecionado);

        if (!this._contexto || this._contexto.cursor.elemento !== elementoSelecionado || this._contexto.comparar(novoCalculo)) {
            // Realiza a validação do cursor anterior.
            if (this._contexto && this._contexto.cursor.dispositivo && !this.opcoes.somenteLeitura) {
                this.validacaoCtrl.validar(this._contexto.cursor.dispositivo);
            }

            this._contexto = novoCalculo;
            this.dispatchEvent(new ContextoArticulacaoAtualizadoEvent(novoCalculo));
        }

        return novoCalculo;
    }

    /**
     * Altera o tipo do dispositivo selecionado.
     * 
     * @param {String} novoTipo Novo tipo do dispositivo.
     */
    alterarTipoDispositivoSelecionado(novoTipo: TipoDispositivoOuAgrupador) {
        this.atualizarContexto();

        if (!this._contexto) {
            throw new Error('Não há contexto atual.');
        }

        if (!this._contexto.permissoes[novoTipo]) {
            throw new Error('Tipo não permitido: ' + novoTipo);
        }

        let dispositivo = this._contexto.cursor.dispositivo;

        this._definirTipo(dispositivo, novoTipo);

        // Se a seleção incluir mais de um dispositivo, vamos alterá-los também.
        const selecao = this.getSelection();
        const range = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;
        let endContainer = range ? range.endContainer : null;

        if (endContainer) {
            /* Se o container final não estiver no mesmo nível (por exemplo,
             * um nó textual ou até mesmo uma tag de itálico dentro do
             * dispositivo), então considera-se como endContainer o dispositivo
             * ancestral, por meio da verificação do atributo "data-tipo".
             */
            while (endContainer !== this._elemento && (endContainer.nodeType !== Node.ELEMENT_NODE || !(endContainer as Element).hasAttribute('data-tipo'))) {
                endContainer = endContainer.parentElement;
            }

            /* Altera o tipo para todos os dispositivos seguintes até encontrar
             * o container final.
             */
            while (dispositivo !== endContainer && dispositivo) {
                dispositivo = dispositivo.nextElementSibling;
                this._definirTipo(dispositivo, novoTipo);
            }
        }

        this.atualizarContexto();
    }

    /**
     * Altera o tipo de um dispositivo, sem qualquer validação.
     * 
     * @param {Element} dispositivo 
     * @param {String} novoTipo 
     */
    private  _definirTipo(dispositivo: Element, novoTipo: TipoDispositivoOuAgrupador): void {
        const tipoAnterior = dispositivo.getAttribute('data-tipo');

        if (tipoAnterior !== novoTipo) {
            dispositivo.setAttribute('data-tipo', novoTipo);
            dispositivo.classList.remove('unico');
            
            try {
                this._normalizarContexto();
            } finally {
                this.controleAlteracao.alterado = true;
            }
        }
    }

    /**
     * Normaliza o dispositivo, corrigindo eventuais inconsistências.
     * 
     * @param dispositivo Elemento do dispositivo a ser normalizado.
     * @param contexto Contexto a ser considerado.
     */
    public _normalizarDispositivo(dispositivo: Element, contexto?: ContextoArticulacao): void {
        while (dispositivo && !dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentElement;
        }

        if (!dispositivo) {
            return;
        }

        if (!contexto) {
            contexto = new ContextoArticulacao(this._elemento, dispositivo);
        } else if (!(contexto instanceof ContextoArticulacao)) {
            throw new Error('Conexto não é instância de ContextoArticulacao.');
        }

        if (contexto && !contexto.permissoes[dispositivo.getAttribute('data-tipo') as TipoDispositivoOuAgrupador]) {
            try {
                const anterior = dispositivo.previousElementSibling;
                this._normalizarDispositivo(anterior);
                dispositivo.setAttribute('data-tipo',
                    obterTipoValido(
                        anterior.getAttribute('data-tipo') as TipoDispositivoOuAgrupador | null ?? 'continuacao',
                        contexto.permissoes)
                );
                this._normalizarDispositivo(dispositivo.nextElementSibling);
            } catch (e) {
                dispositivo.setAttribute('data-tipo', TipoDispositivo.ARTIGO);
                console.error(e);
            }
        }

        if (dispositivo.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO) {
            this._normalizarParagrafo(dispositivo);
        }
    }

    /**
     * Normaliza o dispositivo que é ou foi um parágrafo.
     * Este método irá verificar a existência de parágrafo único, ajustando css.
     * 
     * @param dispositivo Parágrafo
     */
    private _normalizarParagrafo(dispositivo: Element): void {
        const anterior = encontrarDispositivoAnteriorDoTipo(dispositivo, [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO]);
        const posterior = encontrarDispositivoPosteriorDoTipo(dispositivo, [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO]);

        if (dispositivo.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO || dispositivo.getAttribute('data-tipo') === 'continuacao') {
            dispositivo.classList.toggle('unico',
                ((!anterior || anterior.getAttribute('data-tipo') !== TipoDispositivo.PARAGRAFO) &&
                    (!posterior || posterior.getAttribute('data-tipo') !== TipoDispositivo.PARAGRAFO)));

            if (anterior && anterior.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO) {
                anterior.classList.remove('unico');
            }

            if (posterior && posterior.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO) {
                posterior.classList.remove('unico');
            }

            // Se o parágrafo anterior é sem ordinal, então este também é.
            if (anterior && anterior.classList.contains('semOrdinal')) {
                dispositivo.classList.add('semOrdinal');
            } else {
                /* Se o parágrafo anterior tem ordinal, então vamos contar quantos parágrafos tem
                 * para decidir se este também deve ter. Esta contagem não é feita por artigo,
                 * pois é possível resolver esta questão usando CSS. No caso de parágrafo,
                 * a contagem de parágrafos usando o seletor ~ é influenciada por parágrafos
                 * de outros artigos.
                 */
                let i, aux;

                for (i = 1, aux = anterior; i < 10 && aux && aux.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO; i++) {
                    aux = encontrarDispositivoAnteriorDoTipo(aux, [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO]);
                }

                dispositivo.classList.toggle('semOrdinal', i >= 10);
            }
        } else if (anterior && anterior.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO && (!posterior || posterior.getAttribute('data-tipo') !== TipoDispositivo.PARAGRAFO)) {
            anterior.classList.add('unico');
        } else if ((!anterior || anterior.getAttribute('data-tipo') !== TipoDispositivo.PARAGRAFO) && posterior && posterior.getAttribute('data-tipo') === TipoDispositivo.PARAGRAFO) {
            this._normalizarParagrafo(posterior);
        }
    }

    /**
     * Verifica se o editor está focado.
     * 
     * @returns Verdadeiro, se o editor estiver com foco.
     */
    isFocused(): boolean {
        const activeElement = document.activeElement;
        return activeElement == this._elemento || this._elemento.contains(document.activeElement);
    }
}

/**
 * Obtém a seleção atual.
 * 
 * @returns Elemento selecionado.
 */
function obterSelecao(ctrl: EditorArticulacaoController): Element | null {
    const selecao = ctrl.getSelection();
    let range = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;

    if (range) {
        const startContainerNode = range ? range.startContainer : null;

        if (!startContainerNode) {
            return null;
        }

        let startContainer = startContainerNode.nodeType !== Node.ELEMENT_NODE || startContainerNode.nodeName === 'BR' ?
            obterElemento(startContainerNode.parentNode) : startContainerNode as Element;

        if (startContainer === ctrl._elemento) {
            let refazerSelecao = true;

            // A seleção deveria estar em algum dispositivo.
            if (!startContainer.firstElementChild || !startContainer.firstElementChild.hasAttribute('data-tipo')) {
                ctrl.limpar();
                startContainer = ctrl._elemento.firstElementChild;
            } else if (range.collapsed && range.startOffset === startContainer.childNodes.length) {
                // Se está no final do container da articulação, então vamos para o último elemento na hierarquia.
                do {
                    startContainer = startContainer.lastElementChild;
                } while (startContainer.lastElementChild);
            } else if (range.collapsed && range.startOffset === 0) {
                // Se está no início do container da articulação, então vamos para o primeiro elemento no último nível da hierarquia.
                do {
                    startContainer = startContainer.firstElementChild;
                } while (startContainer.firstElementChild);
            } else {
                refazerSelecao = false;
            }

            if (refazerSelecao) {
                selecao.removeAllRanges();
                range = document.createRange();
                range.setStart(startContainer, 0);
                selecao.addRange(range);
            }

            return startContainer;
        } else if (startContainer.compareDocumentPosition(ctrl._elemento) & Node.DOCUMENT_POSITION_CONTAINS) {
            // Garante que a seleção está dentro do editor de articulação.
            return startContainer;
        }
    }

    return null;
}

/**
 * Obtém um tipo válido, a partir de um tipo desejado.
 * 
 * @param {String} tipoDesejado 
 * @param {Object} permissoes Permissões do contexto atual.
 * @returns {String} Tipo válido.
 */
function obterTipoValido(tipoDesejado: TipoDispositivoOuAgrupador, permissoes: Permissoes): TipoDispositivoOuAgrupador {
    if (tipoDesejado && !permissoes[tipoDesejado]) {
        const novoTipo = {
            titulo: TipoAgrupador.CAPITULO,
            capitulo: TipoDispositivo.ARTIGO,
            secao: TipoDispositivo.ARTIGO,
            subsecao: TipoDispositivo.ARTIGO
        }[tipoDesejado as string];

        return obterTipoValido(novoTipo, permissoes);
    }

    return tipoDesejado || TipoDispositivo.ARTIGO;
}

/**
 * Substitui caracteres de código alto por códigos unicode.
 * Substitui entidades não suportadas no XML por códigos unicode.
 *
 * @param xml XML original.
 * @returns XML escapado.
 */
function escaparXml(xml: string): string {
    return xml.replace(/[\u00A0-\u9999]/gm, function (i) {
        return '&#' + i.charCodeAt(0) + ';';    // Converte em unicode escapado.
    });
}

function transformarEmEditor(elemento: HTMLElement, editorCtrl: EditorArticulacaoController, opcoes: IOpcoesEditorArticulacaoController) {
    const styleId = 'silegismg-editor-articulacao-style';
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = css.toString().replace(/\${(.+?)}/g, (m, valor) => (opcoes.rotulo as Record<string, string>)[valor]);

    /* Se houver suporte ao shadow-dom, então vamos usá-lo
     * para garantir o isolamento da árvore interna do componente
     * e possíveis problemas com CSS.
     */
    if (opcoes.shadowDOM && 'attachShadow' in elemento) {
        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = cssShadow.toString();

        const shadow = elemento.attachShadow({ mode: (typeof opcoes.shadowDOM === 'string' ? opcoes.shadowDOM : 'open') });

        editorCtrl.dispatchEvent = elemento.dispatchEvent.bind(elemento);

        // Firefox e Safari não têm suporte a getSelection no ShadowRoot
        if ('getSelection' in shadow && typeof shadow.getSelection === 'function') {
            editorCtrl.getSelection = shadow.getSelection.bind(shadow);
        }

        const novoElemento = document.createElement('div');
        novoElemento.contentEditable = opcoes.somenteLeitura ? 'false' : 'true';
        novoElemento.spellcheck = elemento.spellcheck;
        novoElemento.classList.add('silegismg-editor-articulacao');

        shadow.appendChild(style);
        shadow.appendChild(shadowStyle);
        shadow.appendChild(novoElemento);

        elemento.addEventListener('focus', () => novoElemento.focus());
        elemento.focus = function () { novoElemento.focus(); };

        return novoElemento;
    } else {
        elemento.contentEditable = opcoes.somenteLeitura ? 'false' : 'true';
        elemento.classList.add('silegismg-editor-articulacao');

        if (!document.getElementById(styleId)) {
            const head = document.querySelector('head');

            if (head) {
                head.appendChild(style);
            } else {
                document.body.appendChild(style);
            }
        }

        return elemento;
    }
}

export default EditorArticulacaoController;