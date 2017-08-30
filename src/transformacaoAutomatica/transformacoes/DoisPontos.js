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

import { TransformacaoDoProximo } from './Transformacao';

/**
 * Ao terminar um dispositivo com dois pontos (:), assume-se
 * que será feita uma enumeração e, portanto, transforma
 * o próximo dispositivo em inciso, alínea ou item, conforme
 * contexto.
 */
class DoisPontos extends TransformacaoDoProximo {
    constructor() {
        super(':\n');
    }

    get tipoTransformacao() {
        return 'DoisPontos';
    }

    proximoTipo(editor, ctrl, contexto) {
        return {
            artigo: 'inciso',
            inciso: 'alinea',
            alinea: 'item',
            paragrafo: 'inciso'
        }[contexto.cursor.tipo];
    }
}

export default DoisPontos;