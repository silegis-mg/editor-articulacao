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

import { expect, test } from './fixture';

test.describe('ClipboardController', function() {
    test('Única linha deve ser um nó textual', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('linha única');
        expect(fragmento).toBe('linha única');
    });

    test('Deve inserir a primeira linha em um TextNode e a segunda linha em P', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('linha 1\nlinha 2');
        expect(fragmento).toBe('linha 1<p data-tipo="artigo">linha 2</p>');
    });

    test('Deve inserir a primeira linha em um TextNode e a segunda e terceira linha em P', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('linha 1\nlinha 2\nlinha 3');
        expect(fragmento).toBe('linha 1<p data-tipo="artigo">linha 2</p><p data-tipo="artigo">linha 3</p>');
    });

    test('Deve interpretar artigos com incisos, alíneas e itens', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('Art. 1º - Artigo 1\nI - Inciso\na) Alínea\n1) Item\n2) Item 2\nb) Alínea b\nII - Inciso 2\nParágrafo único - Parágrafo\nI - Inciso do parágrafo\nArt. 2º - Artigo 2');
        expect(fragmento).toBe('<p data-tipo="artigo">Artigo 1</p><p data-tipo="inciso">Inciso</p><p data-tipo="alinea">Alínea</p><p data-tipo="item">Item</p><p data-tipo="item">Item 2</p><p data-tipo="alinea">Alínea b</p><p data-tipo="inciso">Inciso 2</p><p data-tipo="paragrafo" class="unico">Parágrafo</p><p data-tipo="inciso">Inciso do parágrafo</p><p data-tipo="artigo">Artigo 2</p>');
    });

    test('Deve interpretar artigos com texto anterior', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('final do anterior.\nArt. 2º - Artigo 2.');
        expect(fragmento).toBe('final do anterior.<p data-tipo="artigo">Artigo 2.</p>');
    });

    test('Deve inserir continuação sem interpretação', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('continuação.\nArt. 2º - Artigo 2.');
        expect(fragmento).toBe('continuação.<p data-tipo="artigo">Artigo 2.</p>');
    });

    test('Deve formatar automaticamente texto puro', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar('Enumeração:\nInciso:\nAlínea:\nItem;\nItem 2.\nAlínea 2.\nInciso 2.\nArtigo 2.\nArtigo 3.');
        expect(fragmento).toBe('Enumeração:<p data-tipo="inciso">Inciso:</p><p data-tipo="alinea">Alínea:</p><p data-tipo="item">Item;</p><p data-tipo="item">Item 2.</p><p data-tipo="alinea">Alínea 2.</p><p data-tipo="inciso">Inciso 2.</p><p data-tipo="artigo">Artigo 2.</p><p data-tipo="artigo">Artigo 3.</p>');
    });

    test('Deve corrigir formatação de parágrafo único', async function({ clipboardTransformar }) {
        const fragmento = await clipboardTransformar(`
            Art. 1º - Teste. 
            § 1º - Teste. 
            Art. 2º - Teste. 
            § 1º - Teste. 
            § 2º - Teste. 
            Art. 3º - Teste. 
        `);
        
        expect(fragmento).toBe('<p data-tipo="artigo">Teste.</p><p data-tipo="paragrafo" class="unico">Teste.</p><p data-tipo="artigo">Teste.</p><p data-tipo="paragrafo">Teste.</p><p data-tipo="paragrafo">Teste.</p><p data-tipo="artigo">Teste.</p><p data-tipo="continuacao"></p>');
    });
});