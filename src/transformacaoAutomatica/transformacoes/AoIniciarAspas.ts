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
import TransformacaoAutomaticaEvent from '../../eventos/TransformacaoAutomaticaEvent';
import Transformacao from './Transformacao';

/**
 * Quando usuário cria um novo artigo e o inicia com aspas,
 * este é transformado em continuação do caput do artigo.
 */
export default class AoIniciarAspas extends Transformacao {
    constructor() {
        super('\n"');
    }

    get tipoTransformacao() {
        return 'AoIniciarAspas';
    }

    transformar(editor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao) {
        if (contexto.cursor.tipoAnterior === TipoDispositivo.ARTIGO) {
            ctrl.alterarTipoDispositivoSelecionado('continuacao');
            ctrl.dispatchEvent(new TransformacaoAutomaticaEvent(ctrl, TipoDispositivo.ARTIGO, 'continuacao', this.tipoTransformacao));
        }
    }
}
