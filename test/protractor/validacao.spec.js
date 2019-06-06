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

const { $describe } = require('./utilitariosTeste');

$describe('Formatação do editor de articulação', it => {
    it('Deve validar todos os dispositivos ao colar', () => {
        browser.executeScript(function () {
            const selecao = this.getSelection();
            selecao.removeAllRanges();
            
            const range = document.createRange();
            range.selectNodeContents(document.querySelector('[contenteditable]').firstElementChild);
            selecao.addRange(range);

            let dataTrans = new DataTransfer();

            dataTrans.items.add('Primeira linha\nSegunda linha\nTerceira linha\nQuarta linha\nQuinta linha', 'text/plain');

            document.querySelector('[contenteditable]').dispatchEvent(new ClipboardEvent('paste', {
                clipboardData: dataTrans
            }));
        });

        expect(element.all(by.css('p[data-invalido]')).count()).toBe(4);
    })
});