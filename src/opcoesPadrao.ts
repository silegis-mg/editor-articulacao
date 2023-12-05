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

import IOpcoesEditorArticulacaoController from './IOpcoesEditorArticulacaoController';

/**
 * Definição padrão das opções do editor de articulação.
 */
const OPCOES_PADRAO: IOpcoesEditorArticulacaoController = {
    /**
     * Determina o escapamento de caracteres de código alto unicode durante a exportação
     * para lexmlString.
     */
    escaparXML: false,
    
    /**
     * Determina o sufixo para os rótulos dos dispositivos.
     */
    rotulo: {
        separadorArtigo: ' \u2013',
        separadorArtigoSemOrdinal: ' \u2013',
        separadorParagrafo: ' \u2013',
        separadorParagrafoSemOrdinal: ' \u2013',
        separadorParagrafoUnico: ' \u2013',
        separadorInciso: ' \u2013',
        separadorAlinea: ')',
        separadorItem: ')'
    },

    /**
     * Determina se deve adotar o Shadow DOM, se suportado pelo navegador.
     */
    shadowDOM: false,

    /**
     * Determina se deve permitir a edição, ou se o componente será somente para leitura.
     */
    somenteLeitura: false,

    /**
     * Determina se o editor de articulação deve aplicar transformação automática.
     */
    transformacaoAutomatica: true,

    /**
     * Determina se deve validar o conteúdo atribuído ao componente.
     */
    validarAoAtribuir: true,

    /**
     * Determina as validações que devem ocorrer.
     * Nenhuma validação ocorre se o editor for somente para leitura.
     */
    validacao: {
        /**
         * Determina se deve validar o uso de caixa alta.
         */
        caixaAlta: true,

        /**
         * Determina se deve validar o uso de aspas em citações.
         */
        citacao: true,

        /**
         * Determina se deve validar a presença de múltiplos elementos em uma enumeração.
         */
        enumeracaoElementos: true,

        /**
         * Determina se deve validar o uso de letra maiúscula no caput do artigo e em parágrafos.
         */
        inicialMaiuscula: true,

        /**
         * Determina se deve validar as pontuações.
         */
        pontuacao: true,

        /**
         * Determina se deve validar pontuação de enumeração.
         */
        pontuacaoEnumeracao: true,

        /**
         * Determina se deve exigir sentença única no dispositivo.
         */
        sentencaUnica: true
    }
};

export default OPCOES_PADRAO;