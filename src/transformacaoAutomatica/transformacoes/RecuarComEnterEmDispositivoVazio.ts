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

import ContextoArticulacao from '../../ContextoArticulacao';
import EditorArticulacaoController from '../../EditorArticulacaoController';
import { TipoDispositivo } from '../../TipoDispositivo';
import Transformacao, { MapaTransformacao } from './Transformacao';

/**
 * Quando usuário der um enter em uma linha vazia, então
 * transforma-se o dispositivo para um nível anterior
 * (ex.: de alínea para inciso).
 */
export default class RecuarComEnterEmDispositivoVazio extends Transformacao {
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
    transformar(elementoEditor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao, sequencia: string, event: KeyboardEvent): void {
        if (contexto.cursor.dispositivo.textContent.trim().length === 0) {
            const mapa: MapaTransformacao = {
                item: TipoDispositivo.ALINEA,
                alinea: TipoDispositivo.INCISO,
                get inciso() {
                    for (let dispositivo = contexto.cursor.dispositivoAnterior; dispositivo; dispositivo = dispositivo.previousElementSibling) {
                        const tipo = dispositivo.getAttribute('data-tipo');

                        if (tipo === TipoDispositivo.ARTIGO || tipo === TipoDispositivo.PARAGRAFO) {
                            return tipo;
                        }
                    }

                    return TipoDispositivo.ARTIGO;
                }
            };
            const novoTipo = mapa[contexto.cursor.tipo] || TipoDispositivo.ARTIGO;

            ctrl.alterarTipoDispositivoSelecionado(novoTipo);
            event.preventDefault();
        }
    }
}