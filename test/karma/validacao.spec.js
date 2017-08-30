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

describe('Validação', function() {
    'use strict';
    
    var ctrl = new window.ValidacaoController({});

    function criarDispositivo(tipo, texto) {
        var dispositivo = document.createElement('p');

        dispositivo.setAttribute('data-tipo', tipo);
        dispositivo.textContent = texto;

        return dispositivo;
    }

    function testar(tipo, texto/*, ...erros*/) {
        var dispositivo = criarDispositivo(tipo, texto);
        var validacao = ctrl.validar(dispositivo);
        var erros = [];
        
        Array.prototype.push.apply(erros, arguments);

        erros.splice(0, 2);

        expect(validacao.length).toBe(erros.length);

        for (let i = 0; i < validacao.length; i++) {
            expect(validacao[i].tipo).toBe(erros[i]);
        }
    }

    describe('Validador de sentença única', function() {
        it ('Único período deve ser válido.', function() {
            testar('artigo', 'Esta é uma sentença única.')
        });

        it ('Abreviação deve ser válida.', function() {
            testar('artigo', 'Esta é um teste de citação do art. 5º da constituição.')
        });

        it ('Dois períodos devem ser inválidos.', function() {
            testar('artigo', 'Este é um teste. Este é outro.', 'sentencaUnica');
        });

        it ('Dois períodos com abreviação no primeiro deve tornar artigo inválido.', function() {
            testar('artigo', 'Este é um teste de citação do art. 5º da constituição. Este é outro.', 'sentencaUnica');
        });
    });
});