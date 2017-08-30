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
function interceptar(objeto, metodo, interceptador) {
    if (!objeto) throw 'Objeto não fornecido.';
    if (!metodo) throw 'Método não fornecido.';
    if (!interceptador) throw 'Interceptador não fornecido.';

    if (typeof objeto === 'function') {
        interceptar(objeto.prototype, metodo, interceptador);
    } else {
        let metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw 'Método não encontrado: ' + metodo;
        }

        objeto[metodo] = function() {
            return interceptador(this, metodoOriginal, arguments);
        };
    }
}

/**
 * Intercepta um método após sua execução.
 * 
 * @param {Object} objeto Objeto ou classe a ser interceptada. Se o tipo for uma classe, a interceptação ocorrerá sobre o prototype.
 * @param {String} metodo Método a ser interceptado.
 * @param {function} interceptador Função interceptadora, que receberá o objeto, o valor retornado e os argumentos.
 */
function interceptarApos(objeto, metodo, interceptador) {
    if (!objeto) throw 'Objeto não fornecido.';
    if (!metodo) throw 'Método não fornecido.';
    if (!interceptador) throw 'Interceptador não fornecido.';

    if (typeof objeto === 'function') {
        interceptarApos(objeto.prototype, metodo, interceptador);
    } else {
        let metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw 'Método não encontrado: ' + metodo;
        }

        objeto[metodo] = function() {
            var resultado = metodoOriginal.apply(this, arguments);

            return interceptador(this, resultado, arguments);
        };
    }
}

export { interceptar, interceptarApos };
export default {};