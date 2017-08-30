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

import Transformacao from './Transformacao';

/**
 * Quando usuário der um enter em uma linha vazia, então
 * transforma-se o dispositivo para um nível anterior
 * (ex.: de alínea para inciso).
 */
class RecuarComEnterEmDispositivoVazio extends Transformacao {
    constructor() {
        super('\n');
    }

    get tipoTransformacao() {
        return 'RecuarComEnterEmDispositivoVazio';
    }

    /**
     * Efetua a transformação.
     * 
     * @param {Element} elementoEditor Elemento em que está o editor de articulação.
     * @param {EditorArticulacaoController} ctrl Controlador do editor.
     * @param {ContextoArticulacao} contexto Contexto atual.
     * @param {String} sequencia Sequência que disparou a transformação.
     * @param {KeyboardEvent} event Evento do teclado.
     */
    transformar(elementoEditor, ctrl, contexto, sequencia, event) {
        if (contexto.cursor.dispositivo.textContent.trim().length === 0) {
            let novoTipo = {
                item: 'alinea',
                alinea: 'inciso',
                get inciso() {
                    for (let dispositivo = contexto.cursor.dispositivoAnterior; dispositivo; dispositivo = dispositivo.previousElementSibling) {
                        let tipo = dispositivo.getAttribute('data-tipo');

                        if (tipo === 'artigo' || tipo === 'paragrafo') {
                            return tipo;
                        }
                    }

                    return 'artigo';
                }
            }[contexto.cursor.tipo] || 'artigo';

            ctrl.alterarTipoDispositivoSelecionado(novoTipo);
            event.preventDefault();
        }
    }
}

export default RecuarComEnterEmDispositivoVazio;