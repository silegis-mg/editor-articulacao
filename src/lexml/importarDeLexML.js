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
 * Transforma o LexML no conteúdo para editor de articulação.
 * 
 * @param {Element} elemento
 * @param {DocumentFragment} resultado
 * @returns {DocumentFragment}
 */
function importarDeLexML(elemento, resultado) {
    if (!resultado) {
        resultado = document.createDocumentFragment();
    }

    if (!elemento) {
        return resultado;
    } else if (elemento instanceof NodeList || elemento instanceof HTMLCollection) {
        for (let i = 0; i < elemento.length; i++) {
            importarDeLexML(elemento[i], resultado);
        }
    } else if (typeof elemento === 'string') {
        let container = document.createElement('html');
        container.innerHTML = elemento.replace(/<([^ >]+)\s*\/>/g, '<$1></$1>'); // HTML não suporta notação <tag /> como no XML.
        importarDeLexML(container.querySelector('body').children, resultado);
    } else {
        switch (elemento.tagName) {
            case 'ARTICULACAO':
                importarDeLexML(elemento.children, resultado);
                break;

            case 'TITULO':
            case 'CAPITULO':
            case 'SECAO':
            case 'SUBSECAO':
                resultado.appendChild(criarAgrupador(elemento.tagName.toLowerCase(), elemento.querySelector('NomeAgrupador').innerHTML));
                importarDeLexML(elemento.children, resultado);
                break;

            case 'NOMEAGRUPADOR':
            case 'ROTULO':
            case 'P':
                // Ignora.
                break;

            case 'ARTIGO':
                clonar(elemento, 'Caput > p', idx => idx === 0 ? 'artigo' : 'continuacao', resultado);

                if (/\d+º?-[A-Z]/.test(elemento.querySelector('Rotulo').textContent)) {
                    resultado.lastElementChild.classList.add('emenda');
                }
                
                let incisos = elemento.querySelectorAll('Caput > Inciso');
                importarDeLexML(incisos, resultado);

                let paragrafos = elemento.querySelectorAll('Paragrafo');
                let dispositivoAtual = resultado.lastElementChild;

                importarDeLexML(paragrafos, resultado);

                if (paragrafos.length === 1) {
                    dispositivoAtual.nextElementSibling.classList.add('unico');
                }
                break;

            case 'INCISO':
            case 'ALINEA':
            case 'ITEM':
            case 'PARAGRAFO':
                let p = obterP(elemento);
                clonar(p, null, elemento.tagName.toLowerCase(), resultado);
                importarDeLexML(elemento.children, resultado);
                break;

            default:
                throw 'Elemento não esperado: ' + elemento.tagName;
        }
    }

    return resultado;
}

/**
 * Cria um elemento agrupador.
 * 
 * @param {String} agrupador Tipo do agrupador.
 * @param {String} nome Nome do agrupador.
 * @returns {Element} Agrupador
 */
function criarAgrupador(agrupador, nome) {
    let elemento = document.createElement('p');
    elemento.setAttribute('data-tipo', agrupador);
    elemento.innerHTML = nome;
    return elemento;
}

/**
 * Obtém o primeiro elemento P filho.
 * 
 * @param {Element} elemento
 * @returns {Element}
 */
function obterP(elemento) {
    let p = elemento.firstElementChild;

    while (p.tagName !== 'P') {
        p = p.nextElementSibling;
    }

    return p;
}

/**
 * Clona um elemento.
 * 
 * @param {Element} elemento Elemento que será clonado ou que contém os elementos a serem clonados, se a query for especificada.
 * @param {String} query Query a ser executada para filtrar os elementos filhos.
 * @param {String|function} tipoFinal Tipo final do elemento clonado (string) ou uma função que recebe (índice, elemento) e retorna o tipo em string.
 * @param {DocumentFragment} resultado 
 */
function clonar(elemento, query, tipoFinal, resultado) {
    let fnTipo;

    switch (typeof tipoFinal) {
        case 'string':
            fnTipo = () => tipoFinal;
            break;

        case 'function':
            fnTipo = tipoFinal;
            break;

        default:
            throw new Error('Tipo final não é literal nem função.');
    }

    if (query) {
        var itens = elemento.querySelectorAll(query);

        for (let i = 0; i < itens.length; i++) {
            let novoItem = itens[i].cloneNode(true);
            novoItem.setAttribute('data-tipo', fnTipo(i, novoItem));
            resultado.appendChild(novoItem);
        }
    } else {
        let novoItem = elemento.cloneNode(true);
        novoItem.setAttribute('data-tipo', fnTipo(0, novoItem));
        resultado.appendChild(novoItem);
    }

    return resultado;
}

export default importarDeLexML;