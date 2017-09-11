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

import html from './editor.html';
import EditorArticulacaoController from './EditorArticulacaoController';

/**
 * Transforma um elemento do DOM em um editor de articulação com
 * barra de ferramentas.
 */
class ComponenteEdicao {
    constructor(elemento, opcoes) {
        var container, botoes, containerBotoes, ctrl;

        /* Se houver suporte ao shadow-dom, então vamos usá-lo
         * para garantir o isolamento da árvore interna do componente
         * e possíveis problemas com CSS.
         */
        if (opcoes.shadowDOM && 'attachShadow' in elemento) {
            let shadow = elemento.attachShadow({ mode: (typeof opcoes.shadowDOM === 'string' ? opcoes.shadowDOM : 'open') });

            shadow.innerHTML = html.toString();

            container = shadow.querySelector('.silegismg-editor-conteudo');
            containerBotoes = shadow.querySelector('.silegismg-editor-botoes');
            botoes = containerBotoes.querySelectorAll('button[data-tipo-destino]');

            elemento.addEventListener('focus', focusEvent => container.focus());
            elemento.focus = function () { container.focus(); };
            elemento.ctrlArticulacao = this.ctrl = ctrl = new EditorArticulacaoController(container, opcoes);
        } else {
            elemento.innerHTML = html.toString();
            container = elemento.querySelector('.silegismg-editor-conteudo');
            containerBotoes = elemento.querySelector('.silegismg-editor-botoes');
            botoes = elemento.querySelectorAll('button[data-tipo-destino]');
            elemento.ctrlArticulacao = this.ctrl = ctrl = new EditorArticulacaoController(container, opcoes);
        }

        this.ctrl.dispatchEvent = eventoInterno => elemento.dispatchEvent(eventoInterno.getCustomEvent());

        function alterarDispositivo(event) {
            ctrl.alterarTipoDispositivoSelecionado(event.target.getAttribute('data-tipo-destino'));
            container.focus();
        }

        // Trata cliques nos botões de formatação.
        for (let i = 0; i < botoes.length; i++) {
            botoes[i].addEventListener('click', alterarDispositivo.bind(this));
        }

        /* Monitora atualização do contexto do usuário no editor de articulação,
         * controlando habilitação de botões de transformação de dispositivo.
         * 
         * A atualização é feita por meio do evento "contexto" no DOM.
         */
        elemento.addEventListener('contexto', function (evento) {
            /* Os botões de transformação de dispositivo só sõ habilitados se for possível
             * usar o dispositivo onde o cursor estiver.
             */
            for (let i = 0; i < botoes.length; i++) {
                botoes[i].disabled = !evento.detail.permissoes[botoes[i].getAttribute('data-tipo-destino')];
                botoes[i].classList.remove('atual');
            }

            let tipoAtual = containerBotoes.querySelector('button[data-tipo-destino="' + evento.detail.cursor.tipo + '"]');

            if (tipoAtual) {
                tipoAtual.classList.add('atual');
            }
        });

        elemento.addEventListener('scroll', function (evento) {
            containerBotoes.style.position = 'relative';
            containerBotoes.style.top = elemento.scrollTop + 'px';
        });
    }
}

export default ComponenteEdicao;