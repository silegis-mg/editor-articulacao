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
import { test, expect, Page } from './fixture';

test.describe('Validação', function () {
    test.describe('Validador de sentença única', function () {
        test('Único período deve ser válido.', async function ({ validar }) {
            const resultado = await validar('Esta é uma sentença única.');
            expect(resultado).toEqual([]);
        });

        test('Abreviação deve ser válida.', async function ({ validar }) {
            const resultado = await validar('Esta é um teste de citação do art. 5º da constituição.');
            expect(resultado).toEqual([]);
        });

        test('Dois períodos devem ser inválidos.', async function ({ validar }) {
            const resultado = await validar('Este é um teste. Este é outro.');
            expect(resultado).toEqual(['sentencaUnica']);
        });

        test('Dois períodos com abreviação no primeiro deve tornar artigo inválido.', async function ({ validar }) {
            const resultado = await validar('Este é um teste de citação do art. 5º da constituição. Este é outro.');
            expect(resultado).toEqual(['sentencaUnica']);
        });
    });
});