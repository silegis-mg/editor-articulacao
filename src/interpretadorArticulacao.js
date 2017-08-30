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

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 */
function parseTexto(textoOriginal) {
    var contexto = {
        ultimoItem: null,
        textoAnterior: '',
        artigos: [],
        getUltimoItemTipo: function (tipo) {
            var item = this.ultimoItem;

            if (item === null) {
                return null;
            }

            if (typeof tipo === 'function') {
                while (!(item instanceof tipo)) {
                    item = item.$parent;
                }
            } else if (tipo instanceof Array) {
                do {
                    var j;

                    for (j = 0; j < tipo.length; j++) {
                        if (item instanceof tipo[j]) {
                            return item;
                        }
                    }

                    item = item.$parent;
                } while (item);
            } else {
                throw 'Argumento inválido';
            }

            return item;
        }
    };
    var regexpAspas = /(“[\s\S]*?”|"[\s\S]*?")/g;
    var regexpLinhas = [
        {
            item: 'parentesis',
            regexp: /^\(.+\)$/,
            onMatch: function (contexto, m) {
                if (contexto.ultimoItem) {
                    if (!contexto.ultimoItem.descricao) {
                        contexto.ultimoItem.descricao = m[0];
                    } else {
                        contexto.ultimoItem.descricao += m[0];
                    }
                }
                
                return contexto.ultimoItem;
            }
        }, {
            item: 'continuacao-divisao',
            regexp: /^\s*(.*)?\s*$/,
            requisito: [Titulo, Capitulo, Secao, Subsecao],
            onMatch: function (contexto, m) {
                if (!contexto.ultimoItem.descricao) {
                    contexto.ultimoItem.descricao = m[1];
                } else {
                    contexto.ultimoItem.descricao += m[1];
                }

                return contexto.ultimoItem;
            },
            reiniciar: true
        }, {
            item: 'artigo',
            regexp: /^\s*Art\.\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Artigo(m[1], m[2]);

                contexto.artigos.push(item);

                return item;
            }
        }, {
            item: 'paragrafo',
            regexp: /^\s*(?:Parágrafo único|§\s*(\d+))\s*.?\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Paragrafo(m[1] || 'Parágrafo único', m[2]);
                var container = contexto.getUltimoItemTipo(Artigo);

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'inciso',
            regexp: /^\s*([IXVDLM]+)\s*[-–]\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Inciso(m[1], m[2]);
                var container = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'alinea',
            requisito: [Inciso, Alinea, Item],
            regexp: /^\s*([a-z])\)\s*(.*)/i,
            onMatch: function (contexto, m) {
                var item = new Alinea(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Inciso);

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'item',
            requisito: [Alinea, Item],
            regexp: /^\s*(\d)\)\s*(.*)/,
            onMatch: function (contexto, m) {
                var item = new Item(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Alinea);

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'titulo',
            regexp: /^\s*T[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Titulo(m[1], m[2] ||'');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'capitulo',
            regexp: /^\s*CAP[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Capitulo(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'secao',
            regexp: /^\s*SE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Secao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'subsecao',
            regexp: /^\s*SUBSE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto, m) {
                var item = new Subsecao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        },
        
    ];
    var aspas = [];
    var texto = textoOriginal.replace(regexpAspas, function (aspa) {
        aspas.push(aspa.replace(/[“”]/g, '"'));
        return '\0';
    }).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach(function (linha) {
        var i, regexp, m, atendeRequisito;

        for (i = 0; i < regexpLinhas.length; i++) {
            regexp = regexpLinhas[i];

            // Verifica se a expressão está adequado ao contexto atual.
            if (regexp.requisito) {
                var j;

                atendeRequisito = false;

                for (j = 0; j < regexp.requisito.length; j++) {
                    if (contexto.ultimoItem instanceof regexp.requisito[j]) {
                        atendeRequisito = true;
                        break;
                    }
                }
            } else {
                atendeRequisito = true;
            }

            if (atendeRequisito) {
                m = regexp.regexp.exec(linha);

                if (m) {
                    contexto.ultimoItem = regexp.onMatch(contexto, m);

                    if (contexto.ultimoItem) {
                        contexto.ultimoItem.descricao = contexto.ultimoItem.descricao.replace(/\0/g, aspas.shift.bind(aspas));

                        if (regexp.reiniciar) {
                            contexto.ultimoItem = null;
                        }
                    }

                    return;
                }
            }
        }

        linha = linha.replace(/\0/g, function () {
            return aspas.shift();
        });

        if (contexto.ultimoItem) {
            contexto.ultimoItem.descricao += '\n' + linha;
        } else if (contexto.artigos.length > 0 && contexto.artigos[contexto.artigos.length - 1] instanceof Divisao) {
            contexto.artigos[contexto.artigos.length - 1].descricao += '\n' + linha;
        } else if (contexto.textoAnterior.length === 0) {
            contexto.textoAnterior = linha;
        } else {
            contexto.textoAnterior += '\n' + linha;
        }
    });

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.artigos
    };
}


/**
 * Transforma as quebras de linha em elementos P.
 * 
 * @param {String} texto 
 * @returns {String}
 */
function transformarQuebrasDeLinhaEmP(texto) {
    var fragmento = document.createDocumentFragment();

    if (texto.indexOf('\n') === -1) {
        let p = document.createElement('p');
        p.textContent = texto;
        fragmento.appendChild(p);
    } else {
        let novoTexto = texto
            .replace(/\n/g, '</p><p>')                  // Substitui quebras de linha em parágrafo.
            .replace(/^(?!<p)(.*?<\/p>)/i, '<p>$1')    // Corrige fechamento de parágrafo sem abertura.
            .replace(/(<p>.*?)(?:<\/p>)?$/i, '$1</p>')  // Garante o fechamento ao final da linha.
            .replace(/<p><\/p>/g, '');                  // Remove as linhas vazias.

        let container = document.createElement("div");
        container.innerHTML = novoTexto;

        while (container.firstChild) {
            fragmento.appendChild(container.firstChild);
        }
    }
    
    return fragmento;
}

// Definição de classes

class Dispositivo {
    constructor(tipo, numero, descricao, derivacoes) {
        this.numero = numero;
        this.descricao = descricao;

        Object.defineProperty(this, 'tipo', {
            value: tipo
        });

        if (derivacoes) {
            Object.defineProperty(this, 'subitens', {
                get: function() {
                    return derivacoes.reduce((prev, item) => prev.concat(this[item]), []);
                }
            });
        }
    }

    /**
     * Adiciona um dispositivo a este.
     * 
     * @param {*} dispositivo 
     */
    adicionar(dispositivo) {
        throw 'Não implementado';
    }

    /**
     * Transforma o dispositivo no formato do editor.
     */
    paraEditor() {
        let fragmento = transformarQuebrasDeLinhaEmP(this.descricao);

        fragmento.firstElementChild.setAttribute('data-tipo', this.tipo);

        for (let item = fragmento.children[1]; item; item = item.nextElementSibling) {
            item.setAttribute('data-tipo', 'continuacao');
        }

        this.subitens.forEach(subItem => fragmento.appendChild(subItem.paraEditor()));

        return fragmento;
    }
}

class Artigo extends Dispositivo {
    constructor(numero, caput) {
        super('artigo', numero, caput, ['incisos', 'paragrafos']);
        this.incisos = [];
        this.paragrafos = [];
    }

    adicionar(incisoOuParagrafo) {
        var self = this;

        Object.defineProperty(incisoOuParagrafo, '$parent', {
            get: function () {
                return self;
            }
        });

        if (incisoOuParagrafo instanceof Inciso) {
            this.incisos.push(incisoOuParagrafo);
        } else if (incisoOuParagrafo instanceof Paragrafo) {
            this.paragrafos.push(incisoOuParagrafo);
        } else {
            throw 'Tipo não suportado.';
        }
    }

    paraEditor() {
        var fragmento = super.paraEditor();

        if (this.paragrafos.length === 1) {
            fragmento.querySelector('p[data-tipo="paragrafo"]').classList.add('unico');
        }

        return fragmento;
    }
}

class Paragrafo extends Dispositivo {
    constructor(numero, descricao) {
        super('paragrafo', numero, descricao, ['incisos']);
        this.incisos = [];
    }

    adicionar(inciso) {
        var self = this;

        if (!(inciso instanceof Inciso)) {
            throw 'Tipo não suportado.';
        }

        Object.defineProperty(inciso, '$parent', {
            get: function () {
                return self;
            }
        });

        this.incisos.push(inciso);
    }
}

class Inciso extends Dispositivo {
    constructor(numero, descricao) {
        super('inciso', numero, descricao, ['alineas']);
        this.alineas = [];
    }

    adicionar(alinea) {
        var self = this;

        if (!(alinea instanceof Alinea)) {
            throw 'Tipo não suportado.';
        }

        Object.defineProperty(alinea, '$parent', {
            get: function () {
                return self;
            }
        });

        this.alineas.push(alinea);
    }
}

class Alinea extends Dispositivo {
    constructor(numero, descricao) {
        super('alinea', numero, descricao, ['itens']);
        this.itens = [];
    }

    adicionar(item) {
        var self = this;

        if (!(item instanceof Item)) {
            throw 'Tipo não suportado.';
        }

        Object.defineProperty(item, '$parent', {
            get: function () {
                return self;
            }
        });

        this.itens.push(item);
    }
}

class Item extends Dispositivo {
    constructor(numero, descricao) {
        super('item', numero, descricao, []);
    }
}

class Divisao extends Dispositivo {
    constructor(tipo, numero, descricao) {
        super(tipo, numero, descricao);
        this.subitens = []
    }
    
    adicionar(item) {
        this.subitens.push(item);
    }
}

class Titulo extends Divisao {
    constructor(numero, descricao) {
        super('titulo', numero, descricao);
    }
}

class Capitulo extends Divisao {
    constructor(numero, descricao) {
        super('capitulo', numero, descricao);
    }
}

class Secao extends Divisao {
    constructor(numero, descricao) {
        super('secao', numero, descricao);
    }
}

class Subsecao extends Divisao {
    constructor(numero, descricao) {
        super('subsecao', numero, descricao);
    }
}

/**
 * Extrai o agrupador no formato "Nome Número - Descrição".
 * 
 * @param txt
 * 		Texto cujo agrupador será extraído.
 * 
 * @returns {object}
 * 		Objeto contendo atributos: numero e descricao.
 */
function extrairAgrupador(txt) {
    var regExpTitulo = /(\w+) (\w+)\s*[-–]\s*\n*(.*)/i, item;

    if (!txt) {
        return null;
    }

    item = regExpTitulo.exec(txt.replace(/[\r\n]/g, ' ').trim());

    return {
        numero: item[2],
        descricao: removerUnicaTagParagrafo(item[3])
    };
}

function transformarEmLexML(json) {
    function reducaoInciso(prev, inciso, idx, array) {

        var idInciso = array.prefixo + "_inc" + (idx + 1);

        return prev + '<Inciso id="' + idInciso + '"><Rotulo>' + inciso.numero + '</Rotulo><p>' + inciso.descricao + '</p>' +
            (inciso.alineas || []).reduce(function (prev, alinea, idx) {
                return prev + '<Alinea id="' + idInciso + '_ali' + (idx + 1) + '"><Rotulo>' + alinea.numero + '</Rotulo><p>' + alinea.descricao + '</p></Alinea>';
            }, '') + '</Inciso>';
    }

    var lexml = '<Articulacao xmlns="http://www.lexml.gov.br/1.0">' +
        json.articulacao.reduce(function (prev, artigo, idx) {
            var idArt = 'art' + (idx + 1);
            var texto = prev + '<Artigo id="' + idArt + '"><Rotulo>Art. ' + (idx + 1) + (idx < 9 ? 'º' : '') + ' –</Rotulo><Caput id="' + idArt + '_cpt"><p>' + artigo.descricao + '</p>';

            if (artigo.incisos && artigo.incisos.length > 0) {
                artigo.incisos.prefixo = idArt + '_cpt';
                texto += artigo.incisos.reduce(reducaoInciso, '');
            }

            texto += '</Caput>';

            if (artigo.paragrafos && artigo.paragrafos.length > 0) {
                texto += artigo.paragrafos.reduce(function (prev, paragrafo, idx, paragrafos) {
                    var idPar = idArt + '_par' + (idx + 1);
                    if (paragrafo.incisos) {
                        paragrafo.incisos.prefixo = idPar;
                    }

                    return prev + '<Paragrafo id="' + idPar + '"><Rotulo>' +
                        (paragrafos.length === 1 ? 'Parágrafo único' : '§' + ((idx + 1) + (idx < 9 ? 'º' : ''))) +
                        ' –</Rotulo><p>' + paragrafo.descricao + '</p>' +
                        (paragrafo.incisos || []).reduce(reducaoInciso, '') +
                        '</Paragrafo>';
                }, '');
            }

            return texto + '</Artigo>';
        }, '') + '</Articulacao>';

    let container = document.createElement('div');
    container.innerHTML = lexml;

    let fragmento = document.createDocumentFragment();

    while (container.firstChild) {
        fragmento.appendChild(container.firstChild);
    }

    return fragmento;
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} texto Texto a ser interpretado
 * @param {String} formato Formato a ser retornado: 'json' ou 'lexml' (padrão).
 * @returns {Object|DocumentFragment}
 */
function interpretarArticulacao(texto, formato) {
    var json;

    try {
        if (typeof texto === 'string') {
            var div = document.createElement('div');
            div.innerHTML = texto;
            json = parseTexto(div.innerHTML.replace(/<P>(.+?)<\/P>/gi, '$1\n'));
        } else {
            throw 'Formato não suportado.';
        }

        switch ((formato || 'lexml').toLowerCase()) {
            case 'json':
                return json;

            case 'lexml':
                return transformarEmLexML(json);

            default:
                throw 'Formato não suportado: ' + formato;
        }
    } catch (e) {
        throw {
            mensagem: 'Erro interpretando articulação.',
            item: texto,
            formato: formato,
            erroOriginal: e
        };
    }
}

export default {
    Artigo: Artigo,
    Paragrafo: Paragrafo,
    Inciso: Inciso,
    Alinea: Alinea,
    Item: Item,
    Titulo: Titulo,
    Capitulo: Capitulo,
    Secao: Secao,
    Subsecao: Subsecao,
    interpretar: interpretarArticulacao,
    transformarQuebrasDeLinhaEmP: transformarQuebrasDeLinhaEmP
};

export { Artigo, Paragrafo, Inciso, Alinea, Item, Titulo, Capitulo, Secao, Subsecao, interpretarArticulacao, transformarQuebrasDeLinhaEmP };