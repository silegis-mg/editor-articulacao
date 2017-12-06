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

import { interceptar, interceptarApos } from './interceptador';

function hackIE(controller) {
    controller.limpar = function() {
        // IE 11 precisa de conteúdo dentro do elemento para que o mesmo ganhe foco e seja editável
        this._elemento.innerHTML = '<p data-tipo="artigo">&nbsp;</p>';
    };

    // Toggle do classList não funciona no IE 11
    // https://connect.microsoft.com/IE/Feedback/details/878564/
    interceptar(DOMTokenList.prototype, 'toggle', (classList, metodo, argumentos) => {
        if (argumentos.length === 1) {
            metodo.apply(classList, argumentos);
        } else if (argumentos[1]) {
            classList.add(argumentos[0]);
        } else {
            classList.remove(argumentos[0]);
        }
    });

    // Construtor do Set não recebe parâmetros no IE 11
    if (new Set([1, 2]).size === 0) {
        substituirSet();
    }

    // Garante sempre que o dispositivo tenha algum conteúdo, para evitar que o IE tenha um parágrafo não editável.
    interceptarApos(controller, '_normalizarDispositivo', function(controller, resultado, argumentos) {
        let dispositivo = argumentos[0];

        if (dispositivo && !dispositivo.firstElementChild && dispositivo.textContent === '') {
            dispositivo.innerHTML = '&nbsp;';
        }
    });
}

function substituirSet() {
    function substituirMetodo(metodo) {
        if (typeof SetNativo.prototype[metodo] === 'function') {
            window.Set.prototype[metodo] = function() { return this.$set[metodo].apply(this.$set, arguments); };
        }
    }

    let SetNativo = window.Set;

    window.Set = function(iteravel) {
        this.$set = new SetNativo();
        
        if (iteravel) {
            for (let i in iteravel) {
                this.$set.add(iteravel[i]);
            }
        }
    };

    let metodos = ['add', 'clear', 'delete', 'entries', 'forEach', 'has', 'keys', 'values', '@@iterator'];
    
    for (let i = 0; i < metodos.length; i++) {
        substituirMetodo(metodos[i]);
    }
}

export default hackIE;