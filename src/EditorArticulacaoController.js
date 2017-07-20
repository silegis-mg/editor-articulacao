import ContextoArticulacaoAtualizadoEvent from './eventos/ContextoArticulacaoAtualizadoEvent';
import ContextoArticulacao from './ContextoArticulacao';
import hackChrome from './hacks/chrome';

/**
 * Controlador do editor de articulação.
 */
class EditorArticulacaoController {

    /**
     * Elemento do DOM que será utilizado como editor de articulação.
     * 
     * @param {Element} elemento 
     */
    constructor(elemento) {
        if (!(elemento instanceof Element)) {
            throw 'Elemento não é um elemento do DOM.';
        }

        Object.defineProperty(this, '_elemento', {
            value: elemento
        });

        for (let filho = elemento.firstElementChild; filho; filho = filho.nextElementSibling) {
            this._normalizarDispositivo(filho);
        }

        this._registrarEventos();
        elemento.contentEditable = true;
    }

    /**
     * Adiciona tratamento de eventos no DOM, que pode ser removido em seguida
     * por meio do método "desregistrar".
     */
    _registrarEventos() {
        let eventHandler = this._cursorEventHandler.bind(this);
        let eventos = ['focus', 'keypress', 'keyup', 'mouseup', 'touchend'];

        if (this.desregistrar) {
            this.desregistrar();
        }

        eventos.forEach(evento => this._elemento.addEventListener(evento, eventHandler));

        this.desregistrar = function () {
            eventos.forEach(evento => this._elemento.removeEventListener(evento, eventHandler));
        }
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
        var selecao = obterSelecao();

        if (!selecao) {
            if (!this.contexto) {
                return;
            }

            selecao = this.contexto.cursor.elemento;
        }

        var novoCalculo = new ContextoArticulacao(this._elemento, selecao);

        if (!this.contexto || this.contexto.elemento !== selecao || this.contexto.comparar(novoCalculo)) {
            this.contexto = novoCalculo;
            this._elemento.dispatchEvent(new ContextoArticulacaoAtualizadoEvent(novoCalculo));
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
        let selecao = document.getSelection();
        let range = selecao && document.getSelection().rangeCount > 0 ? selecao.getRangeAt(0) : null;
        let endContainer = range ? range.endContainer : null;

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

            if (tipoAnterior === 'paragrafo') {
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
        if (!dispositivo) {
            return;
        }

        while (!dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentElement;
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

        if (dispositivo.getAttribute('data-tipo') === 'paragrafo') {
            dispositivo.classList.toggle('unico', ((!anterior || anterior.getAttribute('data-tipo') !== 'paragrafo') &&
                (!posterior || posterior.getAttribute('data-tipo') !== 'paragrafo')))

            if (anterior && anterior.getAttribute('data-tipo') === 'paragrafo') {
                anterior.classList.remove('unico');
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
function obterSelecao() {
    var selecao = document.getSelection();
    var range = selecao && document.getSelection().rangeCount > 0 ? selecao.getRangeAt(0) : null;
    var startContainer = range ? range.startContainer : null;

    if (!startContainer) {
        return null;
    }

    if (startContainer.nodeType !== Node.ELEMENT_NODE || startContainer.nodeName === 'BR') {
        startContainer = startContainer.parentElement;
    }

    return startContainer;
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

    return true;
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

// Executa hack se necessário.
if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
    hackChrome(EditorArticulacaoController);
}

export default EditorArticulacaoController;
