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

import { TipoAgrupador, TipoDispositivo, TipoDispositivoOuAgrupador } from './TipoDispositivo';


class Cursor {
    /**
     * Normalmente, elemento === dispositivo. Entretanto, elementos de formatação,
     * tais como itálico ou negrito podem fazer com que o cursor esteja no elemento
     * de formatação, mas o dispositivo sempre será aquele que tem o atributo data-tipo.
     */
    readonly dispositivo: Element | null;
    readonly dispositivoReferencia: Element | null;
    readonly desconhecido: boolean;
    titulo = false;
    capitulo = false;
    secao = false;
    subsecao = false;
    artigo = false;
    continuacao = false;
    paragrafo = false;
    inciso = false;
    alinea = false;
    item = false;
    raiz = false;
    private _primeiroDoTipo?: boolean;
    private _dispositivoAnterior: Element;

    constructor(public readonly elemento: Element, private readonly elementoArticulacao: Element) {
        this.dispositivo = elemento;

        while (this.dispositivo && this.dispositivo !== elementoArticulacao && !this.dispositivo.hasAttribute('data-tipo')) {
            this.dispositivo = this.dispositivo.parentElement;
        }

        if (this.dispositivo === elementoArticulacao) {
            this.dispositivo = null;
        }

        this.dispositivoReferencia = this.dispositivo;

        while (this.dispositivoReferencia && this.dispositivoReferencia.getAttribute('data-tipo') === 'continuacao') {
            this.dispositivoReferencia = this.dispositivoReferencia.previousElementSibling;
            this.continuacao = true;
        }

        if (!this.dispositivoReferencia) {
            this.desconhecido = true;
        } else if (this.dispositivoReferencia === elementoArticulacao) {
            this.raiz = true;
            this.desconhecido = false;
        } else if (this.dispositivoReferencia.hasAttribute('data-tipo')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)[this.dispositivoReferencia.getAttribute('data-tipo')] = true;
            this.desconhecido = false;
        } else {
            this.desconhecido = true;
        }
    }

    get italico(): boolean { return this.elemento.tagName === 'I'; }

    get tipo(): TipoDispositivoOuAgrupador | 'desconhecido' {
        return this.dispositivo ? this.dispositivo.getAttribute('data-tipo') as TipoDispositivoOuAgrupador: 'desconhecido';
    }

    get primeiroDoTipo(): boolean {
        if (this._primeiroDoTipo === undefined) {
            this._primeiroDoTipo = this.dispositivo && verificarPrimeiroDoTipo(this.dispositivo);
        }

        return this._primeiroDoTipo;
    }

    get dispositivoAnterior(): Element | undefined {
        if (this._dispositivoAnterior === undefined) {
            if (this.continuacao) {
                this._dispositivoAnterior = this.dispositivoReferencia;
            } else if (this.dispositivoReferencia) {
                this._dispositivoAnterior = obterDispositivoAnterior(this.dispositivoReferencia, this.elementoArticulacao);
            }
        }

        return this._dispositivoAnterior;
    }

    get tipoAnterior(): TipoDispositivoOuAgrupador {
        return this.dispositivoAnterior?.getAttribute('data-tipo') as TipoDispositivoOuAgrupador;
    }
}

export type Permissoes = {
    [idx in (TipoDispositivoOuAgrupador | 'desconhecido')]: boolean;
}

/**
 * Representa o contexto do usuário no editor de articulação.
 * Possui dois atributos: cursor, contendo o contexto no cursor,
 * e as permissões de alteração de dispositivo na seleção.
 */
export default class ContextoArticulacao {
    public readonly cursor: Cursor;
    public readonly permissoes: Permissoes;
    
    constructor(elementoArticulacao: Element, dispositivo: Element) {
        const cursor = this.cursor = new Cursor(dispositivo !== elementoArticulacao ? dispositivo : null, elementoArticulacao);

        function possuiAnterior(dispositivo: Element, tipo: TipoDispositivoOuAgrupador) {
            /* Implementação falha/incompleta. Uma subseção deve existir depois de uma seção,
             * mas não deveria permitir capítulo + seção + artigo + capítulo + subseção.
             *
             * Cuidado pois esta implementação não pode ser cara!
             */
            return dispositivo && dispositivo.matches('p[data-tipo="' + tipo + '"] ~ *');
        }

        const anteriorAgrupador = this.cursor.tipoAnterior === TipoAgrupador.TITULO
            || this.cursor.tipoAnterior === TipoAgrupador.CAPITULO
            || this.cursor.tipoAnterior === TipoAgrupador.SECAO
            || this.cursor.tipoAnterior === TipoAgrupador.SUBSECAO;

        this.permissoes = {
            titulo: !anteriorAgrupador,
            capitulo: !anteriorAgrupador || this.cursor.tipoAnterior === TipoAgrupador.TITULO,
            get secao() {
                return (!anteriorAgrupador || cursor.tipoAnterior === TipoAgrupador.CAPITULO) && possuiAnterior(cursor.dispositivo, TipoAgrupador.CAPITULO);
            },
            get subsecao() {
                return (!anteriorAgrupador || cursor.tipoAnterior === TipoAgrupador.SECAO) && possuiAnterior(cursor.dispositivo, TipoAgrupador.SECAO);
            },
            artigo: true /*cursor.tipoAnterior !== TipoAgrupador.TITULO - No manual de redação parlamentar da ALMG, dá a entender que o título é um agrupamento de capítulos, mas a constituição possui Art 1º. logo após o título.*/,
            continuacao: this.cursor.tipoAnterior === TipoDispositivo.ARTIGO,
            inciso: this.cursor.tipoAnterior && !anteriorAgrupador && (!this.cursor.artigo || (this.cursor.artigo && !this.cursor.primeiroDoTipo)),
            paragrafo: this.cursor.tipoAnterior && !anteriorAgrupador && (!this.cursor.artigo || (this.cursor.artigo && (!this.cursor.primeiroDoTipo || this.cursor.continuacao))),
            alinea: (this.cursor.inciso && !this.cursor.primeiroDoTipo) || this.cursor.tipoAnterior === TipoDispositivo.INCISO || this.cursor.tipoAnterior === TipoDispositivo.ALINEA || this.cursor.tipoAnterior === 'item',
            item: (this.cursor.alinea && !this.cursor.primeiroDoTipo) || this.cursor.tipoAnterior === TipoDispositivo.ALINEA || this.cursor.tipoAnterior === 'item',
            desconhecido: false
        };

        Object.freeze(this);
        Object.freeze(this.cursor);
        Object.freeze(this.permissoes);
    }

    comparar(obj2: ContextoArticulacao) {
        for (const i in this.cursor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this.cursor as any)[i] !== (obj2.cursor as any)[i]) {
                return true;
            }
        }
       
        for (const i in this.permissoes) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this.permissoes as any)[i] !== (obj2.permissoes as any)[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determina se o contexto atual é válido.
     *
     * @returns {Boolean} Verdadeiro, se o contexto estiver válido.
     */
    get valido(): boolean {
        return this.permissoes[this.cursor.tipo];
    }
}

/**
 * Determina se o dispositivo é o primeiro do tipo.
 *
 * @param dispositivo
 * @returns Verdadeiro, se for o primeiro do tipo.
 */
function verificarPrimeiroDoTipo(dispositivo: Element): boolean {
    let tipo = dispositivo.getAttribute('data-tipo');

    if (!tipo) {
        return null;
    }

    while (tipo === 'continuacao') {
        dispositivo = dispositivo.previousElementSibling;
        tipo = dispositivo.getAttribute('data-tipo');
    }

    const pontosParagem = ({
        parte: [],
        livro: [],
        titulo: [],
        capitulo: [TipoAgrupador.TITULO],
        secao: [TipoAgrupador.CAPITULO, TipoAgrupador.TITULO],
        subsecao: [TipoAgrupador.SECAO, TipoAgrupador.CAPITULO, TipoAgrupador.TITULO],
        artigo: [],
        paragrafo: [TipoDispositivo.ARTIGO],
        inciso: [TipoDispositivo.PARAGRAFO, TipoDispositivo.ARTIGO],
        alinea: [TipoDispositivo.INCISO],
        item: [TipoDispositivo.ALINEA]
    })[tipo].reduce((prev, item) => {
        prev[item] = true;
        return prev;
    }, {});

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        const tipoAnterior = prev.getAttribute('data-tipo');

        if (tipoAnterior === tipo) {
            return false;
        } else if (pontosParagem[tipoAnterior]) {
            return true;
        }
    }

    return true;
}

/**
 * Obtém o tipo de dispositivo anterior.
 *
 * @returns Elemento do dispositivo anterior.
 */
function obterDispositivoAnterior(dispositivo: Element, elementoArticulacao: Element): Element | null {
    while (dispositivo && !dispositivo.hasAttribute('data-tipo') && dispositivo !== elementoArticulacao) {
        dispositivo = dispositivo.parentElement;
    }

    if (!dispositivo || dispositivo === elementoArticulacao) {
        return null;
    }

    for (let anterior = dispositivo.previousElementSibling; anterior; anterior = anterior.previousElementSibling) {
        if (anterior.hasAttribute('data-tipo')) {
            const tipo = anterior.getAttribute('data-tipo');

            if (tipo !== 'continuacao') {
                return anterior;
            }
        }
    }

    return null;
}
