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

import { TipoDispositivoOuAgrupador } from '../TipoDispositivo';

/**
 * Classe abstrata para validar dispositivos.
 */
export default abstract class Validador {

    private readonly tipos: Set<TipoDispositivoOuAgrupador>;

    /**
     * Constrói o validador.
     * 
     * @param {String[]} tipos Tipos de dispositivos que serão validados.
     * @param {String} descricao Descrição da validação.
     */
    constructor(tipos: TipoDispositivoOuAgrupador[], descricao: string);
    constructor(tipo: TipoDispositivoOuAgrupador, descricao: string);
    constructor(tipos: TipoDispositivoOuAgrupador[] | TipoDispositivoOuAgrupador, public readonly descricao: string) {
        this.tipos = tipos instanceof Array ? new Set(tipos) : new Set([tipos]);
    }

    /**
     * Verifica se o validador se aplica ao dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     */
    aplicaSeA(dispositivo: Element): boolean {
        return this.tipos.has(dispositivo.getAttribute('data-tipo') as TipoDispositivoOuAgrupador);
    }
    
    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {Boolean} Verdadeiro se o dispositivo estiver válido.
     */
    abstract validar(dispositivo: Element): boolean;
}
