export enum TipoDispositivo {
    ARTIGO = 'artigo',
    PARAGRAFO = 'paragrafo',
    INCISO = 'inciso',
    ALINEA = 'alinea',
    ITEM = 'item'
}

export enum TipoAgrupador {
    TITULO = 'titulo',
    CAPITULO = 'capitulo',
    SECAO = 'secao',
    SUBSECAO = 'subsecao'
}

export type TipoDispositivoOuAgrupador = TipoDispositivo | TipoAgrupador | 'continuacao';