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

describe('ClipboardController', function() {
    'use strict';

    describe('transformar', function() {
        var transformar = window.clipboardControllerModule.transformar;

        it('Única linha deve ser um nó textual', function() {
            var fragmento = transformar('linha única', 'artigo');

            expect(fragmento.childNodes.length).toBe(1);
            expect(fragmento.firstChild.nodeType).toBe(Node.TEXT_NODE);
            expect(fragmento.firstChild.textContent).toBe('linha única');
        });

        it('Deve inserir a primeira linha em um TextNode e a segunda linha em P', function() {
            var fragmento = transformar('linha 1\nlinha 2', 'artigo');

            expect(fragmento.childNodes.length).toBe(2);
            expect(fragmento.firstChild.nodeType).toBe(Node.TEXT_NODE);
            expect(fragmento.firstChild.textContent).toBe('linha 1');
            expect(fragmento.lastChild.outerHTML).toBe('<p data-tipo="artigo">linha 2</p>');
        });

        it('Deve inserir a primeira linha em um TextNode e a segunda e terceira linha em P', function() {
            var fragmento = transformar('linha 1\nlinha 2\nlinha 3', 'artigo');

            expect(fragmento.childNodes.length).toBe(3);
            expect(fragmento.firstChild.nodeType).toBe(Node.TEXT_NODE);
            expect(fragmento.firstChild.textContent).toBe('linha 1');
            expect(fragmento.firstElementChild.outerHTML).toBe('<p data-tipo="artigo">linha 2</p>');
            expect(fragmento.lastChild.outerHTML).toBe('<p data-tipo="artigo">linha 3</p>');
        });

        it('Deve interpretar artigos com incisos, alíneas e itens', function() {
            var fragmento = transformar('Art. 1º - Artigo 1\nI - Inciso\na) Alínea\n1) Item\n2) Item 2\nb) Alínea b\nII - Inciso 2\nParágrafo único - Parágrafo\nI - Inciso do parágrafo\nArt. 2º - Artigo 2', 'artigo', false);
            let container = document.createElement('div');
            container.appendChild(fragmento);

            expect(container.innerHTML).toBe('<p data-tipo="artigo">Artigo 1</p><p data-tipo="inciso">Inciso</p><p data-tipo="alinea">Alínea</p><p data-tipo="item">Item</p><p data-tipo="item">Item 2</p><p data-tipo="alinea">Alínea b</p><p data-tipo="inciso">Inciso 2</p><p data-tipo="paragrafo" class="unico">Parágrafo</p><p data-tipo="inciso">Inciso do parágrafo</p><p data-tipo="artigo">Artigo 2</p>');
        });

        it('Deve interpretar artigos com texto anterior', function() {
            var fragmento = transformar('final do anterior.\nArt. 2º - Artigo 2.', 'artigo', false);
            let container = document.createElement('div');
            container.appendChild(fragmento);

            expect(container.innerHTML).toBe('final do anterior.<p data-tipo="artigo">Artigo 2.</p>');
        });

        it('Deve inserir continuação sem interpretação', function() {
            var fragmento = transformar('continuação.\nArt. 2º - Artigo 2.', 'artigo', true);
            let container = document.createElement('div');
            container.appendChild(fragmento);

            expect(container.innerHTML).toBe('continuação.<p data-tipo="continuacao">Art. 2º - Artigo 2.</p>');
        });

        it('Deve formatar automaticamente texto puro', function() {
            var fragmento = transformar('Enumeração:\nInciso:\nAlínea:\nItem;\nItem 2.\nAlínea 2.\nInciso 2.\nArtigo 2.\nArtigo 3.', 'artigo', false);
            let container = document.createElement('div');
            container.appendChild(fragmento);

            expect(container.innerHTML).toBe('Enumeração:<p data-tipo="inciso">Inciso:</p><p data-tipo="alinea">Alínea:</p><p data-tipo="item">Item;</p><p data-tipo="item">Item 2.</p><p data-tipo="alinea">Alínea 2.</p><p data-tipo="inciso">Inciso 2.</p><p data-tipo="artigo">Artigo 2.</p><p data-tipo="artigo">Artigo 3.</p>');
        });

        it('Deve corrigir formatação de parágrafo único', function() {
            const fragmento = transformar(`
                Art. 1º - Teste. 
                § 1º - Teste. 
                Art. 2º - Teste. 
                § 1º - Teste. 
                § 2º - Teste. 
                Art. 3º - Teste. 
            `, false);
            
            const paragrafos = fragmento.querySelectorAll('p[data-tipo="paragrafo"]');

            expect(paragrafos[0].classList.contains('unico')).toBe(true);
            expect(paragrafos[1].classList.contains('unico')).toBe(false);
            expect(paragrafos[2].classList.contains('unico')).toBe(false);
        });
    });
});