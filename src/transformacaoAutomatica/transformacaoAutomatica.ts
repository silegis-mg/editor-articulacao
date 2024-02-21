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

import ContextoArticulacao from '../ContextoArticulacao';
import EditorArticulacaoController from '../EditorArticulacaoController';
import AoFecharAspas from './transformacoes/AoFecharAspas';
import AoIniciarAspas from './transformacoes/AoIniciarAspas';
import DoisPontos from './transformacoes/DoisPontos';
import PontoFinal from './transformacoes/PontoFinal';
import RecuarComEnterEmDispositivoVazio from './transformacoes/RecuarComEnterEmDispositivoVazio';
import Transformacao from './transformacoes/Transformacao';

interface IHandler {
    sequencia: string;
    handler(elementoEditor: Element, ctrl: EditorArticulacaoController, contexto: ContextoArticulacao, sequencia: string, event: KeyboardEvent): void;
}

type Parser = { [ caracter: string ]: Parser } & { $handler?: IHandler[] };

/**
 * Adiciona a transformação automática ao editor de articulação.
 * 
 * @param {EditorArticulacaoController} editorArticulacaoCtrl 
 * @param {Element} elemento 
 */
function adicionarTransformacaoAutomatica(editorArticulacaoCtrl: EditorArticulacaoController, elemento: Element) {
    const parser: Parser = {};
    let estado: Parser[] = [];

    adicionarParser(parser, new DoisPontos());
    adicionarParser(parser, new PontoFinal());
    adicionarParser(parser, new AoIniciarAspas());
    adicionarParser(parser, new AoFecharAspas());
    adicionarParser(parser, new RecuarComEnterEmDispositivoVazio());

    editorArticulacaoCtrl.registrarEventListener('keypress', event => estado = processarEstado(event, parser, estado, editorArticulacaoCtrl, elemento));
    editorArticulacaoCtrl.registrarEventListener('mouseup', () => estado = []);
    editorArticulacaoCtrl.registrarEventListener('touchend', () => estado = []);
}

/**
 * Adiciona um transformador ao parser.
 * 
 * @param {Object} parser 
 * @param {Transformacao} transformador 
 */
function adicionarParser(parser: Parser, transformador: Transformacao) {
    transformador.sequencias.forEach(function(sequencia) {
        let i, pAtual = parser, c;
        const handler = transformador.transformar.bind(transformador);
        const mapa: Record<string, string> = {
            '\n': 'Enter'
        };

        for (i = 0; i < sequencia.length; i++) {
            c = sequencia.charAt(i);
            c = mapa[c] ?? c;

            if (!pAtual[c]) {
                pAtual[c] = {};
            }

            pAtual = pAtual[c];
        }

        const objHandler: IHandler = {
            sequencia: sequencia,
            handler: handler
        };

        if (pAtual.$handler) {
            pAtual.$handler.push(objHandler);
        } else {
            pAtual.$handler = [objHandler];
        }
    });
}

/**
 * Realiza o parsing da edição.
 */
function processarEstado(event: KeyboardEvent, _parser: Parser, _estadoParser: Parser[], controller: EditorArticulacaoController, elemento: Element) {
    const novoEstado = [], c = event.key;

    _estadoParser.forEach(function (estado) {
        if (estado[c]) {
            novoEstado.push(estado[c]);
        }
    });

    if (_parser[c]) {
        novoEstado.push(_parser[c]);
    }

    novoEstado.forEach(function (estado) {
        if (estado.$handler) {
            estado.$handler.forEach(objHandler => objHandler.handler(elemento, controller, controller.contexto, objHandler.sequencia.replace(/\r/g, '\n'), event));
        }
    });

    return novoEstado;
}

export default adicionarTransformacaoAutomatica;