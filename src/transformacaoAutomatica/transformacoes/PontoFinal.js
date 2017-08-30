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

import { TransformacaoDoProximo } from './Transformacao';

/**
 * Ao finalizar o dispositivo com ponto final (.) e o usuário
 * estiver no contexto de uma enumeração, então encerra-se ela,
 * transformando o próximo dispositivo em um nível anterior
 * (ex.: alínea para inciso).
 */
class PontoFinal extends TransformacaoDoProximo {
    constructor() {
        super('.\n');
    }

    get tipoTransformacao() {
        return 'PontoFinal';
    }

    proximoTipo(editor, ctrl, contexto) {
        return {
            get inciso() {
                let dispositivo = contexto.cursor.dispositivo;
                let tipo;

                do {
                    dispositivo = dispositivo.previousElementSibling;
                    tipo = dispositivo.getAttribute('data-tipo');
                } while (tipo !== 'artigo' && tipo !== 'paragrafo');

                return tipo;
            },
            alinea: 'inciso',
            item: 'alinea'
        }[contexto.cursor.tipo];
    }
}

export default PontoFinal;