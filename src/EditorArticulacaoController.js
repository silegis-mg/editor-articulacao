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
import ContextoArticulacao from './ContextoArticulacao';
import adicionarTransformacaoAutomatica from './transformacaoAutomatica/transformacaoAutomatica';
import hackChrome from './hacks/chrome';
import hackIE from './hacks/ie';
import polyfill from './hacks/polyfill';
import importarDeLexML from './lexml/importarDeLexML';
import exportarParaLexML from './lexml/exportarParaLexML';
import { interpretarArticulacao } from './interpretadorArticulacao';
import ClipboardController from './ClipboardController';
import criarControleAlteracao from './ControleAlteracao';
import css from './editor-articulacao.css';
import cssShadow from './editor-articulacao-shadow.css';
import ArticulacaoInvalidaException from './lexml/ArticulacaoInvalidaException';
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo } from './util';
import ValidacaoController from './validacao/ValidacaoController';
import padrao from './opcoesPadrao';

var cssImportado = false;

/**
 * Controlador do editor de articulação.
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

        polyfill();

        let opcoesEfetivas = Object.create(padrao);
        Object.assign(opcoesEfetivas, opcoes);

        if (opcoes && opcoes.rotulo) {
            Object.setPrototypeOf(opcoesEfetivas.rotulo, padrao.rotulo);
        }

        this.opcoes = opcoesEfetivas;
        Object.freeze(opcoesEfetivas);
        Object.freeze(opcoesEfetivas.rotulo);
        Object.freeze(opcoesEfetivas.validacao);

        elemento = transformarEmEditor(elemento, this, opcoesEfetivas);

        Object.defineProperty(this, '_elemento', {
            value: elemento
        });

        this._handlers = [];

        this.limpar();

        if (!this.opcoes.somenteLeitura) {
            this._registrarEventos();

            if (opcoesEfetivas.transformacaoAutomatica) {
                adicionarTransformacaoAutomatica(this, elemento);
            }

            this.clipboardCtrl = new ClipboardController(this);
            this.controleAlteracao = criarControleAlteracao(this);
            this.validacaoCtrl = new ValidacaoController(this.opcoes.validacao);

            // Executa hack se necessário.
            if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                hackChrome(this);
            }

            if (/Trident\//.test(navigator.userAgent)) {
                hackIE(this);
            }
        }
    }

    /**
     * Dispara evento no DOM. Deve-se usar este método, pois caso seja utilizado
     * ShadowDOM, este método é substituído para propagação externa de evento.
     * 
     * @param {EventoInterno} eventoInterno 
     */
    dispatchEvent(eventoInterno) {
        this._elemento.dispatchEvent(eventoInterno.getCustomEvent());
    }

    getSelection() {
        return document.getSelection();
    }

    get vazio() {
        return !this._elemento.firstElementChild || this._elemento.firstElementChild === this._elemento.lastElementChild && this._elemento.textContent === '';
    }

    get lexml() {
        try {
            return this.vazio ? document.createDocumentFragment() : exportarParaLexML(this._elemento, this.opcoes.rotulo);
        } catch (e) {
            if (e instanceof ArticulacaoInvalidaException) {
                for (let filho = this._elemento.firstElementChild; filho; filho = filho.nextElementSibling) {
                    this._normalizarDispositivo(filho);
                }

                return exportarParaLexML(this._elemento);
            }

            throw e;
        }
    }

    set lexml(valor) {
        let articulacao = importarDeLexML(valor);

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

    limpar() {
        this._elemento.innerHTML = '<p data-tipo="artigo" style="min-height: 1em;"><br></p>';
    }

    get lexmlString() {
        var xml = this.lexml;
        var xmlSerializer = new XMLSerializer();
        var resultado = xmlSerializer.serializeToString(xml);

        return this.opcoes.escaparXML ? escaparXml(resultado) : resultado;
    }

    set lexmlString(valor) {
        this.lexml = valor;
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
        let eventos = ['focus', 'keyup', 'mousedown', 'touchstart', 'mouseup', 'touchend'];

        eventos.forEach(evento => this.registrarEventListener(evento, eventHandler));
        this.registrarEventListener('keydown', this._keyDownEventHandler.bind(this));

        let focusHandler = function () {
            if (!this._elemento.firstElementChild) {
                this.limpar();
            }
        }.bind(this);
        this.registrarEventListener('focus', focusHandler, true);

        this.registrarEventListener('blur', e => {
            if (!this.opcoes.somenteLeitura) {
                let contexto = this.contexto;

                if (contexto && contexto.cursor.dispositivo) {
                    this.validacaoCtrl.validar(this.contexto.cursor.dispositivo);
                }
            }
        });
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

    desregistrar() {
        this._handlers.forEach(registro => this._elemento.removeEventListener(registro.evento, registro.handler));
        this._handlers = [];
    }

    /**
     * Trata evento de alteração de cursor.
     */
    _cursorEventHandler(event) {
        this.atualizarContexto();
        this._normalizarContexto();

        if (event instanceof KeyboardEvent && event.key && event.key.length === 1 && this.contexto.cursor.dispositivo && this.contexto.cursor.dispositivo.hasAttribute('data-invalido')) {
            this.contexto.cursor.dispositivo.removeAttribute('data-invalido');
        }
    }

    _keyDownEventHandler(event) {
        if (!this.contexto || !this.contexto.cursor.elemento) {
            this._cursorEventHandler(event);
        }

        let elementoSelecionado = obterSelecao(this);

        if (!this.contexto || elementoSelecionado !== this.contexto.cursor.elemento) {
            this._cursorEventHandler(event);
        }
    }

    _normalizarContexto() {
        if (!this.contexto) {
            return;
        }

        let dispositivo = this.contexto.cursor.dispositivo;

        if (dispositivo) {
            this._normalizarDispositivo(dispositivo.previousElementSibling);
            this._normalizarDispositivo(dispositivo, this.contexto);
            this._normalizarDispositivo(dispositivo.nextElementSibling);

            if (!this.opcoes.somenteLeitura) {
                this.validacaoCtrl.validar(dispositivo.previousElementSibling);
                this.validacaoCtrl.validar(dispositivo.nextElementSibling);
            }
        }

        if (this.vazio) {
            this.limpar();
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
            this.limpar();
            elementoSelecionado = this._elemento.firstElementChild;

            let selecao = this.getSelection();
            selecao.removeAllRanges();
            let range = document.createRange();

            range.selectNodeContents(elementoSelecionado);
            selecao.addRange(range);
        }

        var novoCalculo = new ContextoArticulacao(this._elemento, elementoSelecionado);

        if (!this.contexto || this.contexto.cursor.elemento !== elementoSelecionado || this.contexto.comparar(novoCalculo)) {
            // Realiza a validação do cursor anterior.
            if (this.contexto && this.contexto.cursor.dispositivo && !this.opcoes.somenteLeitura) {
                this.validacaoCtrl.validar(this.contexto.cursor.dispositivo);
            }

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

        if (endContainer) {
            while (endContainer.nodeType !== Node.ELEMENT_NODE || !endContainer.hasAttribute('data-tipo')) {
                endContainer = endContainer.parentNode;
            }

            while (dispositivo !== endContainer) {
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
    _definirTipo(dispositivo, novoTipo) {
        let tipoAnterior = dispositivo.getAttribute('data-tipo');

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
     * @param {Element} dispositivo 
     * @param {ContextoArticulacao} contexto 
     */
    _normalizarDispositivo(dispositivo, contexto) {
        while (dispositivo && !dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentNode;
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
                dispositivo.setAttribute('data-tipo', obterTipoValido(anterior.getAttribute('data-tipo') || 'continuacao', contexto.permissoes));
                this._normalizarDispositivo(dispositivo.nextElementSibling);
            } catch (e) {
                dispositivo.setAttribute('data-tipo', 'artigo');
                console.error(e);
            }
        }

        if (dispositivo.getAttribute('data-tipo') === 'paragrafo') {
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

                for (i = 1, aux = anterior; i < 10 && aux && aux.getAttribute('data-tipo') === 'paragrafo'; i++) {
                    aux = encontrarDispositivoAnteriorDoTipo(aux, ['artigo', 'paragrafo']);
                }

                dispositivo.classList.toggle('semOrdinal', i >= 10);
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

        if (!startContainer) {
            return null;
        }

        if (startContainer.nodeType !== Node.ELEMENT_NODE || startContainer.nodeName === 'BR') {
            startContainer = startContainer.parentNode;
        }

        if (startContainer === ctrl._elemento) {
            // A seleção deveria estar em algum dispositivo.
            if (range.collapsed && range.startOffset === startContainer.childNodes.length) {
                // Se está no final do container da articulação, então vamos para o último elemento na hierarquia.
                do {
                    startContainer = startContainer.lastElementChild;
                } while (startContainer.lastElementChild);
            } else if (range.collapsed && range.startOffset === 0) {
                // Se está no início do container da articulação, então vamos para o primeiro elemento no último nível da hierarquia.
                do {
                    startContainer = startContainer.firstElementChild;
                } while (startContainer.firstElementChild);
            }

            return startContainer;
        } else {
            // Garante que a seleção está dentro do editor de articulação.
            for (let item = startContainer; item && item !== document.body; item = item.parentNode) {
                if (item === ctrl._elemento) {
                    return startContainer;
                }
            }
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
function obterTipoValido(tipoDesejado, permissoes) {
    if (tipoDesejado && !permissoes[tipoDesejado]) {
        return obterTipoValido({
            titulo: 'capitulo',
            capitulo: 'artigo',
            secao: 'artigo',
            subsecao: 'artigo'
        }[tipoDesejado], permissoes);
    }

    return tipoDesejado || 'artigo';
}

/**
 * Substitui caracteres de código alto por códigos unicode.
 * Substitui entidades não suportadas no XML por códigos unicode.
 *
 * @param {String} xml XML original.
 * @returns {String} XML escapado.
 */
function escaparXml(xml) {
    return xml.replace(/[\u00A0-\u9999]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';    // Converte em unicode escapado.
    });
}

function transformarEmEditor(elemento, editorCtrl, opcoes) {
    let style = document.createElement('style');
    style.innerHTML = css.toString().replace(/\${(.+?)}/g, (m, valor) => opcoes.rotulo[valor]);

    /* Se houver suporte ao shadow-dom, então vamos usá-lo
     * para garantir o isolamento da árvore interna do componente
     * e possíveis problemas com CSS.
     */
    if (opcoes.shadowDOM && 'attachShadow' in elemento) {
        let shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = cssShadow.toString();

        let shadow = elemento.attachShadow({ mode: (typeof opcoes.shadowDOM === 'string' ? opcoes.shadowDOM : 'open') });

        editorCtrl.dispatchEvent = elemento.dispatchEvent.bind(elemento);
        editorCtrl.getSelection = () => shadow.getSelection();

        let novoElemento = document.createElement('div');
        novoElemento.contentEditable = !opcoes.somenteLeitura;
        novoElemento.spellcheck = elemento.spellcheck;
        novoElemento.classList.add('silegismg-editor-articulacao');

        shadow.appendChild(style);
        shadow.appendChild(shadowStyle);
        shadow.appendChild(novoElemento);

        elemento.addEventListener('focus', focusEvent => novoElemento.focus());
        elemento.focus = function () { novoElemento.focus(); };

        return novoElemento;
    } else {
        elemento.contentEditable = !opcoes.somenteLeitura;
        elemento.classList.add('silegismg-editor-articulacao');

        if (!cssImportado) {
            let head = document.querySelector('head');

            if (head) {
                head.appendChild(style);
            } else {
                document.body.appendChild(style);
            }

            cssImportado = true;
        }

        return elemento;
    }
}

export default EditorArticulacaoController;