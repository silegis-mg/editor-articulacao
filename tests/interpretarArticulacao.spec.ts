/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as parser from '../src/interpretadorArticulacao';

test.describe('Parser de articulação', function () {
    function novo(tipo: typeof parser.Dispositivo, obj: any): parser.Dispositivo;
    function novo(tipo: typeof parser.Dispositivo, obj: Array<any>): parser.Dispositivo[];
    function novo(tipo: typeof parser.Dispositivo, obj: any | Array<any>): parser.Dispositivo | parser.Dispositivo[] {
        if (obj instanceof Array) {
            return obj.map(o => novo(tipo, o));
        } else {
            const novoObj = new (tipo as any)(obj.numero, obj.descricao);

            (obj.incisos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Inciso, i)));
            (obj.paragrafos || []).forEach((i: any) => novoObj.adicionar(novo(parser.Paragrafo, i)));
            (obj.alineas || []).forEach((i: any) => novoObj.adicionar(novo(parser.Alinea, i)));
            (obj.itens || []).forEach((i: any) => novoObj.adicionar(novo(parser.Item, i)));

            return novoObj;
        }
    }

    test('Interpretação de articulação', function () {
        const texto = 'Art. 1º - Teste 1:\nI - inciso do artigo;\nII - segundo inciso:\na) alínea do inciso:\n1) item da alínea;\n2) outro item.\nb) outra alínea.\nIII - último inciso.\nParágrafo Único - Parágrafo:\nI - inciso do parágrafo.\nArt. 2º - Outro artigo.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Teste 1:',
                    incisos: [
                        {
                            numero: 'I',
                            descricao: 'inciso do artigo;'
                        }, {
                            numero: 'II',
                            descricao: 'segundo inciso:',
                            alineas: [
                                {
                                    numero: 'a',
                                    descricao: 'alínea do inciso:',
                                    itens: [{
                                        numero: '1',
                                        descricao: 'item da alínea;'
                                    }, {
                                        numero: '2',
                                        descricao: 'outro item.'
                                    }]
                                }, {
                                    numero: 'b',
                                    descricao: 'outra alínea.'
                                }
                            ]
                        }, {
                            numero: 'III',
                            descricao: 'último inciso.'
                        }
                    ],
                    paragrafos: [
                        {
                            numero: 'Parágrafo único',
                            descricao: 'Parágrafo:',
                            incisos: [
                                {
                                    numero: 'I',
                                    descricao: 'inciso do parágrafo.'
                                }
                            ]
                        }
                    ]
                }, {
                    numero: '2',
                    descricao: 'Outro artigo.',
                    incisos: [],
                    paragrafos: []
                }
            ])
        });
    });

    test('Interpretação de articulação para o formato LexML', async function ({ page }) {
        const lexml = await page.evaluate(() => {
            const texto = 'Art. 1º - Teste 1.\nI - Inciso do artigo;\nII - Segundo inciso:\na) Alínea do inciso;\nb) Outra alínea.\nIII - Último inciso.\nParágrafo Único - Parágrafo.\nI - Inciso do parágrafo.\nArt. 2º - Outro artigo.';
            const fragmento = (globalThis as any).window.silegismgInterpretadorArticulacao.interpretar(texto, 'lexml');
            const container = document.createElement('div');
            container.appendChild(fragmento);
            return container.innerHTML;
        });

        expect(lexml).toEqual('<articulacao xmlns="http://www.lexml.gov.br/1.0"><artigo id="art1"><rotulo>Art. 1º –</rotulo><caput id="art1_cpt"><p>Teste 1.</p><inciso id="art1_cpt_inc1"><rotulo>I</rotulo><p>Inciso do artigo;</p></inciso><inciso id="art1_cpt_inc2"><rotulo>II</rotulo><p>Segundo inciso:</p><alinea id="art1_cpt_inc2_ali1"><rotulo>a</rotulo><p>Alínea do inciso;</p></alinea><alinea id="art1_cpt_inc2_ali2"><rotulo>b</rotulo><p>Outra alínea.</p></alinea></inciso><inciso id="art1_cpt_inc3"><rotulo>III</rotulo><p>Último inciso.</p></inciso></caput><paragrafo id="art1_par1"><rotulo>Parágrafo único –</rotulo><p>Parágrafo.</p><inciso id="art1_par1_inc1"><rotulo>I</rotulo><p>Inciso do parágrafo.</p></inciso></paragrafo></artigo><artigo id="art2"><rotulo>Art. 2º –</rotulo><caput id="art2_cpt"><p>Outro artigo.</p></caput></artigo></articulacao>');
    });

    test('Interpretação de articulação para o formato LexML em String', function () {
        const texto = 'Art. 1º - Teste 1.\nI - Inciso do artigo;\nII - Segundo inciso:\na) Alínea do inciso;\nb) Outra alínea.\nIII - Último inciso.\nParágrafo Único - Parágrafo.\nI - Inciso do parágrafo.\nArt. 2º - Outro artigo.';
        const lexml = parser.interpretar(texto, 'lexml-string');

        expect(lexml).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Teste 1.</p><Inciso id="art1_cpt_inc1"><Rotulo>I</Rotulo><p>Inciso do artigo;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II</Rotulo><p>Segundo inciso:</p><Alinea id="art1_cpt_inc2_ali1"><Rotulo>a</Rotulo><p>Alínea do inciso;</p></Alinea><Alinea id="art1_cpt_inc2_ali2"><Rotulo>b</Rotulo><p>Outra alínea.</p></Alinea></Inciso><Inciso id="art1_cpt_inc3"><Rotulo>III</Rotulo><p>Último inciso.</p></Inciso></Caput><Paragrafo id="art1_par1"><Rotulo>Parágrafo único –</Rotulo><p>Parágrafo.</p><Inciso id="art1_par1_inc1"><Rotulo>I</Rotulo><p>Inciso do parágrafo.</p></Inciso></Paragrafo></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Outro artigo.</p></Caput></Artigo></Articulacao>');
    });

    test('Interpretar corretamente artigo inciso e parágrafo', function () {
        const texto = 'Art. 103 – Teste:\n' +
            'I – teste.\n' +
            'Parágrafo único – Teste.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '103',
                    descricao: 'Teste:',
                    incisos: [
                        {
                            numero: 'I',
                            descricao: 'teste.'
                        }
                    ],
                    paragrafos: [
                        {
                            numero: 'Parágrafo único',
                            descricao: 'Teste.',
                            incisos: []
                        }
                    ]
                }
            ])
        });
    });

    test('Deve suportar texto antes do artigo', function () {
        const texto = 'continuação do artigo.\n' +
            'Art. 2 - Final.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: 'continuação do artigo.',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '2',
                    descricao: 'Final.'
                }
            ])
        });
    });

    test('Deve suportar texto sem articulação', function () {
        const texto = 'Um texto simples.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: 'Um texto simples.',
            articulacao: []
        });
    });

    test('Deve suportar texto com quebra de linha', function () {
        const texto = 'linha 1\nlinha 2';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: 'linha 1\nlinha 2',
            articulacao: []
        });
    });

    test('Deve suportar título, capítulo, seção e subseção', function () {
        const texto = `TÍTULO I
        DISPOSIÇÕES PRELIMINARES
        
        Art. 1º – O Estado de Minas Gerais integra, com autonomia político-administrativa, a República Federativa do Brasil.
        
        TÍTULO II
        DO ESTADO
        
        CAPÍTULO I
        DA ORGANIZAÇÃO DO ESTADO
        
        Seção I
        Disposições Gerais

        Subseção I
        Teste
        
        Art. 2º – São Poderes do Estado, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.`;

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: [
                novo(parser.Titulo, {
                    numero: 'I',
                    descricao: 'DISPOSIÇÕES PRELIMINARES'
                }),
                novo(parser.Artigo, {
                    numero: '1',
                    descricao: 'O Estado de Minas Gerais integra, com autonomia político-administrativa, a República Federativa do Brasil.'
                }),
                novo(parser.Titulo, {
                    numero: 'II',
                    descricao: 'DO ESTADO'
                }),
                novo(parser.Capitulo, {
                    numero: 'I',
                    descricao: 'DA ORGANIZAÇÃO DO ESTADO'
                }),
                novo(parser.Secao, {
                    numero: 'I',
                    descricao: 'Disposições Gerais'
                }),
                novo(parser.Subsecao, {
                    numero: 'I',
                    descricao: 'Teste'
                }),
                novo(parser.Artigo, {
                    numero: '2',
                    descricao: 'São Poderes do Estado, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
                })
            ]
        });
    });

    test('Deve suportar artigo por extenso', function () {
        const texto = 'Artigo 1º - Primeiro.\nArtigo 2º - Segundo.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '1',
                    descricao: 'Primeiro.',
                }, {
                    numero: '2',
                    descricao: 'Segundo.'
                }
            ])
        });
    });

    test('Deve suportar apenas o parágrafo, sem artigo.', function () {
        const texto = 'Parágrafo único. Teste.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [],
                    paragrafos: [{
                        numero: 'Parágrafo único',
                        descricao: 'Teste.',
                        incisos: []
                    }]
                }
            ])
        });
    });

    test('Não deve permitir citação em parágrafo ao exportar para editor.', async function ({ page }) {
        const html = await page.evaluate(() => {
            const texto = 'Art. 1º - Artigo 1.\nParágrafo único - Teste.\nContinuação.';
            const fragmento = (globalThis as any).window.silegismgInterpretadorArticulacao.interpretar(texto, 'json').articulacao[0].paraEditor();
            return fragmento.children[1].outerHTML;
        });

        expect(html).toEqual('<p data-tipo="paragrafo" class="unico">Teste. Continuação.</p>');
    });

    test('Deve permitir citação em artigo  ao exportar para editor.', async function ({ page }) {
        const html = await page.evaluate(() => {
            const texto = 'Art. 1º - Artigo 1.\nContinuação.\nParágrafo único - Teste.';
            const fragmento = (globalThis as any).window.silegismgInterpretadorArticulacao.interpretar(texto, 'json').articulacao[0].paraEditor();
            return [...fragmento.children].map(e => e.outerHTML);
        });

        expect(html).toEqual([
            '<p data-tipo="artigo">Artigo 1.</p>',
            '<p data-tipo="continuacao">Continuação.</p>',
            '<p data-tipo="paragrafo" class="unico">Teste.</p>'
        ]);
    });

    test('Deve permitir inserir inciso, omitindo artigo.', function () {
        const texto = 'I - Teste.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: 'I',
                        descricao: 'Teste.',
                        alineas: []
                    }]
                }])
        });
    });

    test('Deve permitir inserir alínea, omitindo artigo e inciso.', function () {
        const texto = 'a) Teste.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: '',
                        descricao: '',
                        alineas: [{
                            numero: 'a',
                            descricao: 'Teste.',
                            itens: []
                        }]
                    }]
                }])
        });
    });

    test('Deve permitir inserir item, omitindo artigo, inciso e alínea.', function () {
        const texto = '1. Item.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [{
                        numero: '',
                        descricao: '',
                        alineas: [{
                            numero: '',
                            descricao: '',
                            itens: [{
                                numero: '1',
                                descricao: 'Item.'
                            }]
                        }]
                    }]
                }])
        });
    });

    test('Deve permitir inserir parágrafo com item, omitindo artigo, inciso e alínea.', function () {
        const texto = 'Parágrafo único - Os cidadãos:\n1. Devem ser legais.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: '',
            articulacao: novo(parser.Artigo, [
                {
                    numero: '',
                    descricao: '',
                    incisos: [],
                    paragrafos: [{
                        numero: 'Parágrafo único',
                        descricao: 'Os cidadãos:',
                        incisos: [{
                            numero: '',
                            descricao: '',
                            alineas: [{
                                numero: '',
                                descricao: '',
                                itens: [{
                                    numero: '1',
                                    descricao: 'Devem ser legais.'
                                }]
                            }]
                        }]
                    }]
                }
            ])
        });
    });

    test.describe('transfomarQuebrasDeLinhaEmP', function () {
        async function transformarQuebrasDeLinhaEmP(page: Page, texto: string) {
            return await page.evaluate(texto => {
                const fragmento = (globalThis as any).silegismgInterpretadorArticulacao.transformarQuebrasDeLinhaEmP(texto);

                return [...fragmento.childNodes].map(c => c.outerHTML);
            }, texto);
        }

        test('Deve envolver única linha', async function ({ page }) {
            const resultado = await transformarQuebrasDeLinhaEmP(page, 'linha única');

            expect(resultado).toEqual(['<p>linha única</p>']);
        });

        test('Deve separar duas linhas', async function ({ page }) {
            const resultado = await transformarQuebrasDeLinhaEmP(page, 'linha 1\nlinha 2');

            expect(resultado).toEqual([
                '<p>linha 1</p>',
                '<p>linha 2</p>'
            ]);
        });

        test('Deve separar três linhas', async function ({ page }) {
            const resultado = await transformarQuebrasDeLinhaEmP(page, 'linha 1\nlinha 2\nlinha 3');

            expect(resultado).toEqual([
                '<p>linha 1</p>',
                '<p>linha 2</p>',
                '<p>linha 3</p>'
            ]);
        });

        test('Deve ignorar linhas vazias', async function ({ page }) {
            const resultado = await transformarQuebrasDeLinhaEmP(page, 'linha 1\n\nlinha 2\n\n\nlinha 3');

            expect(resultado).toEqual([
                '<p>linha 1</p>',
                '<p>linha 2</p>',
                '<p>linha 3</p>'
            ]);
        });
    });

    test('Deve escapar entidades html', async function ({ page }) {
        const lexml = await page.evaluate(() => {
            const texto = '<P>Art. 1&#176; &#8211; Fica declarado de utilidade p&#250;blica o treste &#160;asdf asd f &#160; &#160;asd, com sede no Munic&#237;pio de Abadia dos Dourados.</P><P>Art. 2&#176; &#8211; Esta lei entra em vigor na data de sua publica&#231;&#227;o.</P>';
            return (globalThis as any).window.silegismgInterpretadorArticulacao.interpretar(texto, 'lexml-string', 'html');
        });

        expect(lexml).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Fica declarado de utilidade pública o treste  asdf asd f    asd, com sede no Município de Abadia dos Dourados.</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Esta lei entra em vigor na data de sua publicação.</p></Caput></Artigo></Articulacao>');
    });

    test('Interpretação de diferentes formas de parágrafo', async function ({ page }) {
        const html = await page.evaluate(() => {
            const texto = 'Art. 1º - Teste 1.\n§ 1º - P1.\n§ 2º - P2.\nParágrafo 3º - P3\nParagrafo 4ª - P4\nParágrafo quinto - P5\nArt. 2º - Outro artigo.';
            const fragmento = (globalThis as any).window.silegismgInterpretadorArticulacao.interpretar(texto, 'lexml');
            const container = document.createElement('div');
            container.appendChild(fragmento);
            return container.innerHTML;
        });

        expect(html).toEqual('<articulacao xmlns="http://www.lexml.gov.br/1.0"><artigo id="art1"><rotulo>Art. 1º –</rotulo><caput id="art1_cpt"><p>Teste 1.</p></caput><paragrafo id="art1_par1"><rotulo>§1º –</rotulo><p>P1.</p></paragrafo><paragrafo id="art1_par2"><rotulo>§2º –</rotulo><p>P2.</p></paragrafo><paragrafo id="art1_par3"><rotulo>§3º –</rotulo><p>P3</p></paragrafo><paragrafo id="art1_par4"><rotulo>§4º –</rotulo><p>P4</p></paragrafo><paragrafo id="art1_par5"><rotulo>§5º –</rotulo><p>P5</p></paragrafo></artigo><artigo id="art2"><rotulo>Art. 2º –</rotulo><caput id="art2_cpt"><p>Outro artigo.</p></caput></artigo></articulacao>');
    });

});
