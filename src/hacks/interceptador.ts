/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/ban-types */
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


/**
 * Intercepta um método após sua execução.
 * 
 * @param {Object} objeto Objeto ou classe a ser interceptada. Se o tipo for uma classe, a interceptação ocorrerá sobre o prototype.
 * @param {String} metodo Método a ser interceptado.
 * @param {function} interceptador Função interceptadora, que receberá o objeto, o valor retornado e os argumentos.
 */
export function interceptar<T extends object, K extends keyof T>(objeto: T, metodo: K, interceptador: (objeto: T, funcao: T[K], argumentos: IArguments) => void) {
    if (typeof objeto === 'function') {
        interceptar((objeto as Function).prototype, metodo, interceptador);
    } else {
        const metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw new Error('Método não encontrado: ' + metodo.toString());
        }

        if (typeof metodoOriginal !== 'function') {
            throw new Error(`${metodo.toString()} não é um método.`);
        }

        objeto[metodo] = function() {
            return interceptador(this, metodoOriginal, arguments);
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

/**
 * Intercepta um método após sua execução.
 * 
 * @param {Object} objeto Objeto ou classe a ser interceptada. Se o tipo for uma classe, a interceptação ocorrerá sobre o prototype.
 * @param {String} metodo Método a ser interceptado.
 * @param {function} interceptador Função interceptadora, que receberá o objeto, o valor retornado e os argumentos.
 */
export function interceptarApos<T extends object, K extends keyof T>(objeto: T, metodo: K, interceptador: (objeto: T, funcao: T[K], argumentos: IArguments) => void) {
    if (typeof objeto === 'function') {
        interceptarApos((objeto as Function).prototype, metodo, interceptador);
    } else {
        const metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw new Error('Método não encontrado: ' + metodo.toString());
        }

        if (typeof metodoOriginal !== 'function') {
            throw new Error(`${metodo.toString()} não é um método.`);
        }

        objeto[metodo] = function() {
            const resultado = (metodoOriginal as Function).apply(this, arguments);

            return interceptador(this, resultado, arguments);
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}
