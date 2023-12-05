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
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo } from '../util';
import { TipoDispositivo } from '../TipoDispositivo';

class ValidadorCitacao extends Validador {
    constructor() {
        super('continuacao', 'Citações devem estar entre aspas e terminar com ponto final (.).');
    }

    validar(dispositivo: Element) {
        const texto = dispositivo.textContent.trim();
        const inicio = seNulo(encontrarDispositivoAnteriorDoTipo(dispositivo, [TipoDispositivo.ARTIGO]), posterior => posterior.nextElementSibling, dispositivo);

        if (dispositivo === inicio) {
            return /^["“]/.test(texto);
        }

        const termino = seNulo(encontrarDispositivoPosteriorDoTipo(dispositivo, ['continuacao', TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO, TipoDispositivo.INCISO]),
            posterior => posterior.getAttribute('data-tipo') === 'continuacao' ? posterior : posterior.previousElementSibling,
            dispositivo);

        if (dispositivo === termino) {
            return /.+[”"]\.$/.test(texto);
        }

        // Se estamos no meio da citação, não devem haver aspas.
        return !/[“”"]/.test(texto);
    }
}

/**
 * Se o objeto não estiver nulo, então executa uma função consumidora deste objeto.
 * Caso o contrário, retorna um outro valor.
 * 
 * @param {*} obj Objeto a ser verificado.
 * @param {*} fnSeNaoNulo Função cujo resultado será retornado caso o objeto seja diferente de nulo.
 * @param {*} seNulo Valor retornado caso seja nulo.
 */
function seNulo<T, R>(obj: T, fnSeNaoNulo: (obj: T) => R, seNulo: R): R {
    return obj ? fnSeNaoNulo(obj) : seNulo;
}

export default ValidadorCitacao;