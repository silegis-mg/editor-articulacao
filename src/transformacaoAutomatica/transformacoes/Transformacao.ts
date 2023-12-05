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
import { TipoDispositivoOuAgrupador } from '../../TipoDispositivo';
import TransformacaoAutomaticaEvent from '../../eventos/TransformacaoAutomaticaEvent';

/**
 * Definição abstrata de uma transformação a ser realizada na
 * seleção da articulação.
 */
export default abstract class Transformacao {
    readonly sequencias: string[];

    constructor(...sequencias: string[]) {
        this.sequencias = [];

        for (const sequencia of sequencias) {
            this.sequencias.push(sequencia);

            if (sequencia.indexOf('\n') >= 0) {
                this.sequencias.push(sequencia.replace(/\n/g, '\r'));
            }
        }
    }

    get tipoTransformacao() {
        // Deve-se sobrescrever este getter, pois na minificação de js, perde-se o nome do construtor!
        return this.constructor.name;
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
    abstract transformar(elementoEditor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao, sequencia: string, event: KeyboardEvent): void;
}

/**
 * Definição abstrata de uma transformação a ser realizada no
 * próximo dispositivo selecionado, após o disparo do evento
 * 'keyup'. Útil para transformações a ser executadas após
 * a criação de um novo dispositivo.
 */
export abstract class TransformacaoDoProximo extends Transformacao {
    transformar(editor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao) {
        const novoTipo = this.proximoTipo(editor, ctrl, contexto);

        if (novoTipo) {
            onKeyUp(editor, () => {
                const tipoAnterior = ctrl.contexto.cursor.tipo;
                ctrl.alterarTipoDispositivoSelecionado(novoTipo);
                ctrl.dispatchEvent(new TransformacaoAutomaticaEvent(ctrl, tipoAnterior, novoTipo, this.tipoTransformacao));
            });
        }
    }

    abstract proximoTipo(editor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao): TipoDispositivoOuAgrupador | null;
}

export type MapaTransformacao = { [tipo in TipoDispositivoOuAgrupador | 'desconhecido']?: TipoDispositivoOuAgrupador | null };

function onKeyUp(editor: Element, callback: () => void) {
    editor.addEventListener('keyup', callback, { once: true });
}
