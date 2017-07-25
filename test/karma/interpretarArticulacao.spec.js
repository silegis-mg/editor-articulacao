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
