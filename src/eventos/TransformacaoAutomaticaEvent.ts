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

import EditorArticulacaoController from '../EditorArticulacaoController';
import { TipoDispositivoOuAgrupador } from '../TipoDispositivo';
import EventoInterno from './EventoInterno';

/**
 * Evento de notificação de transformação automática ocorrida
 * em dispositivo.
 */
export default class TransformacaoAutomaticaEvent extends EventoInterno<IDetalhesTransformacaoAutomaticaEvent> {
    /**
     * Constrói o evento.
     * 
     * @param editorArticulacaoCtrl 
     */
    constructor(editorArticulacaoCtrl: EditorArticulacaoController, tipoAnterior: TipoDispositivoOuAgrupador | 'desconhecido', novoTipo: TipoDispositivoOuAgrupador, transformacao: unknown) { // TODO
        super('transformacao', {
            detail: {
                automatica: true,
                tipoAnterior: tipoAnterior,
                novoTipo: novoTipo,
                transformacao: transformacao,
                editorArticulacaoCtrl
            }
        });
    }
}

export interface IDetalhesTransformacaoAutomaticaEvent {
    automatica: true;
    tipoAnterior: TipoDispositivoOuAgrupador | 'desconhecido';
    novoTipo: TipoDispositivoOuAgrupador;
    transformacao: unknown; // TODO
    editorArticulacaoCtrl: EditorArticulacaoController;
}