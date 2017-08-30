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

import importarDeLexML from '../src/lexml/importarDeLexML';
import exportarParaLexML from '../src/lexml/exportarParaLexML';
import interpretadorArticulacao from '../src/interpretadorArticulacao';
import { transformarTextoPuro, transformar } from '../src/ClipboardController';
import ValidacaoController from '../src/validacao/ValidacaoController';

window.importarDeLexML = importarDeLexML;
window.exportarParaLexML = exportarParaLexML;
window.interpretadorArticulacao = interpretadorArticulacao;
window.clipbaordControllerModule = {
    interpretarTextoPuro: transformarTextoPuro,
    transformar: transformar
};
window.ValidacaoController = ValidacaoController;