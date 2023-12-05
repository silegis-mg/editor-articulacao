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

import { TipoAgrupador, TipoDispositivo, TipoDispositivoOuAgrupador } from './TipoDispositivo';

export type TArticulacao = (Artigo | Divisao)[];

export interface IResultadoInterpretacao {
    textoAnterior: string;
    articulacao: TArticulacao;
}

class ContextoParser {
    ultimoItem: Dispositivo | null = null;
    textoAnterior: string = '';
    artigos: TArticulacao = [];

    getUltimoItemTipo(tipo: typeof Dispositivo): Dispositivo | null;
    getUltimoItemTipo(tipo: (typeof Dispositivo)[]): Dispositivo | null;
    getUltimoItemTipo(tipo: typeof Dispositivo | (typeof Dispositivo)[]): Dispositivo | null {
        let item = this.ultimoItem;

        if (item === null) {
            return null;
        }

        if (typeof tipo === 'function') {
            while (item && !(item instanceof tipo)) {
                item = (item as Dispositivo).$parent as Dispositivo;
            }
        } else if (tipo instanceof Array) {
            do {
                let j;

                for (j = 0; j < tipo.length; j++) {
                    if (item instanceof tipo[j]) {
                        return item;
                    }
                }

                item = (item as Dispositivo).$parent as Dispositivo;
            } while (item);
        } else {
            throw new Error('Argumento inválido: ' + tipo);
        }

        return item;
    }
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} textoOriginal Texto a ser interpretado
 */
function parseTexto(textoOriginal: string): IResultadoInterpretacao {
    const contexto = new ContextoParser();
    const regexpAspas = /(“[\s\S]*?”|"[\s\S]*?")/g;
    const regexpLinhas = [
        {
            item: 'parentesis',
            regexp: /^\(.+\)$/,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
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
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
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
            regexp: /^\s*(?:Art\.?|Artigo)\s*(\d+(?:-[a-z])?)\s*.\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Artigo(m[1], m[2]);

                contexto.artigos.push(item);

                return item;
            }
        }, {
            item: 'paragrafo',
            regexp: /^\s*(?:Par[áa]grafo [úu]nico|(?:§|Par[áa]grafo)\s*(\d+|primeiro|segundo|terceiro|quarto|quinto|sexto|s[eé]timo|oitavo|nono))\s*.?\s*[-–]?\s*(.+)/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Paragrafo(m[1] || 'Parágrafo único', m[2]);
                let container = contexto.getUltimoItemTipo(Artigo);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.artigos.push(container as Artigo);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'inciso',
            regexp: /^\s*([IXVDLM]+)\s*[-–).]\s*(.+)/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Inciso(m[1], m[2]);
                let container = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                if (!container) {
                    container = new Artigo('', contexto.textoAnterior);
                    contexto.artigos.push(container as Artigo);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'alinea',
            //requisito: [Inciso, Alinea, Item],
            regexp: /^\s*([a-z])\s*[-–).]\s*(.*)/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Alinea(m[1], m[2]);
                let container = contexto.getUltimoItemTipo(Inciso);

                if (!container) {
                    let artigoOuParagrafo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);
                    
                    if (!artigoOuParagrafo) {
                        artigoOuParagrafo = new Artigo('', '');
                        contexto.artigos.push(artigoOuParagrafo as Artigo);
                    }

                    container = new Inciso('', contexto.textoAnterior);
                    artigoOuParagrafo.adicionar(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'item',
            //requisito: [Alinea, Item],
            regexp: /^\s*(\d)\s*[-–).]\s*(.*)/,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Item(m[1], m[2]);
                let container = contexto.getUltimoItemTipo(Alinea);

                if (!container) {
                    container = new Alinea('', contexto.textoAnterior);

                    let inciso = contexto.getUltimoItemTipo(Inciso);

                    if (!inciso) {
                        let artigoOuParagrafo = contexto.getUltimoItemTipo([Artigo, Paragrafo]);

                        if (!artigoOuParagrafo) {
                            artigoOuParagrafo = new Artigo('', '');
                            contexto.artigos.push(artigoOuParagrafo as Artigo);
                        }

                        inciso = new Inciso('', '');
                        artigoOuParagrafo.adicionar(inciso);
                    }

                    inciso.adicionar(container);
                    contexto.textoAnterior = '';
                }

                container.adicionar(item);

                return item;
            }
        }, {
            item: 'titulo',
            regexp: /^\s*T[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Titulo(m[1], m[2] ||'');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'capitulo',
            regexp: /^\s*CAP[ÍI]TULO\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Capitulo(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'secao',
            regexp: /^\s*SE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Secao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        }, {
            item: 'subsecao',
            regexp: /^\s*SUBSE[ÇC][ÃA]O\s*([IXVDLM]+)(?:\s*[-–]\s*(.+))?/i,
            onMatch: function (contexto: ContextoParser, m: RegExpExecArray) {
                const item = new Subsecao(m[1], m[2] || '');

                contexto.artigos.push(item);
                
                return item;
            }
        },
        
    ];

    /* Para cada citação, isto é, texto entre aspas, substitui-se o seu conteúdo
     * por \0 e o conteúdo substituído é inserido na pilha de aspas, para evitar
     * que o conteúdo seja também interpretado.
     */
    const aspas: string[] = [];
    const texto = textoOriginal.replace(regexpAspas, function (aspa) {
        aspas.push(aspa.replace(/[“”]/g, '"'));
        return '\0';
    }).replace(/\s*\n+\s*/g, '\n');

    texto.split('\n').forEach(function (linha) {
        let i, regexp, m, atendeRequisito;

        for (i = 0; i < regexpLinhas.length; i++) {
            regexp = regexpLinhas[i];

            // Verifica se a expressão está adequado ao contexto atual.
            if (regexp.requisito) {
                atendeRequisito = false;

                for (let j = 0; j < regexp.requisito.length; j++) {
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
 */
export function transformarQuebrasDeLinhaEmP(texto: string): DocumentFragment {
    const fragmento = document.createDocumentFragment();

    if (texto.indexOf('\n') === -1) {
        const p = document.createElement('p');
        p.textContent = texto;
        fragmento.appendChild(p);
    } else {
        const partes = texto.split(/\n+/g);

        partes.forEach(parte => {
            const p = document.createElement('p');
            p.textContent = parte;
            fragmento.appendChild(p);
        });
    }
    
    return fragmento;
}

/**
 * Transforma as quebras de linha em espaço.
 */
function transformarQuebrasDeLinhaEmEspaco(texto: string): DocumentFragment {
    const fragmento = document.createDocumentFragment();

    const p = document.createElement('p');
    p.textContent = texto.replace(/\n+/g, ' ');

    fragmento.appendChild(p);
    
    return fragmento;
}

// Definição de classes

export abstract class Dispositivo {

    public $parent?: Dispositivo;

    constructor(public readonly tipo: TipoDispositivoOuAgrupador,
        public numero: string | null, public descricao: string, private derivacoes?: string[]) {
    }

    get subitens(): Dispositivo[] {
        return this.derivacoes
            ? this.derivacoes.reduce(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (prev, item) => item in this ? prev.concat((this as any)[item]) : prev, [])
            : [];
    }

    /**
     * Adiciona um dispositivo a este.
     */
    abstract adicionar(dispositivo: Dispositivo): void;

    /**
     * Transforma o conteúdo na descrição em fragmento do DOM.
     */
    transformarConteudoEmFragmento() {
        return transformarQuebrasDeLinhaEmEspaco(this.descricao);
    }

    /**
     * Transforma o dispositivo no formato do editor.
     */
    paraEditor() {
        const fragmento = this.transformarConteudoEmFragmento();

        fragmento.firstElementChild.setAttribute('data-tipo', this.tipo);

        for (let item = fragmento.children[1]; item; item = item.nextElementSibling) {
            item.setAttribute('data-tipo', 'continuacao');
        }

        this.subitens.forEach(subItem => fragmento.appendChild(subItem.paraEditor()));

        return fragmento;
    }
}

export class Artigo extends Dispositivo {
    public incisos: (Inciso[] & { prefixo?: string }) = [];
    public paragrafos: Paragrafo[] = [];

    constructor(numero: string | null, caput: string) {
        super(TipoDispositivo.ARTIGO, numero, caput, ['incisos', 'paragrafos']);
        this.incisos = [];
        this.paragrafos = [];
    }

    adicionar(incisoOuParagrafo: Inciso | Paragrafo) {
        incisoOuParagrafo.$parent = this;

        if (incisoOuParagrafo instanceof Inciso) {
            this.incisos.push(incisoOuParagrafo);
        } else if (incisoOuParagrafo instanceof Paragrafo) {
            this.paragrafos.push(incisoOuParagrafo);
        } else {
            throw new Error('Tipo não suportado.');
        }
    }

    transformarConteudoEmFragmento() {
        return transformarQuebrasDeLinhaEmP(this.descricao);
    }

    paraEditor() {
        const fragmento = super.paraEditor();

        if (this.paragrafos.length === 1) {
            fragmento.querySelector('p[data-tipo="paragrafo"]').classList.add('unico');
        }

        return fragmento;
    }
}

export class Paragrafo extends Dispositivo {
    public incisos: (Inciso[] & { prefixo?: string }) = [];

    constructor(numero: string | null, descricao: string) {
        super(TipoDispositivo.PARAGRAFO, numero, descricao, ['incisos']);
        this.incisos = [];
    }

    adicionar(inciso: Inciso) {

        if (!(inciso instanceof Inciso)) {
            throw new Error('Tipo não suportado.');
        }

        inciso.$parent = this;
        this.incisos.push(inciso);
    }
}

export class Inciso extends Dispositivo {
    public alineas: Alinea[] = [];

    constructor(numero: string | null, descricao: string) {
        super(TipoDispositivo.INCISO, numero, descricao, ['alineas']);
        this.alineas = [];
    }

    adicionar(alinea: Alinea) {
        if (!(alinea instanceof Alinea)) {
            throw new Error('Tipo não suportado.');
        }

        alinea.$parent = this;
        this.alineas.push(alinea);
    }
}

export class Alinea extends Dispositivo {
    public itens: Item[] = [];

    constructor(numero: string, descricao: string) {
        super(TipoDispositivo.ALINEA, numero, descricao, ['itens']);
    }

    adicionar(item: Item) {
        if (!(item instanceof Item)) {
            throw new Error('Tipo não suportado.');
        }

        Object.defineProperty(item, '$parent', { value: this });

        this.itens.push(item);
    }
}

export class Item extends Dispositivo {
    constructor(numero: string, descricao: string) {
        super(TipoDispositivo.ITEM, numero, descricao, []);
    }

    adicionar(): void {
        throw new Error('Não é possível derivar um item.');
    }
}

export abstract class Divisao extends Dispositivo {
    private _subitens: Dispositivo[];

    constructor(tipo: TipoAgrupador, numero: string | null, descricao: string, derivacoes?: string[]) {
        super(tipo, numero, descricao, derivacoes);
    }
    
    adicionar(item: Dispositivo) {
        this._subitens.push(item);
    }

    get subitens(): Dispositivo[] {
        return this._subitens;
    }
}

export class Titulo extends Divisao {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.TITULO, numero, descricao);
    }
}

export class Capitulo extends Divisao {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.CAPITULO, numero, descricao);
    }
}

export class Secao extends Divisao {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SECAO, numero, descricao);
    }
}

export class Subsecao extends Divisao {
    constructor(numero: string, descricao: string) {
        super(TipoAgrupador.SUBSECAO, numero, descricao);
    }
}

function transformarEmLexML(json: IResultadoInterpretacao): string {
    function reducaoInciso(prev: string, inciso: Inciso, idx: number, array: (Inciso[] & { prefixo?: string })): string {
        const idInciso = array.prefixo + '_inc' + (idx + 1);

        return prev + '<Inciso id="' + idInciso + '"><Rotulo>' + inciso.numero + '</Rotulo><p>' + inciso.descricao + '</p>' +
            (inciso.alineas || []).reduce(function (prev: string, alinea: Alinea, idx: number) {
                return prev + '<Alinea id="' + idInciso + '_ali' + (idx + 1) + '"><Rotulo>' + alinea.numero + '</Rotulo><p>' + alinea.descricao + '</p></Alinea>';
            }, '') + '</Inciso>';
    }

    const lexml = '<Articulacao xmlns="http://www.lexml.gov.br/1.0">' +
        json.articulacao.reduce(function (prev, artigo, idx) {
            const idArt = 'art' + (idx + 1);
            let texto = prev + '<Artigo id="' + idArt + '"><Rotulo>Art. ' + (idx + 1) + (idx < 9 ? 'º' : '') + ' –</Rotulo><Caput id="' + idArt + '_cpt"><p>' + artigo.descricao + '</p>';

            if (artigo instanceof Artigo && artigo.incisos.length > 0) {
                artigo.incisos.prefixo = idArt + '_cpt';
                texto += artigo.incisos.reduce(reducaoInciso, '');
            }

            texto += '</Caput>';

            if (artigo instanceof Artigo && artigo.paragrafos.length > 0) {
                texto += artigo.paragrafos.reduce(function (prev, paragrafo, idx, paragrafos) {
                    const idPar = idArt + '_par' + (idx + 1);
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

    return lexml;
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param {String} texto Texto a ser interpretado
 * @param {String} formatoDestino Formato a ser retornado: 'json', 'lexml' (padrão) ou "lexmlString".
 * @param {String} formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 * @returns {Object|DocumentFragment}
 */
export function interpretarArticulacao(texto: string, formatoDestino: 'json', formatoOrigem?: 'texto' | 'html'): IResultadoInterpretacao;
export function interpretarArticulacao(texto: string, formatoDestino: 'lexml', formatoOrigem?: 'texto' | 'html'): DocumentFragment;
export function interpretarArticulacao(texto: string, formatoDestino: 'lexml-string' | 'lexmlstring', formatoOrigem?: 'texto' | 'html'): string;
export function interpretarArticulacao(texto: string, formatoDestino: 'json' | 'lexml' | 'lexml-string' | 'lexmlstring' = 'lexml', formatoOrigem: 'texto' | 'html' = 'texto'): IResultadoInterpretacao | DocumentFragment | string {
    let json: IResultadoInterpretacao;

    try {
        switch ((formatoOrigem || 'texto').toLowerCase()) {
            case 'texto':
                json = parseTexto(texto);
                break;

            case 'html': {
                const div = document.createElement('div');
                div.innerHTML = texto;
                json = parseTexto(removerEntidadeHtml(div.innerHTML.replace(/<P>(.+?)<\/P>/gi, '$1\n').trim()));
                break;
            }
        
            default:
                throw new Error('Formato não suportado.');
        }

        switch ((formatoDestino || 'lexml').toLowerCase()) {
            case 'json':
                return json;

            case 'lexml':
                return transformarEmLexMLFragmento(json);

            case 'lexmlstring':
            case 'lexml-string':
                return transformarEmLexML(json);

            default:
                throw new Error('Formato não suportado: ' + formatoDestino);
        }
    } catch (e) {
        throw {
            mensagem: 'Erro interpretando articulação.',
            item: texto,
            formato: formatoDestino,
            erroOriginal: e
        };
    }
}

function removerEntidadeHtml(html: string): string {
    const safeXmlEntities = ['&lt;', '&gt;', '&quot;', '&amp;', '&apos;'];

    return html.replace(/&.+?;/g, function(entidade) {
        if(safeXmlEntities.indexOf(entidade)>=0) {
            return entidade;
        } else {
            /* A entidade não é uma das predefinidas no xml e é suportada só no HTML. Por exemplo: &nbsp; ou &copy;.
             * Nesse caso, converte para texto e no replace abaixo substitui pela notação unicode.
             */
            const span = document.createElement('span');
            span.innerHTML = entidade;
            return span.textContent;
        }
    });
}

function transformarEmLexMLFragmento(json: IResultadoInterpretacao): DocumentFragment {
    const lexml = transformarEmLexML(json);
    const container = document.createElement('div');
    container.innerHTML = lexml;

    const fragmento = document.createDocumentFragment();

    while (container.firstChild) {
        fragmento.appendChild(container.firstChild);
    }

    return fragmento;
}
