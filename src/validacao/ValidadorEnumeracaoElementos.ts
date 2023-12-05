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

import Validador from './Validador';
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo, getTiposSuperiores } from '../util';
import { TipoDispositivo, TipoDispositivoOuAgrupador } from '../TipoDispositivo';

export default class ValidadorEnumeracaoElementos extends Validador {
    constructor() {
        super([TipoDispositivo.INCISO, TipoDispositivo.ALINEA, TipoDispositivo.ITEM], 'Enumerações devem possuir mais de um elemento.');
    }

    validar(dispositivo: Element) {
        const tipo = dispositivo.getAttribute('data-tipo') as TipoDispositivoOuAgrupador;
        const superiores = getTiposSuperiores(tipo);

        return !!encontrarDispositivoAnteriorDoTipo(dispositivo, [tipo], superiores)
            || !!encontrarDispositivoPosteriorDoTipo(dispositivo, [tipo], superiores);
    }
}
