/**
 * Transforma o LexML no conteúdo para editor de articulação.
 * 
 * TODO: Suportar emendas (ex.: Art. 29-A da constituição).
 * 
 * @param {Element} elemento
 * @param {DocumentFragment} resultado
 * @returns {DocumentFragment}
 */
function importarDeLexML(elemento, resultado) {
    if (!resultado) {
        resultado = document.createDocumentFragment();
    }

    if (elemento instanceof NodeList || elemento instanceof HTMLCollection) {
        for (let i = 0; i < elemento.length; i++) {
            importarDeLexML(elemento[i], resultado);
        }
    } else if (typeof elemento === 'string') {
        let container = document.createElement('div');
        container.innerHTML = elemento;
        importarDeLexML(container.children, resultado);
    } else {
        switch (elemento.tagName) {
            case 'ARTICULACAO':
                importarDeLexML(elemento.children, resultado);
                break;

            case 'TITULO':
            case 'CAPITULO':
            case 'SECAO':
            case 'SUBSECAO':
                resultado.appendChild(criarAgrupador(elemento.tagName.toLowerCase(), elemento.querySelector('NomeAgrupador').textContent));
                importarDeLexML(elemento.children, resultado);
                break;

            case 'NOMEAGRUPADOR':
            case 'ROTULO':
            case 'P':
                // Ignora.
                break;

            case 'ARTIGO':
                clonar(elemento, 'Caput > p', 'artigo', resultado);

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
                let p = obterP(elemento)
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
    elemento.textContent = nome;
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
 * @param {String} tipoFinal Tipo final do elemento clonado.
 * @param {DocumentFragment} resultado 
 */
function clonar(elemento, query, tipoFinal, resultado) {
    if (query) {
        var itens = elemento.querySelectorAll(query);

        for (let i = 0; i < itens.length; i++) {
            let novoItem = itens[i].cloneNode(true);
            novoItem.setAttribute('data-tipo', tipoFinal);
            resultado.appendChild(novoItem);
        }
    } else {
        let novoItem = elemento.cloneNode(true);
        novoItem.setAttribute('data-tipo', tipoFinal);
        resultado.appendChild(novoItem);
    }

    return resultado;
}

export default importarDeLexML;