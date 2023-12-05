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

import { IOpcoesRotulos } from '../IOpcoesEditorArticulacaoController';
import { TipoDispositivoOuAgrupador } from '../TipoDispositivo';
import padrao from '../opcoesPadrao';
import ArticulacaoInvalidaException from './ArticulacaoInvalidaException';
import { TipoElementoLexML } from './TipoElementoLexML';

const htmlInline = new Set(['SPAN', 'B', 'I', 'A', 'SUB', 'SUP', 'INS', 'DEL', 'DFN']);

/**
 * Exporta para o XML definido no LexML (http://projeto.lexml.gov.br/documentacao/Parte-3-XML-Schema.pdf),
 * a partir da estrutura do HTML do editor de articulação.
 * 
 * @param {Element} dispositivoDOM Dispositivo da articulação, dentro do editor de articulação,
 * onde será iniciada a exportação para LexML, ou o próprio container (elemento raíz) do
 * editor de articulação.
 * @returns {Element} Articulação do LexML
 */
export default function exportarParaLexML(dispositivoDOM: Element, rotulos: IOpcoesRotulos) {
    let cntArtigos = 0;

    if (!rotulos) {
        rotulos = padrao.rotulo;
    }

    /**
     * Representa o contexto da transformação,
     * com informações e métodos para adição de dispositivos,
     * podendo ser especializado por tipo.
     */
    class ContextoTransformacao {
        protected cntSubitens: {
            [idx in TipoElementoLexML]?: number;
        };

        public nEmenda = 0;

        constructor(public readonly dispositivoLexML: Element, public readonly contextoAnterior?: ContextoTransformacao) {
            this.cntSubitens = {
                get Artigo() {
                    return cntArtigos;
                },
                set Artigo(valor) {
                    cntArtigos = valor;
                }
            };
        }

        get id(): string {
            return this.dispositivoLexML.id;
        }

        /**
         * Obtém o identificador a ser considerado ao criar o id para
         * um subtipo deste dispositivo.
         * 
         * @param {String} subtipo Subtipo desejado.
         */
        getIdReferencia(subtipo: TipoElementoLexML): string {       // eslint-disable-line @typescript-eslint/no-unused-vars
            return this.dispositivoLexML.id;
        }

        /**
         * Tipo do dispositivo.
         */
        get tipo(): TipoElementoLexML {
            return this.dispositivoLexML.tagName as TipoElementoLexML;
        }

        adicionarSubitem(dispositivoLexML: Element) {
            const elemento = dispositivoLexML.tagName as TipoElementoLexML;
            this.cntSubitens[elemento] = this.cntSubitens[elemento] ? this.cntSubitens[elemento] + 1 : 1;
            this.dispositivoLexML.appendChild(dispositivoLexML);
        }

        adicionarSubitemEmendado(dispositivoLexML: Element) {
            this.dispositivoLexML.appendChild(dispositivoLexML);
        }

        adicionarProximo(dispositivoLexML: Element) {
            this.dispositivoLexML.parentNode.appendChild(dispositivoLexML);
        }

        possuiSubtipo(subtipo: TipoElementoLexML) {
            switch (this.tipo) {
                case TipoElementoLexML.ARTICULACAO:
                    return subtipo === TipoElementoLexML.ARTIGO || subtipo === TipoElementoLexML.TITULO || subtipo === TipoElementoLexML.CAPITULO || subtipo === TipoElementoLexML.SECAO || subtipo === TipoElementoLexML.LIVRO || subtipo === TipoElementoLexML.PARTE;

                case TipoElementoLexML.PARTE:
                    return subtipo === TipoElementoLexML.LIVRO;

                case TipoElementoLexML.LIVRO:
                    return subtipo === TipoElementoLexML.TITULO;

                case TipoElementoLexML.TITULO:
                    return subtipo === TipoElementoLexML.CAPITULO || subtipo === TipoElementoLexML.ARTIGO;

                case TipoElementoLexML.CAPITULO:
                    return subtipo === TipoElementoLexML.SECAO || subtipo === TipoElementoLexML.ARTIGO;

                case TipoElementoLexML.SECAO:
                    return subtipo === TipoElementoLexML.SUBSECAO || subtipo === TipoElementoLexML.ARTIGO;

                case TipoElementoLexML.SUBSECAO:
                    return subtipo === TipoElementoLexML.ARTIGO;

                case TipoElementoLexML.ARTIGO:
                    return subtipo === TipoElementoLexML.INCISO || subtipo === TipoElementoLexML.PARAGRAFO;

                case TipoElementoLexML.INCISO:
                    return subtipo === TipoElementoLexML.ALINEA;

                case TipoElementoLexML.ALINEA:
                    return subtipo === TipoElementoLexML.ITEM;

                case TipoElementoLexML.ITEM:
                    return false;

                case TipoElementoLexML.PARAGRAFO:
                    return subtipo === 'Inciso';

                default:
                    throw new Error('Tipo desconhecido: ' + this.tipo);
            }
        }

        contarSubitens(subtipo: TipoElementoLexML) {
            return this.cntSubitens[subtipo] ?? 0;
        }
    }

    /**
     * Contexto de transformação especializado para artigo, que possui
     * incisos no caput e parágrafos no artigo.
     */
    class ContextoTransformacaoArtigo extends ContextoTransformacao {
        getIdReferencia(subtipo: TipoElementoLexML) {
            // O inciso é sobre o caput. Já o parágrafo é sobre o artigo.
            return subtipo === 'Inciso' ? this.dispositivoLexML.id + '_cpt' : this.dispositivoLexML.id;
        }

        adicionarSubitem(dispositivoLexML: Element) {
            const tipo = dispositivoLexML.tagName as TipoElementoLexML;
            
            if (tipo === 'p' || tipo === TipoElementoLexML.INCISO) {
                this.dispositivoLexML.querySelector('Caput').appendChild(dispositivoLexML);
            } else {
                this.dispositivoLexML.appendChild(dispositivoLexML);
            }

            this.cntSubitens[tipo] = this.cntSubitens[tipo] ? this.cntSubitens[tipo] + 1 : 1;
        }
    }

    /**
     * Contexto de transformação especializado em divisões de texto (agrupadores),
     * como título, capítulo, seção e subseção.
     */
    class ContextoTransformacaoAgrupador extends ContextoTransformacao {
        getIdReferencia(subtipo: TipoElementoLexML) {
            return subtipo === TipoElementoLexML.ARTIGO ? null : super.getIdReferencia(subtipo);
        }
    }

    /**
     * Cria o contexto adequado conforme o tipo do nó.
     * 
     * @param {Element} dispositivoLexML 
     * @param {*} contextoAnterior 
     */
    function criarContexto(dispositivoLexML: Element, contextoAnterior: ContextoTransformacao) {
        switch (dispositivoLexML.tagName) {
            case TipoElementoLexML.ARTIGO:
                return new ContextoTransformacaoArtigo(dispositivoLexML, contextoAnterior);

            case TipoElementoLexML.PARTE:
            case TipoElementoLexML.TITULO:
            case TipoElementoLexML.CAPITULO:
            case TipoElementoLexML.SECAO:
            case TipoElementoLexML.SUBSECAO:
                return new ContextoTransformacaoAgrupador(dispositivoLexML, contextoAnterior);
                
            default:
                return new ContextoTransformacao(dispositivoLexML, contextoAnterior);
        }
    }

    const raiz = document.createElementNS('http://www.lexml.gov.br/1.0', 'Articulacao');
    let contexto = new ContextoTransformacao(raiz);

    // Se for o container de edição, então movemos para o primeiro filho.
    if (dispositivoDOM.classList.contains('silegismg-editor-articulacao')) {
        dispositivoDOM = dispositivoDOM.firstElementChild;
    }

    while (dispositivoDOM) {
        const tipoDispositivoEditorArticulacao = dispositivoDOM.getAttribute('data-tipo') as TipoDispositivoOuAgrupador;

        if (!tipoDispositivoEditorArticulacao) {
            throw new ArticulacaoInvalidaException(dispositivoDOM, 'Dispositivo não possui tipo definido.');
        } else if (tipoDispositivoEditorArticulacao === 'continuacao') {
            if (!contexto.contextoAnterior) {
                throw new ArticulacaoInvalidaException(dispositivoDOM, 'Continuação não possui dispositivo anterior.');
            }
            
            const p = criarElementoP(dispositivoDOM);
            contexto.adicionarSubitem(p);
        } else {
            const tipo = tipoDispositivoEditorArticulacao.replace(/^[a-z]/, letra => letra.toUpperCase()) as TipoElementoLexML;
            
            while (contexto && !contexto.possuiSubtipo(tipo)) {
                contexto = contexto.contextoAnterior;
            }

            if (!contexto) {
                throw new ArticulacaoInvalidaException(dispositivoDOM, 'Dispositivo do tipo "' + tipo.toLowerCase() + '" inesperado neste ponto.');
            }

            if (dispositivoDOM.classList.contains('emenda')) {
                contexto.nEmenda++;
            } else {
                contexto.nEmenda = 0;
            }

            const dispositivoLexML = criarElementoLexML(
                tipo,
                dispositivoDOM,
                contexto.getIdReferencia(tipo),
                contexto.contarSubitens(tipo),
                dispositivoDOM.classList.contains('unico'),
                contexto.nEmenda,
                rotulos
            );

            if (tipo === TipoElementoLexML.PARAGRAFO && dispositivoDOM.classList.contains('unico')) {
                // Adiciona o sufixo "u" ao identificador do parágrafo único
                dispositivoLexML.id = dispositivoLexML.id + 'u';
            }

            if (contexto.nEmenda) {
                contexto.adicionarSubitemEmendado(dispositivoLexML);
            } else {
                contexto.adicionarSubitem(dispositivoLexML);
            }

            contexto = criarContexto(dispositivoLexML, contexto);
        }

        dispositivoDOM = dispositivoDOM.nextElementSibling;
    }

    return raiz;
}

function criarElementoLexML(tipo: TipoElementoLexML, conteudo: Element, idPai: string, idxFilho: number, unico: boolean, nEmenda: number, rotulos: IOpcoesRotulos) {
    let id;

    id = tipo.substring(0, 3).toLowerCase();
    id = idPai ? idPai + '_' + id : id;

    if (nEmenda) {
        id += idxFilho + '-' + nEmenda;
    } else {
        id += idxFilho + 1;
    }

    const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', tipo);
    elemento.setAttribute('id', id);

    elemento.appendChild(criarElementoRotuloLexML(tipo, nEmenda ? idxFilho : idxFilho + 1, unico, nEmenda, rotulos));

    switch (tipo) {
        case TipoElementoLexML.ARTIGO:
            elemento.appendChild(criarCaputLexML(conteudo, id));
            break;

        // Agrupadores
        case TipoElementoLexML.PARTE:
        case TipoElementoLexML.LIVRO:
        case TipoElementoLexML.TITULO:
        case TipoElementoLexML.CAPITULO:
        case TipoElementoLexML.SECAO:
        case TipoElementoLexML.SUBSECAO:
            elemento.appendChild(criarElementoNomeAgrupador(conteudo));
            break;

        default:
            elemento.appendChild(criarElementoP(conteudo));
            break;
    }

    return elemento;
}

function criarElementoRotuloLexML(tipo: TipoElementoLexML, numero: number, unico: boolean, nEmenda: number, rotulos: IOpcoesRotulos) {
    const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'Rotulo');

    switch (tipo) {
        case TipoElementoLexML.ARTIGO:
            if (nEmenda) {
                elemento.innerHTML = 'Art. ' + numero + (numero < 10 ? 'º-' : '-') + transformarLetra(nEmenda, true) + (numero < 10 ? rotulos.separadorArtigo : rotulos.separadorArtigoSemOrdinal);
            } else {
                elemento.innerHTML = 'Art. ' + numero + (numero < 10 ? 'º' + rotulos.separadorArtigo : rotulos.separadorArtigoSemOrdinal);
            }
            break;

        case TipoElementoLexML.PARAGRAFO:
            elemento.innerHTML = unico ? 'Parágrafo único' + rotulos.separadorParagrafoUnico : '§ ' + numero + (numero < 10 ? 'º' + rotulos.separadorParagrafo : rotulos.separadorParagrafoSemOrdinal);
            break;

        case TipoElementoLexML.INCISO:
            elemento.innerHTML = transformarNumeroRomano(numero) + rotulos.separadorInciso;
            break;

        case TipoElementoLexML.ALINEA:
            elemento.textContent = transformarLetra(numero) + rotulos.separadorAlinea;
            break;

        case TipoElementoLexML.ITEM:
            elemento.innerHTML = numero + rotulos.separadorItem;
            break;

        case TipoElementoLexML.TITULO:
            elemento.textContent = 'Título ' + transformarNumeroRomano(numero);
            break;

        case TipoElementoLexML.CAPITULO :
            elemento.textContent = 'Capítulo ' + transformarNumeroRomano(numero);
            break;

        case TipoElementoLexML.SECAO:
            elemento.textContent = 'Seção ' + transformarNumeroRomano(numero);
            break;

        case TipoElementoLexML.SUBSECAO:
            elemento.textContent = 'Subseção ' + transformarNumeroRomano(numero);
            break;

        default:
            throw new Error('Tipo não suportado na formatação de rótulo: ' + tipo);
    }

    return elemento;
}

function criarCaputLexML(caput: Element, idPai: string) {
    const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'Caput');
    const paragrafo = criarElementoP(caput);

    elemento.setAttribute('id', idPai + '_cpt');
    elemento.appendChild(paragrafo);
    normalizarParagrafo(paragrafo);

    return elemento;
}

function criarElementoP(paragrafo: Element) {
    const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'p');
    criarConteudoInline(paragrafo, elemento);
    normalizarParagrafo(elemento);
    return elemento;
}

function criarConteudoInline(origem: Element, destino: Element) {

    interface IContextoExportacao {
        /**
         * Objeto de contexto de exportação anterior.
         */
        anterior: IContextoExportacao | null;
    
        /**
         * Elemento que, se encontrado, deve retroceder o contexto. Utilizado para navegar
         * por elementos filhos e identificar quando o nível, na navegação, retrocede,
         * obrigando a retroceder também o contexto.
         */
        retrocederEm: Element | null;
    
        /**
         * Elemento na nova árvore onde os itens serão inseridos.
         */
        destino: Element;
    }
        
    const arvore = document.createTreeWalker(origem, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null /* necesário no IE 11 */);
    let atual: IContextoExportacao = {
        anterior: null,
        retrocederEm: null,
        destino
    };
    let primeiroTexto = true;
    let ultimoTexto: Node | null = null;

    while (arvore.nextNode()) {
        const item = arvore.currentNode;

        if (item.parentNode === atual.retrocederEm) {
            atual = atual.anterior;
        }

        if (item.nodeType === Node.TEXT_NODE) {
            ultimoTexto = item.cloneNode();

            if (primeiroTexto) {
                primeiroTexto = false;
                ultimoTexto.textContent = ultimoTexto.textContent.replace(/^\s+/, '');
            }

            atual.destino.appendChild(ultimoTexto);
        } else if (!(item instanceof Element)) {
            // Ignora.
        } else if (htmlInline.has(item.tagName)) {
            const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', item.tagName.toLowerCase());
            atual.destino.appendChild(elemento);
            atual = {
                anterior: atual,
                retrocederEm: item.parentNode as Element,
                destino: elemento
            };
        } else if (item.tagName === 'BR') {
            // Ignora
        } else {
            throw new ArticulacaoInvalidaException(origem, 'Elemento não permitido: ' + item.tagName);
        }
    }

    if (ultimoTexto) {  
        ultimoTexto.textContent = ultimoTexto.textContent.replace(/\s+$/, '');
    }

    return destino;
}

function criarElementoNomeAgrupador(elementoAgrupador: Element): Element {
    const elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'NomeAgrupador');
    criarConteudoInline(elementoAgrupador, elemento);
    return elemento;
}

/**
 * Desmembra elementos P dentro de outro P, colocando-os no mesmo nível.
 * Exemplo: `<P><P>1</P><P>2</P></P>` vira `<P>1</P><P>2</P>`
 * 
 * @param {Element} paragrafo
 */
function normalizarParagrafo(paragrafo: Element) {
    while (paragrafo.hasAttributes()) {
        paragrafo.removeAttribute(paragrafo.attributes[0].name);
    }

    /* Microsoft Edge não implementa a interface HTMLElement em document.createElementNS.
     * Portanto, usaremos children se disponível, ou childNodes, para o Edge.
     */
    const itens = paragrafo.children || paragrafo.childNodes;

    for (let i = 0; i < itens.length; i++) {
        let item = itens[i];

        if ('tagName' in item && item.tagName === 'p') {
            /* Tag P dentro de P. Isso não deveria ocorrer, então vamos tratar como continuação.
             * Neste caso, move-se todos os elementos a partir do índice 'i'
             * para novos parágrafos após o atual.
             */
            while (itens.length > i) {  // itens é uma lista viva, refletindo a movimentação dos nós abaixo
                item = itens[i];

                if ('tagName' in item && item.tagName === 'p') {
                    paragrafo.parentNode.insertBefore(item, paragrafo.nextSibling);
                    normalizarParagrafo(item);
                } else {
                    const novoParagrafo = document.createElementNS('http://www.lexml.gov.br/1.0', 'p');
                    novoParagrafo.appendChild(item);
                    paragrafo.parentNode.insertBefore(novoParagrafo, paragrafo.nextSibling);
                    normalizarParagrafo(novoParagrafo);
                }
            }
        }
    }
}

/**
 * Escreve o número em romano.
 * 
 * @param {Number} numero 
 */
function transformarNumeroRomano(numero: number): string {
    const digitos = String(numero).split('');
    const tabela = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    let resultado = '';
    let i = 3;

    while (i--) {
        resultado = (tabela[+digitos.pop() + (i * 10)] || '') + resultado;
    }

    return new Array(+digitos.join('') + 1).join('M') + resultado;
}

/**
 * Escreve o número em letra.
 * 
 * @param {Number} numero 
 */
function transformarLetra(numero: number, maiuscula: boolean = false): string {
    if (numero < 1) {
        throw new Error('Número deve ser positivo.');
    }

    return String.fromCharCode((maiuscula ? 64  : 96) + numero);
}
