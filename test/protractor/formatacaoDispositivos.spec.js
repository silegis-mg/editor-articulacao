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

const { $describe, escrever } = require('./utilitariosTeste');

$describe('Formatação do editor de articulação', function(it) {
    var editor = element(by.id('articulacao'));
    var resultado = element(by.id('lexml'));

    function finalizar() {
        browser.actions()
            .mouseMove(element(by.id('atualizar')))
            .click()
            .perform();
    }

    it('Vários artigos', function() {
        escrever('Primeiro.' + protractor.Key.ENTER, true);
        escrever('Segundo.' + protractor.Key.ENTER, true);
        escrever('Terceiro.' + protractor.Key.ENTER, true);
        escrever('Quarto.' + protractor.Key.ENTER, true);
        escrever('Quinto.' + protractor.Key.ENTER, true);
        escrever('Sexto.' + protractor.Key.ENTER, true);
        escrever('Sétimo.' + protractor.Key.ENTER, true);
        escrever('Oitavo.' + protractor.Key.ENTER, true);
        escrever('Nono.' + protractor.Key.ENTER, true);
        escrever('Dez.');
        
        finalizar();

        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro.</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo.</p></Caput></Artigo><Artigo id="art3"><Rotulo>Art. 3º –</Rotulo><Caput id="art3_cpt"><p>Terceiro.</p></Caput></Artigo><Artigo id="art4"><Rotulo>Art. 4º –</Rotulo><Caput id="art4_cpt"><p>Quarto.</p></Caput></Artigo><Artigo id="art5"><Rotulo>Art. 5º –</Rotulo><Caput id="art5_cpt"><p>Quinto.</p></Caput></Artigo><Artigo id="art6"><Rotulo>Art. 6º –</Rotulo><Caput id="art6_cpt"><p>Sexto.</p></Caput></Artigo><Artigo id="art7"><Rotulo>Art. 7º –</Rotulo><Caput id="art7_cpt"><p>Sétimo.</p></Caput></Artigo><Artigo id="art8"><Rotulo>Art. 8º –</Rotulo><Caput id="art8_cpt"><p>Oitavo.</p></Caput></Artigo><Artigo id="art9"><Rotulo>Art. 9º –</Rotulo><Caput id="art9_cpt"><p>Nono.</p></Caput></Artigo><Artigo id="art10"><Rotulo>Art. 10 –</Rotulo><Caput id="art10_cpt"><p>Dez.</p></Caput></Artigo></Articulacao>');
    });
    
    it('Ao digitar dois pontos, deve avançar o nível e recuar ao dar enter em linha vazia', function() {
        escrever('Este é um artigo:' + protractor.Key.ENTER);
        escrever('Este é um inciso:' + protractor.Key.ENTER);
        escrever('Esta é uma alínea:' + protractor.Key.ENTER);
        escrever('Este é um item.');
        escrever(protractor.Key.ENTER);
        escrever(protractor.Key.ENTER);
        escrever(protractor.Key.ENTER);
        escrever('Segundo artigo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>Este é um inciso:</p><Alinea id="art1_cpt_inc1_ali1"><Rotulo>a)</Rotulo><p>Esta é uma alínea:</p><Item id="art1_cpt_inc1_ali1_ite1"><Rotulo>1)</Rotulo><p>Este é um item.</p></Item></Alinea></Inciso></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });
    
     it('Deve-se sair do inciso automaticamente quando for terminado com ponto final', function() {
        escrever('Este é um artigo:' + protractor.Key.ENTER);
        escrever('este é um inciso;' + protractor.Key.ENTER);
        escrever('este é outro inciso.' + protractor.Key.ENTER);
        escrever('Este é outro artigo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>este é um inciso;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II –</Rotulo><p>este é outro inciso.</p></Inciso></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Este é outro artigo.</p></Caput></Artigo></Articulacao>');
    });
    
    it('Quando houver apenas um parágrafo, deve formatar como parágrafo único', function() {
        escrever('Este é um artigo.' + protractor.Key.ENTER);
        escrever('Este é um parágrafo.');

        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="paragrafo"]')))
            .click()
            .perform();
    
        finalizar();
        
            expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo.</p></Caput><Paragrafo id="art1_par1u"><Rotulo>Parágrafo único –</Rotulo><p>Este é um parágrafo.</p></Paragrafo></Artigo></Articulacao>');
    });
    
    it('Quando houver dois parágrafos, a formatação deve ser numérica', function() {
        escrever('Este é um artigo.' + protractor.Key.ENTER);
        
        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="paragrafo"]')))
            .click()
            .perform();
    
        browser.sleep(250);
        
        escrever('Este é um parágrafo.' + protractor.Key.ENTER);
        escrever('Este é outro parágrafo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo.</p></Caput><Paragrafo id="art1_par1"><Rotulo>§ 1º –</Rotulo><p>Este é um parágrafo.</p></Paragrafo><Paragrafo id="art1_par2"><Rotulo>§ 2º –</Rotulo><p>Este é outro parágrafo.</p></Paragrafo></Artigo></Articulacao>');
    });
    
    it('Incisos podem estar no caput e em parágrafos', function() {
        escrever('Este é um artigo:' + protractor.Key.ENTER);
        escrever('Este é um inciso.' + protractor.Key.ENTER);

        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="paragrafo"]')))
            .click()
            .perform();

        browser.sleep(250);
        
        escrever('Este é um parágrafo:' + protractor.Key.ENTER);
        escrever('Este é o inciso do parágrafo.' + protractor.Key.ENTER);
        escrever('Este é outro parágrafo formatado automaticamente.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>Este é um inciso.</p></Inciso></Caput><Paragrafo id="art1_par1"><Rotulo>§ 1º –</Rotulo><p>Este é um parágrafo:</p><Inciso id="art1_par1_inc1"><Rotulo>I –</Rotulo><p>Este é o inciso do parágrafo.</p></Inciso></Paragrafo><Paragrafo id="art1_par2"><Rotulo>§ 2º –</Rotulo><p>Este é outro parágrafo formatado automaticamente.</p></Paragrafo></Artigo></Articulacao>');
    });

    it('Remoção de parágrafo deve mover inciso para caput.', function() {
        escrever('Este é um artigo:' + protractor.Key.ENTER);
        escrever('este é um inciso;' + protractor.Key.ENTER);

        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="paragrafo"]')))
            .click()
            .perform();

        browser.sleep(250);
        
        escrever('Este é um parágrafo:' + protractor.Key.ENTER);
        escrever('este é o inciso do parágrafo.');

        for (let i = 'este é o inciso do parágrafo.'.length; i >= 0; i--) {
            escrever(protractor.Key.LEFT, true);
        }

        browser.actions().keyDown(protractor.Key.SHIFT)
            .sendKeys(protractor.Key.HOME)
            .keyUp(protractor.Key.SHIFT)
            .perform();

        browser.sleep(250);

        browser.actions().sendKeys(protractor.Key.BACK_SPACE).sendKeys(protractor.Key.BACK_SPACE).perform();

        browser.sleep(250)

        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>este é um inciso;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II –</Rotulo><p>este é o inciso do parágrafo.</p></Inciso></Caput></Artigo></Articulacao>');
    });

    it('Deve ser possível escrever citação com única linha', function() {
        escrever('Estou testando:' + protractor.Key.ENTER);
        escrever('"Esta é a única linha da citação.".' + protractor.Key.ENTER);
        escrever('Segundo artigo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Estou testando:</p><p>"Esta é a única linha da citação.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });
    
    it('Deve ser possível escrever citação com dois parágrafos', function() {
        escrever('Estou testando:' + protractor.Key.ENTER);
        escrever('"Esta é a primeira linha da citação.' + protractor.Key.ENTER);
        escrever('Esta é a segunda linha da citação.".' + protractor.Key.ENTER);
        escrever('Segundo artigo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Estou testando:</p><p>"Esta é a primeira linha da citação.</p><p>Esta é a segunda linha da citação.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });
    
    it('Deve ser possível escrever citação com três parágrafos', function() {
        escrever('Primeiro artigo:' + protractor.Key.ENTER);
        escrever('"Primeira linha.' + protractor.Key.ENTER);
        escrever('Segunda linha.' + protractor.Key.ENTER);
        escrever('Terceira linha.".' + protractor.Key.ENTER);
        escrever('Segundo artigo.');
        
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro artigo:</p><p>"Primeira linha.</p><p>Segunda linha.</p><p>Terceira linha.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    it('Deve ser possível quebrar linha dentro da citação', function() {
        escrever('Primeiro artigo:' + protractor.Key.ENTER);
        escrever('"Primeira linha com segunda linha.' + protractor.Key.ENTER);
        escrever('Terceira linha.".' + protractor.Key.ENTER);
        escrever('Segundo artigo.');
        
        for (let i = 'segunda linha. Terceira linha.".Segundo artigo.'.length; i >= 0; i--) {
            escrever(protractor.Key.LEFT, true);
        }
        
        for (let i = ' com '.length; i > 0; i--) {
            escrever(protractor.Key.BACK_SPACE, true);
        }
        
        escrever('.' + protractor.Key.ENTER);
        escrever('S' + protractor.Key.DELETE);

        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro artigo:</p><p>"Primeira linha.</p><p>Segunda linha.</p><p>Terceira linha.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    it('Botões contextuais devem alternar formatação', function() {
        escrever('Artigo.' + protractor.Key.ENTER);

        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="paragrafo"]')))
            .click()
            .perform();

        browser.sleep(250);

        escrever('Parágrafo:' + protractor.Key.ENTER);
        escrever('Artigo.');

        browser.actions()
            .mouseMove(element(by.css('button[data-tipo-destino="artigo"]')))
            .click()
            .perform();
    
        browser.sleep(250);
    
        finalizar();
        
        expect(resultado.getText()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Artigo.</p></Caput><Paragrafo id="art1_par1u"><Rotulo>Parágrafo único –</Rotulo><p>Parágrafo:</p></Paragrafo></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Artigo.</p></Caput></Artigo></Articulacao>');
    });

});