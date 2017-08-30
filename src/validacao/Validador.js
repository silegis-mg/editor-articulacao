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
 * Classe abstrata para validar dispositivos.
 */
class Validador {
    /**
     * Constrói o validador.
     * 
     * @param {String[]} tipos Tipos de dispositivos que serão validados.
     * @param {String} descricao Descrição da validação.
     */
    constructor(tipos, descricao) {
        this.tipos = tipos instanceof Array ? new Set(tipos) : new Set([tipos]);
        this.descricao = descricao;
    }

    /**
     * Verifiac se o validador se aplica ao dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     */
    aplicaSeA(dispositivo) {
        return this.tipos.has(dispositivo.getAttribute('data-tipo'));
    }
    
    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {Boolean} Verdadeiro se o dispositivo estiver válido.
     */
    validar(dispositivo) {
        throw 'Não implementado.';
    }
}

export default Validador;