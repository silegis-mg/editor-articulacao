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

test.describe('Formatação do editor de articulação', () => {
    test('Vários artigos', async ({ page, escrever, obterLexml }) => {
        await escrever('Primeiro.', true);
        await page.keyboard.press('Enter');
        await escrever('Segundo.', true);
        await page.keyboard.press('Enter');
        await escrever('Terceiro.', true);
        await page.keyboard.press('Enter');
        await escrever('Quarto.', true);
        await page.keyboard.press('Enter');
        await escrever('Quinto.', true);
        await page.keyboard.press('Enter');
        await escrever('Sexto.', true);
        await page.keyboard.press('Enter');
        await escrever('Sétimo.', true);
        await page.keyboard.press('Enter');
        await escrever('Oitavo.', true);
        await page.keyboard.press('Enter');
        await escrever('Nono.', true);
        await page.keyboard.press('Enter');
        await escrever('Dez.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro.</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo.</p></Caput></Artigo><Artigo id="art3"><Rotulo>Art. 3º –</Rotulo><Caput id="art3_cpt"><p>Terceiro.</p></Caput></Artigo><Artigo id="art4"><Rotulo>Art. 4º –</Rotulo><Caput id="art4_cpt"><p>Quarto.</p></Caput></Artigo><Artigo id="art5"><Rotulo>Art. 5º –</Rotulo><Caput id="art5_cpt"><p>Quinto.</p></Caput></Artigo><Artigo id="art6"><Rotulo>Art. 6º –</Rotulo><Caput id="art6_cpt"><p>Sexto.</p></Caput></Artigo><Artigo id="art7"><Rotulo>Art. 7º –</Rotulo><Caput id="art7_cpt"><p>Sétimo.</p></Caput></Artigo><Artigo id="art8"><Rotulo>Art. 8º –</Rotulo><Caput id="art8_cpt"><p>Oitavo.</p></Caput></Artigo><Artigo id="art9"><Rotulo>Art. 9º –</Rotulo><Caput id="art9_cpt"><p>Nono.</p></Caput></Artigo><Artigo id="art10"><Rotulo>Art. 10 –</Rotulo><Caput id="art10_cpt"><p>Dez.</p></Caput></Artigo></Articulacao>');
    });

    test('Ao digitar dois pontos, deve avançar o nível e recuar ao dar enter em linha vazia', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo:');
        await page.keyboard.press('Enter');
        await escrever('Este é um inciso:');
        await page.keyboard.press('Enter');
        await escrever('Esta é uma alínea:');
        await page.keyboard.press('Enter');
        await escrever('Este é um item.');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await escrever('Segundo artigo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>Este é um inciso:</p><Alinea id="art1_cpt_inc1_ali1"><Rotulo>a)</Rotulo><p>Esta é uma alínea:</p><Item id="art1_cpt_inc1_ali1_ite1"><Rotulo>1)</Rotulo><p>Este é um item.</p></Item></Alinea></Inciso></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Deve-se sair do inciso automaticamente quando for terminado com ponto final', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo:');
        await page.keyboard.press('Enter');
        await escrever('este é um inciso;');
        await page.keyboard.press('Enter');
        await escrever('este é outro inciso.');
        await page.keyboard.press('Enter');
        await escrever('Este é outro artigo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>este é um inciso;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II –</Rotulo><p>este é outro inciso.</p></Inciso></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Este é outro artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Quando houver apenas um parágrafo, deve formatar como parágrafo único', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo.');
        await page.keyboard.press('Enter');
        await escrever('Este é um parágrafo.');

        await page.getByText('Parágrafo', { exact: true }).click();

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo.</p></Caput><Paragrafo id="art1_par1u"><Rotulo>Parágrafo único –</Rotulo><p>Este é um parágrafo.</p></Paragrafo></Artigo></Articulacao>');
    });

    test('Quando houver dois parágrafos, a formatação deve ser numérica', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo.');
        await page.keyboard.press('Enter');

        await page.getByText('Parágrafo').click();

        await page.waitForTimeout(250);

        await escrever('Este é um parágrafo.');
        await page.keyboard.press('Enter');
        await escrever('Este é outro parágrafo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo.</p></Caput><Paragrafo id="art1_par1"><Rotulo>§ 1º –</Rotulo><p>Este é um parágrafo.</p></Paragrafo><Paragrafo id="art1_par2"><Rotulo>§ 2º –</Rotulo><p>Este é outro parágrafo.</p></Paragrafo></Artigo></Articulacao>');
    });

    test('Incisos podem estar no caput e em parágrafos', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo:');
        await page.keyboard.press('Enter');
        await escrever('Este é um inciso.');
        await page.keyboard.press('Enter');

        await page.getByText('Parágrafo').click();

        await page.waitForTimeout(250);

        await escrever('Este é um parágrafo:');
        await page.keyboard.press('Enter');
        await escrever('Este é o inciso do parágrafo.');
        await page.keyboard.press('Enter');
        await escrever('Este é outro parágrafo formatado automaticamente.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>Este é um inciso.</p></Inciso></Caput><Paragrafo id="art1_par1"><Rotulo>§ 1º –</Rotulo><p>Este é um parágrafo:</p><Inciso id="art1_par1_inc1"><Rotulo>I –</Rotulo><p>Este é o inciso do parágrafo.</p></Inciso></Paragrafo><Paragrafo id="art1_par2"><Rotulo>§ 2º –</Rotulo><p>Este é outro parágrafo formatado automaticamente.</p></Paragrafo></Artigo></Articulacao>');
    });

    test('Remoção de parágrafo deve mover inciso para caput.', async ({ page, escrever, obterLexml }) => {
        await escrever('Este é um artigo:');
        await page.keyboard.press('Enter');
        await escrever('este é um inciso;');
        await page.keyboard.press('Enter');

        await page.getByText('Parágrafo').click();

        await page.waitForTimeout(250);

        await escrever('Este é um parágrafo:');
        await page.keyboard.press('Enter');
        await escrever('este é o inciso do parágrafo.');

        for (let i = 'este é o inciso do parágrafo.'.length; i >= 0; i--) {
            await page.keyboard.press('ArrowLeft');
        }

        await page.keyboard.down('Shift');
        await page.keyboard.press('Home');
        await page.keyboard.up('Shift');

        await page.waitForTimeout(250);

        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');

        await page.waitForTimeout(250);

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Este é um artigo:</p><Inciso id="art1_cpt_inc1"><Rotulo>I –</Rotulo><p>este é um inciso;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II –</Rotulo><p>este é o inciso do parágrafo.</p></Inciso></Caput></Artigo></Articulacao>');
    });

    test('Deve ser possível escrever citação com única linha', async ({ page, escrever, obterLexml }) => {
        await escrever('Estou testando:');
        await page.keyboard.press('Enter');
        await escrever('"Esta é a única linha da citação.".');
        await page.keyboard.press('Enter');
        await escrever('Segundo artigo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Estou testando:</p><p>"Esta é a única linha da citação.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Deve ser possível escrever citação com dois parágrafos', async ({ page, escrever, obterLexml }) => {
        await escrever('Estou testando:');
        await page.keyboard.press('Enter');
        await escrever('"Esta é a primeira linha da citação.');
        await page.keyboard.press('Enter');
        await escrever('Esta é a segunda linha da citação.".');
        await page.keyboard.press('Enter');
        await escrever('Segundo artigo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Estou testando:</p><p>"Esta é a primeira linha da citação.</p><p>Esta é a segunda linha da citação.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Deve ser possível escrever citação com três parágrafos', async ({ page, escrever, obterLexml }) => {
        await escrever('Primeiro artigo:');
        await page.keyboard.press('Enter');
        await escrever('"Primeira linha.');
        await page.keyboard.press('Enter');
        await escrever('Segunda linha.');
        await page.keyboard.press('Enter');
        await escrever('Terceira linha.".');
        await page.keyboard.press('Enter');
        await escrever('Segundo artigo.');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro artigo:</p><p>"Primeira linha.</p><p>Segunda linha.</p><p>Terceira linha.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Deve ser possível quebrar linha dentro da citação', async ({ page, escrever, obterLexml }) => {
        await escrever('Primeiro artigo:');
        await page.keyboard.press('Enter');
        await escrever('"Primeira linha com segunda linha.');
        await page.keyboard.press('Enter');
        await escrever('Terceira linha.".');
        await page.keyboard.press('Enter');
        await escrever('Segundo artigo.');

        for (let i = 'segunda linha. Terceira linha.".Segundo artigo.'.length; i >= 0; i--) {
            await page.keyboard.press('ArrowLeft');
        }

        for (let i = ' com '.length; i > 0; i--) {
            await page.keyboard.press('Backspace');
        }

        await escrever('.');
        await page.keyboard.press('Enter');
        await escrever('S');
        await page.keyboard.press('Delete');

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Primeiro artigo:</p><p>"Primeira linha.</p><p>Segunda linha.</p><p>Terceira linha.".</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Segundo artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Botões contextuais devem alternar formatação', async ({ page, escrever, obterLexml }) => {
        await escrever('Artigo.');
        await page.keyboard.press('Enter');

        await page.getByText('Parágrafo').click();

        await page.waitForTimeout(250);

        await escrever('Parágrafo:');
        await page.keyboard.press('Enter');
        await escrever('Artigo.');

        await page.getByText('Artigo', { exact: true }).click();

        await page.waitForTimeout(250);

        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Artigo.</p></Caput><Paragrafo id="art1_par1u"><Rotulo>Parágrafo único –</Rotulo><p>Parágrafo:</p></Paragrafo></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('"Desfazer" não pode violar formatação', async ({ page, escrever, obterLexml }) => {
        await escrever('Teste.');
        await page.keyboard.press('Home');
        await page.keyboard.press('Enter');
        await page.getByText('Continuação').click();
        await page.keyboard.press('Control+Z');
        expect(await obterLexml()).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Teste.</p></Caput></Artigo></Articulacao>');
    });

});