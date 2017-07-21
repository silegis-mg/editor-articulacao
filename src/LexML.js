

/**
 * Cria um novo LI para um caput, durante a importação do LexML.
 * 
 * @param {Node} artigo
 * @returns {Element} LI com o caput.
 */
function criarLIParaParagrafo(artigo, selecao) {
    var li, paragrafos, i, novoP;

    paragrafos = artigo.querySelectorAll(selecao || ':scope > p');

    li = document.createElement('li');
    li.innerHTML = paragrafos[0].innerHTML;

    /* Se houver mais de um parágrafo, deixamos o primeiro sem o P
     * e os demais recebem P.
     */
    for (i = 1; i < paragrafos.length; i++) {
        novoP = document.createElement('P');
        novoP.innerHTML = paragrafos[i].innerHTML;
        li.appendChild(novoP);
    }

    return li;
}

/**
 * Transforma o LexML no conteúdo para editor de articulação.
 * 
 * @param {type} raiz
 * @returns {Element}
 */
function importarLexML(raiz) {
    var ulArticulacao = document.createElement('ul');

    ulArticulacao.setAttribute('data-tipo', 'articulacao');

    forEach(raiz.children, function (artigo) {
        var li, incisos, paragrafos;

        if (artigo.tagName != "ARTIGO") {
            $log.error("Tag inválida na raiz da articulação: " + artigo.tagName);
            return;
        }

        li = criarLIParaParagrafo(artigo, 'Caput > p');
        ulArticulacao.appendChild(li);

        incisos = artigo.querySelectorAll('Caput > Inciso');

        if (incisos.length > 0) {
            ulArticulacao.appendChild(importarLexMLIncisos(incisos));
        }

        paragrafos = artigo.querySelectorAll('Paragrafo');

        if (paragrafos.length > 0) {
            ulArticulacao.appendChild(importarLexMLParagrafos(paragrafos));
        }
    });

    return ulArticulacao;
}

function importarLexMLItens(itens) {

    var ulItens = document.createElement('ul');
    ulItens.setAttribute('data-tipo', 'itens');

    forEach(itens, function (item) {
        var liItem = document.createElement('li');
        liItem.innerHTML = item.querySelector('p').innerHTML;
        ulItens.appendChild(liItem);
    });

    return ulItens;
}

function importarLexMLAlineas(alineas) {

    var ulAlineas = document.createElement('ul');
    ulAlineas.setAttribute('data-tipo', 'alineas');

    forEach(alineas, function (alinea) {

        var li = document.createElement('li');
        li.innerHTML = alinea.querySelector('p').innerHTML;
        ulAlineas.appendChild(li);

        var itens = alinea.querySelectorAll('Item');
        if (itens.length > 0) {
            ulAlineas.appendChild(importarLexMLItens(itens));
        }
    });

    return ulAlineas;
}

function importarLexMLIncisos(incisos) {
    var ul = document.createElement('ul');
    ul.setAttribute('data-tipo', 'incisos');

    forEach(incisos, function (inciso) {

        var li = criarLIParaParagrafo(inciso);
        ul.appendChild(li);

        var alineas = inciso.querySelectorAll('Alinea');
        if (alineas.length > 0) {
            ul.appendChild(importarLexMLAlineas(alineas));
        }
    });

    return ul;
}

function importarLexMLParagrafos(paragrafos) {
    var ul = document.createElement('ul');
    ul.setAttribute('data-tipo', 'paragrafos');

    forEach(paragrafos, function (paragrafo) {
        var li, incisos;

        li = criarLIParaParagrafo(paragrafo);
        ul.appendChild(li);

        incisos = paragrafo.querySelectorAll('Inciso');

        if (incisos.length > 0) {
            ul.appendChild(importarLexMLIncisos(incisos));
        }
    });

    return ul;
}
