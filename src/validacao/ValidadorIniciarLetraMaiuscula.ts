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

import { TipoDispositivo } from '../TipoDispositivo';
import Validador from './Validador';

export default class ValidadorIniciarLetraMaiuscula extends Validador {
    constructor() {
        super([TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO], 'Artigos e parágrafos devem ser iniciados com letra maiúscula.');
    }

    validar(dispositivo: Element) {
        const texto = dispositivo.textContent.trim();

        return texto.charAt(0).toUpperCase() === texto.charAt(0);
    }
}
