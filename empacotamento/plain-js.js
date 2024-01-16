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

/* Cria uma função global, chamada silegismgEditorArticulacao,
 * que permite transformar um DIV em um editor de articulação.
 * A função cria e retorna uma nova instância de EditorArticulacaoController.
 */

import ComponenteEdicao from '../src/ComponenteEdicao';
import EditorArticulacaoController from '../src/EditorArticulacaoController';
import * as interpretadorArticulacao from '../src/interpretadorArticulacao';

/**
 * Prepara um elemento do DOM como um editor de articulação.
 * 
 * @param {Element} elemento 
 */
export function criarControllerEditorArticulacao(elemento, opcoes) {
    elemento.ctrlArticulacao = new EditorArticulacaoController(elemento, opcoes);

    Object.defineProperty(elemento, 'lexml', {
        get: function () {
            return this.ctrlArticulacao.lexml;
        },
        set: function (valor) {
            this.ctrlArticulacao.lexml = valor;
        }
    });

    return elemento.ctrlArticulacao;
}

export function prepararEditorArticulacaoCompleto(elemento, opcoes) {
    elemento.componenteEdicao = new ComponenteEdicao(elemento, opcoes);

    Object.defineProperty(elemento, 'lexml', {
        get: function () {
            return this.componenteEdicao.ctrl.lexml;
        },
        set: function (valor) {
            this.componenteEdicao.ctrl.lexml = valor;
        }
    });

    return elemento.componenteEdicao;
}

window.silegismgEditorArticulacao = prepararEditorArticulacaoCompleto;
window.silegismgEditorArticulacaoController = criarControllerEditorArticulacao;
window.silegismgInterpretadorArticulacao = interpretadorArticulacao;
