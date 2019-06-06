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

module.exports = { $describe, escrever }

function $describe(texto, fn) {
    describe(texto, function () {
        var editor = element(by.id('articulacao'));
        var testes = 0, totalTestes = 0;

        function $it(descricao, funcao) {
            it(descricao, function () {
                testes++;

                browser.executeScript(function (texto) {
                    titulo.textContent = texto;
                }, `Teste ${testes}/${totalTestes}: ${descricao}`);

                funcao.apply(this, arguments);
            });

            totalTestes++;
        }

        beforeEach(function () {
            browser.actions()
                .mouseMove(editor)
                .click()
                .perform();
        });

        afterEach(function () {
            browser.executeScript(function () {
                ctrl.lexml = '<Articulacao></Articulacao>';
            });
        });

        fn($it);
    });
}
function escrever(buffer, rapido) {
    for (let i = 0; i < buffer.length; i++) {
        browser.actions().sendKeys(buffer[i]).perform();
        browser.sleep(25);
    }

    if (!rapido) {
        browser.sleep(1000);
    }
}
