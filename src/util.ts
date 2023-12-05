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

import { TipoDispositivo, TipoDispositivoOuAgrupador } from './TipoDispositivo';

/**
 * Obtém o dispositivo anterior, de determinado tipo.
 * 
 * @param dispositivo 
 * @param pontosParada Tipos de dispositivos desejados.
 * @param pontosInterrupcao Tipos de dispositivos que, se encontrados, interromperá a obtenção, retornando nulo.
 * @returns Dispositivo, se encontrado, ou nulo.
 */
export function encontrarDispositivoAnteriorDoTipo(dispositivo: Element, pontosParada: TipoDispositivoOuAgrupador[], pontosInterrupcao: TipoDispositivoOuAgrupador[] = []): Element {
    while (!dispositivo.hasAttribute('data-tipo')) {
        dispositivo = dispositivo.parentElement!;
    }

    const setParada = new Set(pontosParada);
    const setInterrupcao = new Set(pontosInterrupcao);

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        const tipoAnterior = prev.getAttribute('data-tipo') as TipoDispositivoOuAgrupador;

        if (setParada.has(tipoAnterior)) {
            return prev;
        } else if (setInterrupcao.has(tipoAnterior)) {
            return null;
        }
    }

    return null;
}

/**
 * Obtém o dispositivo posterior, de determinado tipo.
 * 
 * @param dispositivo 
 * @param pontosParada Tipos de dispositivos desejados.
 * @param pontosInterrupcao Tipos de dispositivos que, se encontrados, interromperá a obtenção, retornando nulo.
 * @returns Dispositivo, se encontrado, ou nulo.
 */
export function encontrarDispositivoPosteriorDoTipo(elemento: Element, pontosParada: TipoDispositivoOuAgrupador[], pontosInterrupcao: TipoDispositivoOuAgrupador[] = []): Element {
    while (!elemento.hasAttribute('data-tipo')) {
        elemento = elemento.parentElement!;
    }

    const setParada = new Set(pontosParada);
    const setInterrupcao = new Set(pontosInterrupcao);

    for (let proximo = elemento.nextElementSibling; proximo; proximo = proximo.nextElementSibling) {
        const tipoProximo = proximo.getAttribute('data-tipo') as TipoDispositivoOuAgrupador;

        if (setParada.has(tipoProximo)) {
            return proximo;
        } else if (setInterrupcao.has(tipoProximo)) {
            return null;
        }
    }

    return null;
}

/**
 * Obtém os tipos de dispositivos em níveis superiores.
 * 
 * @param tipo Tipo cujos tipos superiores serão obtidos.
 */
export function getTiposSuperiores(tipo: TipoDispositivoOuAgrupador): TipoDispositivo[] {
    return {
        inciso: [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO],
        alinea: [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO, TipoDispositivo.INCISO],
        item: [TipoDispositivo.ARTIGO, TipoDispositivo.PARAGRAFO, TipoDispositivo.INCISO, TipoDispositivo.ALINEA]
    }[tipo as string] ?? [];
}

export function obterElemento(no: Node): Element {
    return no instanceof Element ? no : no.parentElement;
} 
