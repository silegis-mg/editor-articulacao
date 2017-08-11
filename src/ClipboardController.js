import { interceptarApos } from './hacks/interceptador';
import { interpretarArticulacao, transformarQuebrasDeLinhaEmP } from './interpretadorArticulacao';

/**
 * Controlador da área de transferência do editor de articulação.
 * 
 * @author Júlio César e Melo
 */
class ClipboardController {
    constructor(editorCtrl) {
        this.editorCtrl = editorCtrl;

        editorCtrl.registrarEventListener('paste', (event) => aoColar(event, this));
    }

    /**
     * Cola um texto de articulação no editor.
     * 
     * @param {String} texto 
     */
    colarTexto(texto) {
        let selecao = this.editorCtrl.getSelection();
        let range = selecao.getRangeAt(0);

        try {
            if (!range.collapsed) {
                range.deleteContents();
                this.editorCtrl.atualizarContexto();
            }

            for (let brs = (range.endContainer.nodeType === Node.TEXT_NODE ? range.endContainer.parentElement : range.endContainer).querySelectorAll('br'), i = 0; i < brs.length; i++) {
                brs[i].remove();
            }
        } finally {
            range.detach();
        }

        let fragmento = transformar(texto, this.editorCtrl.contexto.cursor.tipo, this.editorCtrl.contexto.cursor.continuacao);

        colarFragmento(fragmento, this.editorCtrl);
    }
}

/**
 * Transforma um texto em um fragmento a ser colado.
 * 
 * @param {*} texto Texto a ser transformado.
 * @param {*} tipo Tipo do contexto atual do cursor.
 * @param {*} continuacao Se o tipo é uma continuação.
 */
function transformar(texto, tipo, continuacao) {
    var fragmento;

    if (continuacao) {
        fragmento = transformarTextoPuro(texto, 'continuacao');
    } else {
        let dados = interpretarArticulacao(texto, 'json');

        if (dados.textoAnterior) {
            fragmento = transformarTextoPuro(dados.textoAnterior, tipo || 'artigo');
        }

        if (dados.articulacao.length > 0) {
            let fragmentoArticulacao = transformarArticulacao(dados.articulacao);

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
 * 
 * @param {ClipboardEvent} event 
 * @param {ClipboardController} clipboardCtrl 
 */
function aoColar(event, clipboardCtrl) {
    var clipboardData = event.clipboardData || window.clipboardData;
    var itens = clipboardData.items;

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
 * 
 * @param {DocumentFragment} fragmento 
 * @param {EditorArticulacaoController} editorCtrl 
 */
function colarFragmento(fragmento, editorCtrl) {
    prepararDesfazer(fragmento, editorCtrl);

    let proximaSelecao = fragmento.lastChild;
    let selecao = editorCtrl.getSelection();
    let range = selecao.getRangeAt(0);

    try {
        // Se a seleção estiver no container, então devemos inserir elementos filhos...
        if (range.collapsed && range.startContainer === editorCtrl._elemento) {
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
                let p = document.createElement('p');
                p.appendChild(item);
                p.setAttribute('data-tipo', 'artigo');
                fragmento.insertBefore(p, fragmento.firstElementChild);
            }

            range.insertNode(fragmento);
        } else {
            // Insere os primeiros nós textuais na própria seleção.
            for (let item = fragmento.firstChild; item && item.nodeType === Node.TEXT_NODE; item = fragmento.firstChild) {
                range.insertNode(item);
            }

            // Insere os elementos em seguida, pois não podem estar aninhados ao elemento da seleção.
            range.endContainer.parentElement.insertBefore(fragmento, range.endContainer.nextSibling);
        }
    } finally {
        range.detach();
    }

    // Altera a seleção.
    selecao.removeAllRanges();
    range = document.createRange();

    try {
        range.setStartAfter(proximaSelecao);
        selecao.addRange(range);
    } finally {
        range.detach();
    }
    
    editorCtrl.atualizarContexto();
}

/**
 * Realiza uma cópia do fragmento e monitora ctrl+z para remover fragmentos.
 * 
 * @param {DocumentFragment} fragmento 
 * @param {EditorArticulacaoController} editorCtrl 
 */
function prepararDesfazer(fragmento, editorCtrl) {
    var copia = [];

    for (let i = 0, l = fragmento.childNodes.length; i < l; i++) {
        copia.push(fragmento.childNodes[i]);
    }

    let desfazer = function() {
        let anterior = copia[0].previousSibling;
        let posterior = copia[copia.length - 1].nextSibling;

        // Remove os elementos
        for (let i = 0; i < copia.length; i++) {
            copia[i].remove();
        }

        removerListeners();

        // Restaura o cursor.
        let selecao = document.getSelection();
        let range = document.createRange();

        try {
            if (anterior) {
                range.setStartAfter(anterior);
                selecao.removeAllRanges();
                selecao.addRange(range);
            } else if (posterior) {
                range.setStartBefore(posterior);
                selecao.removeAllRanges();
                selecao.addRange(range);
            }
        } finally {
            range.detach();
        }
    }

    let keyDownListener = function(keyboardEvent) {
        // Desfaz se pressionar o ctrl+z
        if (keyboardEvent.ctrlKey && (keyboardEvent.key === 'z' || keyboardEvent.key === 'Z')) {
            desfazer();
            keyboardEvent.preventDefault();
        }
    }

    let bakExecCommand = document.execCommand;

    let removerListeners = function() {
        editorCtrl._elemento.removeEventListener('keydown', keyDownListener);
        editorCtrl._elemento.removeEventListener('keypress', removerListeners);
        document.execCommand = bakExecCommand;
    }

    editorCtrl._elemento.addEventListener('keydown', keyDownListener);
    editorCtrl._elemento.addEventListener('keypress', removerListeners);

    document.execCommand = function(comando) {
        if (comando === 'undo') {
            desfazer();
        } else {
            return bakExecCommand.apply(document, arguments);
        }
    }
}

/**
 * Insere texto simples no contexto atual.
 * 
 * @param {String} texto  Texto a ser interpretado.
 * @param {String} tipo Tipo atual.
 * @returns {DocumentFragment} Fragmento gerado para colagem.
 */
function transformarTextoPuro(texto, tipo) {
    if (texto.length === 0) {
        return;
    }

    var fragmento = document.createDocumentFragment();
    let primeiraQuebra = texto.indexOf('\n');

    if (primeiraQuebra !== 0) {
        /* A primeira linha deve ser inserida no dispositivo atual.
         * Para tanto, utiliza-se um TextNode.
         */
        let textNode = document.createTextNode(primeiraQuebra > 0 ? texto.substr(0, primeiraQuebra) : texto);
        fragmento.appendChild(textNode);
    }

    if (primeiraQuebra !== -1) {
        // Demais linhas devem ser criadas em novos parágrafos.
        let novoTexto = transformarQuebrasDeLinhaEmP(texto.substr(primeiraQuebra + 1));
        fragmento.appendChild(novoTexto);

        /**
         * Define o tipo para cada P, formatando automaticamente com base na terminação de dois pontos (:) ou ponto final(.).
         */
        let anterior = [];

        if (fragmento.firstChild.nodeType === Node.TEXT_NODE && fragmento.firstChild.textContent.endsWith(':')) {
            let enumeracao = novoTipoEnumeracao(tipo);

            if (tipo !== enumeracao) {
                anterior.push(tipo);
                tipo = enumeracao;
            }
        }

        for (let item = fragmento.firstElementChild; item; item = item.nextElementSibling) {
            item.setAttribute('data-tipo', tipo);

            if (item.textContent.endsWith(':')) {
                let enumeracao = novoTipoEnumeracao(tipo);

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

function novoTipoEnumeracao(tipoAtual) {
    switch (tipoAtual) {
        case 'artigo':
        case 'paragrafo':
            return 'inciso';

        case 'inciso':
            return 'alinea';

        case 'alinea':
            return 'item';

        default:
            return null;
    }
}

function transformarArticulacao(articulacao) {
    let fragmento = document.createDocumentFragment();

    articulacao.forEach(item => fragmento.appendChild(item.paraEditor()));

    return fragmento;
}

export { ClipboardController, transformarQuebrasDeLinhaEmP, transformarTextoPuro, transformar };
export default ClipboardController;