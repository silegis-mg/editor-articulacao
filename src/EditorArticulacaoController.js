import ContextoArticulacaoAtualizadoEvent from './eventos/ContextoArticulacaoAtualizadoEvent';
import ContextoArticulacao from './ContextoArticulacao';
import adicionarTransformacaoAutomatica from './transformacaoAutomatica/transformacaoAutomatica';
import hackChrome from './hacks/chrome';
import importarDeLexML from './lexml/importarDeLexML';
import exportarParaLexML from './lexml/exportarParaLexML';
import { interpretarArticulacao } from './interpretadorArticulacao';
import ClipboardController from './ClipboardController';
import criarControleAlteracao from './ControleAlteracao';
import css from './editor-articulacao.css';
import cssShadow from './editor-articulacao-shadow.css';

/**
 * Controlador do editor de articulação.
 * 
 * @author Júlio César e Melo
 */
class EditorArticulacaoController {

    /**
     * Elemento do DOM que será utilizado como editor de articulação.
     * 
     * @param {Element} elemento Elemento que receberá o editor de articulação.
     * @param {Object} opcoes Opções do editor de articulação:
     *      - {Boolean} shadowDOM: Utiliza shadow-dom, se disponível (padrão: true).
     */
    constructor(elemento, opcoes) {
        if (!(elemento instanceof Element)) {
            throw 'Elemento não é um elemento do DOM.';
        }

        elemento = transformarEmEditor(elemento, this, opcoes || {});

        Object.defineProperty(this, '_elemento', {
            value: elemento
        });

        this._handlers = [];

        // Realiza a normalização do conteúdo inicial, se houver.
        for (let filho = elemento.firstElementChild; filho; filho = filho.nextElementSibling) {
            this._normalizarDispositivo(filho);
        }

        this._registrarEventos();
        adicionarTransformacaoAutomatica(this, elemento);
        this.clipboardCtrl = new ClipboardController(this);
        this.controleAlteracao = criarControleAlteracao(this);

        // Executa hack se necessário.
        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
            hackChrome(this);
        }
    }

    dispatchEvent(evento) {
        this._elemento.dispatchEvent(evento);
    }

    getSelection() {
        return document.getSelection();
    }

    get lexml() {
        return exportarParaLexML(this._elemento);
    }

    set lexml(valor) {
        let articulacao = importarDeLexML(valor);

        this._elemento.innerHTML = '';
        this._elemento.appendChild(articulacao);

        this.controleAlteracao.alterado = false;
    }

    get alterado() {
        return this.controleAlteracao.alterado;
    }

    /**
     * Adiciona tratamento de eventos no DOM, que pode ser removido em seguida
     * por meio do método "desregistrar".
     */
    _registrarEventos() {
        let eventHandler = this._cursorEventHandler.bind(this);
        let eventos = ['focus', 'keypress', 'keyup', 'mouseup', 'touchend'];

        eventos.forEach(evento => this.registrarEventListener(evento, eventHandler));

        let focusHandler = function () {
            if (!this._elemento.firstElementChild) {
                this._elemento.innerHTML = '<p data-tipo="artigo"><br></p>';
            }
        }.bind(this);

        this.registrarEventListener('focus', focusHandler, true);
    }

    /**
     * Adiciona um tratamento de evento no elemento do editor no DOM.
     * 
     * @param {*} evento Evento a ser capturado.
     * @param {*} listener
     * @param {*} useCapture 
     */
    registrarEventListener(evento, listener, useCapture) {
        this._handlers.push({ evento: evento, handler: listener });
        this._elemento.addEventListener(evento, listener, useCapture);
    }

    _desregistrar() {
        this._handlers.forEach(registro => this._elemento.removeEventListener(registro.evento, registro.handler));
        this._handlers = [];
    }

    /**
     * Trata evento de alteração de cursor.
     */
    _cursorEventHandler() {
        this.atualizarContexto();

        if (!this.contexto) {
            return;
        }

        let dispositivo = this.contexto.cursor.dispositivo;

        if (dispositivo) {
            this._normalizarDispositivo(dispositivo.previousElementSibling);
            this._normalizarDispositivo(dispositivo, this.contexto);
            this._normalizarDispositivo(dispositivo.nextElementSibling);
        }
    }

    /**
     * Atualiza a variável de análise do contexto do cursor.
     */
    atualizarContexto() {
        var elementoSelecionado = obterSelecao(this);

        if (!elementoSelecionado) {
            if (!this.contexto) {
                return;
            }

            elementoSelecionado = this.contexto.cursor.elemento;
        }

        /* Se a seleção estiver no container e não houver nenhum conteúdo,
         * então devemos recriar o conteúdo mínimo.
         */
        if (elementoSelecionado === this._elemento && (!this._elemento.firstElementChild || this._elemento.firstElementChild === this._elemento.lastElementChild && this._elemento.firstElementChild.tagName === 'BR')) {
            this._elemento.innerHTML = '<p data-tipo="artigo"><br></p>';
            elementoSelecionado = this._elemento.firstElementChild;

            let selecao = this.getSelection();
            selecao.removeAllRanges();
            let range = document.createRange();

            try {
                range.selectNodeContents(elementoSelecionado);
                selecao.addRange(range);
            } finally {
                range.detach();
            }
        }

        var novoCalculo = new ContextoArticulacao(this._elemento, elementoSelecionado);

        if (!this.contexto || this.contexto.cursor.elemento !== elementoSelecionado || this.contexto.comparar(novoCalculo)) {
            this.contexto = novoCalculo;
            this.dispatchEvent(new ContextoArticulacaoAtualizadoEvent(novoCalculo));
        }

        return novoCalculo;
    }

    /**
     * Altera o tipo do dispositivo selecionado.
     * 
     * @param {String} novoTipo Novo tipo do dispositivo.
     */
    alterarTipoDispositivoSelecionado(novoTipo) {
        if (!this.contexto) {
            throw 'Não há contexto atual.';
        }

        if (!this.contexto.permissoes[novoTipo]) {
            throw 'Tipo não permitido: ' + novoTipo;
        }

        let dispositivo = this.contexto.cursor.dispositivo;

        this._definirTipo(dispositivo, novoTipo);

        // Se a seleção incluir mais de um dispositivo, vamos alterá-los também.
        let selecao = this.getSelection();
        let range = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;
        let endContainer = range ? range.endContainer : null;
        
        if (range) {
            range.detach();
        }

        while (endContainer.nodeType !== Node.ELEMENT_NODE || !endContainer.hasAttribute('data-tipo')) {
            endContainer = endContainer.parentElement;
        }

        while (dispositivo !== endContainer) {
            dispositivo = dispositivo.nextElementSibling;
            this._definirTipo(dispositivo, novoTipo);
        }
    }

    /**
     * Altera o tipo de um dispositivo, sem qualquer validação.
     * 
     * @param {Element} dispositivo 
     * @param {String} novoTipo 
     */
    _definirTipo(dispositivo, novoTipo) {
        let tipoAnterior = dispositivo.getAttribute('data-tipo');

        if (tipoAnterior !== novoTipo) {
            dispositivo.setAttribute('data-tipo', novoTipo);
            this._cursorEventHandler();

            if (tipoAnterior === 'paragrafo' || novoTipo === 'paragrafo') {
                this._normalizarParagrafo(dispositivo);
            }
        }
    }

    /**
     * Normaliza o dispositivo, corrigindo eventuais inconsistências.
     * 
     * @param {Element} dispositivo 
     * @param {ContextoArticulacao} contexto 
     */
    _normalizarDispositivo(dispositivo, contexto) {
        while (dispositivo && !dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentElement;
        }

        if (!dispositivo) {
            return;
        }

        if (!contexto) {
            contexto = new ContextoArticulacao(this._elemento, dispositivo);
        } else if (!(contexto instanceof ContextoArticulacao)) {
            throw 'Conexto não é instância de ContextoArticulacao.';
        }

        if (contexto && !contexto.permissoes[dispositivo.getAttribute('data-tipo')]) {
            try {
                let anterior = dispositivo.previousElementSibling;
                this._normalizarDispositivo(anterior);
                dispositivo.setAttribute('data-tipo', anterior.getAttribute('data-tipo') || 'continuacao');
                this._normalizarDispositivo(dispositivo.nextElementSibling);
            } catch (e) {
                dispositivo.setAttribute('data-tipo', 'artigo');
                console.error(e);
            }
        }

        if (contexto.cursor.paragrafo) {
            this._normalizarParagrafo(dispositivo);
        }
    }

    /**
     * Normaliza o dispositivo que é ou foi um parágrafo.
     * Este método irá verificar a existência de parágrafo único, ajustando css.
     * 
     * @param {Element} dispositivo Parágrafo
     */
    _normalizarParagrafo(dispositivo) {
        let anterior = encontrarDispositivoAnteriorDoTipo(dispositivo, ['artigo', 'paragrafo']);
        let posterior = encontrarDispositivoPosteriorDoTipo(dispositivo, ['artigo', 'paragrafo']);

        if (dispositivo.getAttribute('data-tipo') === 'paragrafo' || dispositivo.getAttribute('data-tipo') === 'continuacao') {

            dispositivo.classList.toggle('unico',
                ((!anterior || anterior.getAttribute('data-tipo') !== 'paragrafo') &&
                    (!posterior || posterior.getAttribute('data-tipo') !== 'paragrafo')));

            if (anterior && anterior.getAttribute('data-tipo') === 'paragrafo') {
                anterior.classList.remove('unico');
            }

            if (posterior && posterior.getAttribute('data-tipo') === 'paragrafo') {
                posterior.classList.remove('unico');
            }
        } else if (anterior && anterior.getAttribute('data-tipo') === 'paragrafo' && (!posterior || posterior.getAttribute('data-tipo') !== 'paragrafo')) {
            anterior.classList.add('unico');
        } else if ((!anterior || anterior.getAttribute('data-tipo') !== 'paragrafo') && posterior && posterior.getAttribute('data-tipo') === 'paragrafo') {
            this._normalizarParagrafo(posterior);
        }
    }
}

/**
 * Obtém a seleção atual.
 * 
 * @returns {Element} Elemento selecionado.
 */
function obterSelecao(ctrl) {
    var selecao = ctrl.getSelection();
    var range = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;

    if (range) {
        let startContainer = range ? range.startContainer : null;
        range.detach();

        if (!startContainer) {
            return null;
        }

        if (startContainer.nodeType !== Node.ELEMENT_NODE || startContainer.nodeName === 'BR') {
            startContainer = startContainer.parentElement;
        }

        return startContainer;
    } else {
        return null;
    }
}

/**
 * Obtém o dispositivo anterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} tipoDispositivoDesejado Tipos de dispositivos desejados.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 */
function encontrarDispositivoAnteriorDoTipo(dispositivo, tipoDispositivoDesejado) {
    while (!dispositivo.hasAttribute('data-tipo')) {
        dispositivo = dispositivo.parentElement;
    }

    let hashPontosParagem = tipoDispositivoDesejado.reduce((prev, item) => {
        prev[item] = true;
        return prev;
    }, {});

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        let tipoAnterior = prev.getAttribute('data-tipo');

        if (hashPontosParagem[tipoAnterior]) {
            return prev;
        }
    }

    return null;
}

/**
 * Obtém o dispositivo posterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} tipoDispositivoDesejado Tipos de dispositivos desejados.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 */
function encontrarDispositivoPosteriorDoTipo(elemento, pontoParada) {
    while (!elemento.hasAttribute('data-tipo')) {
        elemento = elemento.parentElement;
    }

    let hashParada = pontoParada.reduce((prev, item) => {
        prev[item] = true;
        return prev;
    }, {});

    for (let proximo = elemento.nextElementSibling; proximo; proximo = proximo.nextElementSibling) {
        if (hashParada[proximo.getAttribute('data-tipo')]) {
            return proximo;
        }
    }

    return null;
}

function transformarEmEditor(elemento, editorCtrl, opcoes) {
    let style = document.createElement('style');
    style.innerHTML = css.toString();

    /* Se houver suporte ao shadow-dom, então vamos usá-lo
     * para garantir o isolamento da árvore interna do componente
     * e possíveis problemas com CSS.
     */
    if (opcoes.shadowDOM !== false && 'attachShadow' in elemento) {
        let shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = cssShadow.toString();

       let shadow = elemento.attachShadow({ mode: 'closed' });

        editorCtrl.dispatchEvent = elemento.dispatchEvent.bind(elemento);
        editorCtrl.getSelection = () => shadow.getSelection();

        let novoElemento = document.createElement('div');
        novoElemento.contentEditable = true;
        novoElemento.classList.add('silegismg-articulacao');
        novoElemento.innerHTML = '<p data-tipo="artigo"><br></p>';

        shadow.appendChild(style);
        shadow.appendChild(shadowStyle);
        shadow.appendChild(novoElemento);

        elemento.addEventListener('focus', focusEvent => novoElemento.focus());

        return novoElemento;
    } else {
        elemento.contentEditable = true;
        elemento.classList.add('silegismg-articulacao');

        let head = document.querySelector('head');

        if (head) {
            head.appendChild(style);
        } else {
            document.body.appendChild(style);
        }
        
        return elemento;
    }
}

export default EditorArticulacaoController;
