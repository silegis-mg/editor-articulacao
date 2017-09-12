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

'use strict';

describe('Parser de articulação', function () {
    var parser = window.interpretadorArticulacao;

    function novo(tipo, obj) {
        if (obj instanceof Array) {
            return obj.map(o => novo(tipo, o));
        } else {
            var novoObj = new tipo(obj.numero, obj.descricao);

            (obj.incisos || []).forEach(i => novoObj.adicionar(novo(parser.Inciso, i)));
            (obj.paragrafos || []).forEach(i => novoObj.adicionar(novo(parser.Paragrafo, i)));
            (obj.alineas || []).forEach(i => novoObj.adicionar(novo(parser.Alinea, i)));
            (obj.itens || []).forEach(i => novoObj.adicionar(novo(parser.Item, i)));

            return novoObj;
        }
    }

    it('Interpretação de articulação', function () {
        var texto = 'Art. 1º - Teste 1:\nI - inciso do artigo;\nII - segundo inciso:\na) alínea do inciso:\n1) item da alínea;\n2) outro item.\nb) outra alínea.\nIII - último inciso.\nParágrafo Único - Parágrafo:\nI - inciso do parágrafo.\nArt. 2º - Outro artigo.';

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

    it('Interpretação de articulação para o formato LexML', function () {
        var texto = 'Art. 1º - Teste 1.\nI - Inciso do artigo;\nII - Segundo inciso:\na) Alínea do inciso;\nb) Outra alínea.\nIII - Último inciso.\nParágrafo Único - Parágrafo.\nI - Inciso do parágrafo.\nArt. 2º - Outro artigo.';
        var fragmento = parser.interpretar(texto, 'lexml');
        var container = document.createElement('div');
        container.appendChild(fragmento);

        expect(container.innerHTML).toEqual('<articulacao xmlns="http://www.lexml.gov.br/1.0"><artigo id="art1"><rotulo>Art. 1º –</rotulo><caput id="art1_cpt"><p>Teste 1.</p><inciso id="art1_cpt_inc1"><rotulo>I</rotulo><p>Inciso do artigo;</p></inciso><inciso id="art1_cpt_inc2"><rotulo>II</rotulo><p>Segundo inciso:</p><alinea id="art1_cpt_inc2_ali1"><rotulo>a</rotulo><p>Alínea do inciso;</p></alinea><alinea id="art1_cpt_inc2_ali2"><rotulo>b</rotulo><p>Outra alínea.</p></alinea></inciso><inciso id="art1_cpt_inc3"><rotulo>III</rotulo><p>Último inciso.</p></inciso></caput><paragrafo id="art1_par1"><rotulo>Parágrafo único –</rotulo><p>Parágrafo.</p><inciso id="art1_par1_inc1"><rotulo>I</rotulo><p>Inciso do parágrafo.</p></inciso></paragrafo></artigo><artigo id="art2"><rotulo>Art. 2º –</rotulo><caput id="art2_cpt"><p>Outro artigo.</p></caput></artigo></articulacao>');
    });

    it('Interpretação de articulação para o formato LexML em String', function () {
        var texto = 'Art. 1º - Teste 1.\nI - Inciso do artigo;\nII - Segundo inciso:\na) Alínea do inciso;\nb) Outra alínea.\nIII - Último inciso.\nParágrafo Único - Parágrafo.\nI - Inciso do parágrafo.\nArt. 2º - Outro artigo.';
        var lexml = parser.interpretar(texto, 'lexmlString');

        expect(lexml).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Teste 1.</p><Inciso id="art1_cpt_inc1"><Rotulo>I</Rotulo><p>Inciso do artigo;</p></Inciso><Inciso id="art1_cpt_inc2"><Rotulo>II</Rotulo><p>Segundo inciso:</p><Alinea id="art1_cpt_inc2_ali1"><Rotulo>a</Rotulo><p>Alínea do inciso;</p></Alinea><Alinea id="art1_cpt_inc2_ali2"><Rotulo>b</Rotulo><p>Outra alínea.</p></Alinea></Inciso><Inciso id="art1_cpt_inc3"><Rotulo>III</Rotulo><p>Último inciso.</p></Inciso></Caput><Paragrafo id="art1_par1"><Rotulo>Parágrafo único –</Rotulo><p>Parágrafo.</p><Inciso id="art1_par1_inc1"><Rotulo>I</Rotulo><p>Inciso do parágrafo.</p></Inciso></Paragrafo></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Outro artigo.</p></Caput></Artigo></Articulacao>');
    });

    it('Interpretar corretamente artigo inciso e parágrafo', function () {
        var texto = 'Art. 103 – Teste:\n' +
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

    it('Deve suportar texto antes do artigo', function () {
        var texto = 'continuação do artigo.\n' +
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

    it('Deve suportar texto antes do artigo', function () {
        var texto = 'Um texto simples.';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: 'Um texto simples.',
            articulacao: []
        });
    });

     it('Deve suportar texto com quebra de linha', function () {
        var texto = 'linha 1\nlinha 2';

        expect(parser.interpretar(texto, 'json')).toEqual({
            textoAnterior: 'linha 1\nlinha 2',
            articulacao: []
        });
    });

    it('Deve suportar título, capítulo, seção e subseção', function () {
        var texto = `TÍTULO I
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

    it('Deve escapar entidades html', function() {
        var texto = '<P>Art. 1&#176; &#8211; Fica declarado de utilidade p&#250;blica o treste &#160;asdf asd f &#160; &#160;asd, com sede no Munic&#237;pio de Abadia dos Dourados.</P><P>Art. 2&#176; &#8211; Esta lei entra em vigor na data de sua publica&#231;&#227;o.</P>';
        var lexml = parser.interpretar(texto, 'lexml-string', 'html');

        expect(lexml).toEqual('<Articulacao xmlns="http://www.lexml.gov.br/1.0"><Artigo id="art1"><Rotulo>Art. 1º –</Rotulo><Caput id="art1_cpt"><p>Fica declarado de utilidade pública o treste  asdf asd f    asd, com sede no Município de Abadia dos Dourados.</p></Caput></Artigo><Artigo id="art2"><Rotulo>Art. 2º –</Rotulo><Caput id="art2_cpt"><p>Esta lei entra em vigor na data de sua publicação.</p></Caput></Artigo></Articulacao>');
    });

    describe('transfomarQuebrasDeLinhaEmP', function () {
        var transformarQuebrasDeLinhaEmP = window.interpretadorArticulacao.transformarQuebrasDeLinhaEmP;

        it('Deve envolver única linha', function () {
            var fragmento = transformarQuebrasDeLinhaEmP('linha única');

            expect(fragmento.childNodes.length).toBe(1);
            expect(fragmento.firstChild.outerHTML).toBe('<p>linha única</p>');
        });

        it('Deve separar duas linhas', function () {
            var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2');

            expect(fragmento.childNodes.length).toBe(2);
            expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
            expect(fragmento.lastChild.outerHTML).toBe('<p>linha 2</p>');
        });

        it('Deve separar três linhas', function () {
            var fragmento = transformarQuebrasDeLinhaEmP('linha 1\nlinha 2\nlinha 3');

            expect(fragmento.childNodes.length).toBe(3);
            expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
            expect(fragmento.childNodes[1].outerHTML).toBe('<p>linha 2</p>');
            expect(fragmento.lastChild.outerHTML).toBe('<p>linha 3</p>');
        });

        it('Deve ignorar linhas vazias', function () {
            var fragmento = transformarQuebrasDeLinhaEmP('linha 1\n\nlinha 2\n\n\nlinha 3');

            expect(fragmento.childNodes.length).toBe(3);
            expect(fragmento.firstChild.outerHTML).toBe('<p>linha 1</p>');
            expect(fragmento.childNodes[1].outerHTML).toBe('<p>linha 2</p>');
            expect(fragmento.lastChild.outerHTML).toBe('<p>linha 3</p>');
        });
    });
});
