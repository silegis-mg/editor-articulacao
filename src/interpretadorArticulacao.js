/**
 * Interpreta conteúdo de articulação.
 * 
 * TO-DO: Adicionar suporte a agrupadores (título, capítulo, seção e subseção).
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 * 
 * @author Júlio César e Melo
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
            item: 'artigo',
            regexp: /^Art\.\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto, m) {
                var item = new Artigo(m[1], m[2]);

                contexto.artigos.push(item);

                return item;
            }
        }, {
            item: 'paragrafo',
            regexp: /^(?:Parágrafo único|§\s*(\d+))\s*.?\s*[-–]?\s*(.+)/i,
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
            regexp: /^([a-z])\)\s*(.*)/i,
            onMatch: function (contexto, m) {
                var item = new Alinea(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Inciso);

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'item',
            requisito: [Alinea, Item],
            regexp: /^(\d)\)\s*(.*)/,
            onMatch: function (contexto, m) {
                var item = new Item(m[1], m[2]);
                var container = contexto.getUltimoItemTipo(Alinea);

                container.adicionar(item);

                return item;
            }
        }
    ];
    var aspas = [];
    var texto = textoOriginal.replace(regexpAspas, function (aspa) {
        aspas.push(aspa.replace(/[“”]/g, '"'));
        return '\0';
    }).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach(function (linha) {
        var i, regexp, m, atendePrequisito;

        for (i = 0; i < regexpLinhas.length; i++) {
            regexp = regexpLinhas[i];

            // Verifica se a expressão está adequado ao contexto atual.
            if (regexp.requisito) {
                var j;

                atendePrequisito = false;

                for (j = 0; j < regexp.requisito.length; j++) {
                    if (contexto.ultimoItem instanceof regexp.requisito[j]) {
                        atendePrequisito = true;
                        break;
                    }
                }
            } else {
                atendePrequisito = true;
            }

            if (atendePrequisito) {
                m = regexp.regexp.exec(linha);

                if (m) {
                    contexto.ultimoItem = regexp.onMatch(contexto, m);
                    contexto.ultimoItem.descricao = contexto.ultimoItem.descricao.replace(/\0/g, aspas.shift.bind(aspas));

                    return;
                }
            }
        }

        linha = linha.replace(/\0/g, function () {
            return aspas.shift();
        });

        if (contexto.ultimoItem) {
            contexto.ultimoItem.descricao += '\n' + linha;
        } else {
            contexto.textoAnterior += linha;
        }
    });

    return {
        textoAnterior: contexto.textoAnterior,
        articulacao: contexto.artigos
    };
}


// Definição de classes

class Artigo {
    constructor(numero, caput) {
        this.numero = numero;
        this.descricao = caput;
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
}

class Paragrafo {
    constructor(numero, descricao) {
        this.numero = numero;
        this.descricao = descricao;
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

class Inciso {
    constructor(numero, descricao) {
        this.numero = numero;
        this.descricao = descricao;
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

class Alinea {
    constructor(numero, descricao) {
        this.numero = numero;
        this.descricao = descricao;
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

class Item {
    constructor(numero, descricao) {
        this.numero = numero;
        this.descricao = descricao;
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
 * 
 * @author Júlio César e Melo
 */
function interpretarArticulacao(texto, formato) {
    var json;

    try {
        if (typeof texto === 'string') {
            var div = document.createElement('div');
            div.innerHTML = texto;
            json = parseTexto(div.innerHTML.replace(/<P>(.+?)<\/P>/gi, '$1\n'));
        } else {
            throw 'Formato não suportado.'
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
};

export default {
    Artigo: Artigo,
    Paragrafo: Paragrafo,
    Inciso: Inciso,
    Alinea: Alinea,
    Item: Item,
    interpretar: interpretarArticulacao
}

export { Artigo, Paragrafo, Inciso, Alinea, Item, interpretarArticulacao };