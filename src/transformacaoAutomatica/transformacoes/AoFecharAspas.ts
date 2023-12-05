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
import { TransformacaoDoProximo } from './Transformacao';

/**
 * Quando usuário encerra as aspas na continuação do caput de um artigo,
 * então cria-se um novo artigo.
 */
export default class AoFecharAspas extends TransformacaoDoProximo {
    constructor() {
        super('"\n', '".\n');
    }

    get tipoTransformacao() {
        return 'AoFecharAspas';
    }

    proximoTipo(editor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao) {
        return contexto.cursor.artigo && contexto.cursor.continuacao ? TipoDispositivo.ARTIGO : null;
    }
}
