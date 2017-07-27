import ArticulacaoInvalidaException from './ArticulacaoInvalidaException';

/**
 * Exporta para o XML definido no LexML (http://projeto.lexml.gov.br/documentacao/Parte-3-XML-Schema.pdf),
 * a partir da estrutura do HTML do editor de articulação.
 * 
 * @param {Element} dispositivoDOM Dispositivo da articulação, dentro do editor de articulação,
 * onde será iniciada a exportação para LexML, ou o próprio container (elemento raíz) do
 * editor de articulação.
 * @returns {Element} Articulação do LexML
 * 
 * @author Júlio César e Melo
 */
function exportarParaLexML(dispositivoDOM) {
    var cntArtigos = 0;

    /**
     * Representa o contexto da transformação,
     * com informações e métodos para adição de dispositivos,
     * podendo ser especializado por tipo.
     */
    class ContextoTransformacao {
        constructor(dispositivoLexML, contextoAnterior) {
            this.dispositivoLexML = dispositivoLexML;
            this.contextoAnterior = contextoAnterior;
            this.cntSubitens = {
                get Artigo() {
                    return cntArtigos;
                },
                set Artigo(valor) {
                    cntArtigos = valor;
                }
            };
        }

        get id() {
            return this.dispositivoLexML.id;
        }

        /**
         * Obtém o identificador a ser considerado ao criar o id para
         * um subtipo deste dispositivo.
         * 
         * @param {String} subtipo Subtipo desejado.
         */
        getIdReferencia(subtipo) {
            return this.dispositivoLexML.id;
        }

        /**
         * Tipo do dispositivo.
         */
        get tipo() {
            return this.dispositivoLexML.tagName;
        }

        adicionarSubitem(dispositivoLexML) {
            this.cntSubitens[dispositivoLexML.tagName] = this.cntSubitens[dispositivoLexML.tagName] ? this.cntSubitens[dispositivoLexML.tagName] + 1 : 1;
            this.dispositivoLexML.appendChild(dispositivoLexML);
        }

        adicionarProximo(dispositivoLexML) {
            this.dispositivoLexML.parentElement.appendChild(dispositivoLexML);
        }

        possuiSubtipo(subtipo) {
            switch (this.tipo) {
                case 'Articulacao':
                    return subtipo === 'Artigo' || subtipo === 'Titulo' || subtipo === 'Capitulo' || subtipo === 'Secao' || subtipo === 'Livro' || subtipo === 'Parte';

                case 'Parte':
                    return subtipo === 'Livro';

                case 'Livro':
                    return subtipo === 'Titulo';

                case 'Titulo':
                    return subtipo === 'Capitulo' || subtipo === 'Artigo';

                case 'Capitulo':
                    return subtipo === 'Secao' || subtipo === 'Artigo';

                case 'Secao':
                    return subtipo === 'Subsecao' || subtipo === 'Artigo';

                case 'Subsecao':
                    return subtipo === 'Artigo';

                case 'Artigo':
                    return subtipo === 'Inciso' || subtipo === 'Paragrafo';

                case 'Inciso':
                    return subtipo === 'Alinea';

                case 'Alinea':
                    return subtipo === 'Item';

                case 'Item':
                    return false;

                case 'Paragrafo':
                    return subtipo === 'Paragrafo';

                default:
                    throw 'Tipo desconhecido: ' + this.tipo;
            }
        }

        contarSubitens(subtipo) {
            return this.cntSubitens[subtipo] || 0;
        }
    }

    /**
     * Contexto de transformação especializado para artigo, que possui
     * incisos no caput e parágrafos no artigo.
     */
    class ContextoTransformacaoArtigo extends ContextoTransformacao {
        getIdReferencia(subtipo) {
            // O inciso é sobre o caput. Já o parágrafo é sobre o artigo.
            return subtipo === 'Inciso' ? this.dispositivoLexML.id + '_cpt' : this.dispositivoLexML.id;
        }

        adicionarSubitem(dispositivoLexML) {
            if (dispositivoLexML.tagName === 'P' || dispositivoLexML.tagName === 'Inciso') {
                this.dispositivoLexML.querySelector('Caput').appendChild(dispositivoLexML);
            } else {
                this.dispositivoLexML.appendChild(dispositivoLexML);
            }

            this.cntSubitens[dispositivoLexML.tagName] = this.cntSubitens[dispositivoLexML.tagName] ? this.cntSubitens[dispositivoLexML.tagName] + 1 : 1;
        }
    }

    /**
     * Cria o contexto adequado conforme o tipo do nó.
     * 
     * @param {Element} dispositivoLexML 
     * @param {*} contextoAnterior 
     */
    function criarContexto(dispositivoLexML, contextoAnterior) {
        if (dispositivoLexML.tagName === 'Artigo') {
            return new ContextoTransformacaoArtigo(dispositivoLexML, contextoAnterior);
        } else {
            return new ContextoTransformacao(dispositivoLexML, contextoAnterior);
        }
    }

    let raiz = document.createElementNS('http://www.lexml.gov.br/1.0', 'Articulacao');
    let contexto = new ContextoTransformacao(raiz);

    // Se for o container de edição, então movemos para o primeiro filho.
    if (dispositivoDOM.classList.contains('silegismg-editor-articulacao')) {
        dispositivoDOM = dispositivoDOM.firstElementChild;
    }

    while (dispositivoDOM) {
        let tipo = dispositivoDOM.getAttribute('data-tipo').replace(/^[a-z]/, letra => letra.toUpperCase());

        if (tipo === 'Continuacao') {
            let p = criarElementoP(dispositivoDOM.innerHTML);
            contexto.adicionarSubitem(p);
        } else {
            while (contexto && !contexto.possuiSubtipo(tipo)) {
                contexto = contexto.contextoAnterior;
            }

            if (!contexto) {
                throw new ArticulacaoInvalidaException(dispositivoDOM, 'Dispositivo do tipo "' + tipo.toLowerCase() + '" inesperado neste ponto.');
            }

            let dispositivoLexML = criarElementoLexML(tipo, dispositivoDOM.innerHTML, contexto.getIdReferencia(tipo), contexto.contarSubitens(tipo), dispositivoDOM.classList.contains('unico'));

            if (tipo === 'Paragrafo' && dispositivoDOM.classList.contains('unico')) {
                // Adiciona o sufixo "u" ao identificador do parágrafo único
                dispositivoLexML.id = dispositivoLexML.id + 'u';
            }

            contexto.adicionarSubitem(dispositivoLexML);
            contexto = criarContexto(dispositivoLexML, contexto);
        }

        dispositivoDOM = dispositivoDOM.nextElementSibling;
    }

    return raiz;
}

function forEach(elementos, callback) {
    var i;

    for (i = 0; i < elementos.length; i++) {
        callback(elementos[i]);
    }
}

function criarElementoLexML(tipo, conteudo, idPai, idxFilho, unico) {
    var elemento, id;

    id = tipo.substr(0, 3).toLowerCase();
    id = (idPai ? idPai + '_' + id : id) + (idxFilho + 1);

    elemento = document.createElementNS('http://www.lexml.gov.br/1.0', tipo);
    elemento.setAttribute('id', id);
    elemento.appendChild(criarRotuloLexML(tipo, idxFilho + 1, unico)); // O rótulo será preenchido depois

    switch (tipo) {
        case 'Artigo':
            elemento.appendChild(criarCaputLexML(conteudo, id));
            break;

        // Agrupadores
        case 'Parte':
        case 'Livro':
        case 'Titulo':
        case 'Capitulo':
        case 'Secao':
        case 'Subsecao':
            elemento.appendChild(criarNomeAgrupador(conteudo));
            break;

        default:
            elemento.appendChild(criarElementoP(conteudo));
            break;
    }

    return elemento;
}

function criarRotuloLexML(tipo, numero, unico) {
    var elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'Rotulo');

    switch (tipo) {
        case 'Artigo':
            elemento.textContent = 'Art. ' + numero + (numero < 10 ? 'º &ndash;' : '&ndash;');
            break;

        case 'Paragrafo':
            elemento.textContent = unico ? 'Parágrafo único &ndash;' : '§ ' + numero + (numero < 10 ? 'º &ndash;' : ' &ndash;');
            break;

        case 'Inciso':
            elemento.textContent = transformarNumeroRomano(numero) + ' &ndash;';
            break;

        case 'Alinea':
            elemento.textContent = transformarLetra(numero) + ')';
            break;

        case 'Item':
            elemento.textContent = numero + ' &ndash;';
            break;

        case 'Titulo':
            elemento.textContent = 'Título ' + transformarNumeroRomano(numero);
            break;

        case 'Capitulo' :
            elemento.textContent = 'Capítulo ' + transformarNumeroRomano(numero);
            break;

        case 'Secao':
            elemento.textContent = 'Seção ' + transformarNumeroRomano(numero);
            break;

        case 'Subsecao':
            elemento.textContent = 'Subseção ' + transformarNumeroRomano(numero);
            break;

        default:
            throw "Tipo não suportado na formatação de rótulo: " + tipo;
    }

    return elemento;
}

function criarCaputLexML(caput, idPai) {
    var elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'Caput');
    var paragrafo = criarElementoP(caput);

    elemento.setAttribute('id', idPai + '_cpt');
    elemento.appendChild(paragrafo);
    normalizarParagrafo(paragrafo);

    return elemento;
}

function criarElementoP(paragrafo) {
    var elemento = document.createElement('p');
    elemento.innerHTML = paragrafo;
    return elemento;
}

function criarNomeAgrupador(nome) {
    var elemento = document.createElementNS('http://www.lexml.gov.br/1.0', 'NomeAgrupador');
    elemento.textContent = nome;
    return elemento;
}

/**
 * Desmembra elementos P dentro de outro P, colocando-os no mesmo nível.
 * Exemplo: `<P><P>1</P><P>2</P></P>` vira `<P>1</P><P>2</P>`
 * 
 * @param {Element} paragrafo
 */
function normalizarParagrafo(paragrafo) {
    while (paragrafo.hasAttributes()) {
        paragrafo.removeAttribute(paragrafo.attributes[0].name);
    }

    for (let i = 0; i < paragrafo.children.length; i++) {
        if (paragrafo.children[i].tagName === 'P') {
            /* Tag P dentro de P. Isso não deveria ocorrer, então vamos tratar como continuação.
             * Neste caso, move-se todos os elementos a partir do índice 'i'
             * para novos parágrafos após o atual.
             */
            while (paragrafo.children.length > i) {
                let item = paragrafo.children[i];

                if (item.tagName === 'P') {
                    paragrafo.parentElement.insertBefore(item, paragrafo.nextSibling);
                    normalizarParagrafo(item);
                } else {
                    var novoParagrafo = document.createElement('P');
                    novoParagrafo.appendChild(item);
                    paragrafo.parentElement.insertBefore(novoParagrafo, paragrafo.nextSibling);
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
function transformarNumeroRomano(numero) {
    var digitos = String(numero).split(""),
        tabela = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        resultado = "",
        i = 3;

    while (i--) {
        resultado = (tabela[+digitos.pop() + (i * 10)] || "") + resultado;
    }
    return new Array(+digitos.join("") + 1).join("M") + resultado;
}

/**
 * Escreve o número em letra.
 * 
 * @param {Number} numero 
 */
function transformarLetra(numero) {
    if (numero < 1) {
        throw "Número deve ser positivo.";
    }

    return String.fromCharCode(96 /* a */ + numero);
}

export default exportarParaLexML;