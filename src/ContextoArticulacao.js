/**
 * Representa o contexto do usuário no editor de articulação.
 * Possui dois atributos: cursor, contendo o contexto no cursor,
 * e as permissões de alteração de dispositivo na seleção.
 */
class ContextoArticulacao {
    constructor(elementoArticulacao, dispositivo) {
        let dadosCursor = {
            italico: dispositivo.tagName === 'I',
            desconhecido: false,
            titulo: false,
            capitulo: false,
            secao: false,
            subsecao: false,
            artigo: false,
            continuacao: false,
            paragrafo: false,
            inciso: false,
            alinea: false,
            item: false,
            raiz: false,
            elemento: dispositivo
        };

        while (dispositivo && dispositivo !== elementoArticulacao && !dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentElement;
        }

        dadosCursor.dispositivo = dispositivo;
        
        while (dispositivo && dispositivo.getAttribute('data-tipo') === 'continuacao') {
            dispositivo = dispositivo.previousElementSibling;
            dadosCursor.continuacao = true;
        }

        if (!dispositivo) {
            dadosCursor.desconhecido = true;
        } else if (dispositivo === elementoArticulacao) {
            dispositivo.raiz = true;
        } else if (dispositivo.hasAttribute('data-tipo')) {
            dadosCursor[dispositivo.getAttribute('data-tipo')] = true;
        } else {
            dadosCursor.desconhecido = true;
        }

        let primeiroDoTipo, tipoAnterior;
        
        Object.defineProperty(dadosCursor, 'primeiroDoTipo', {
            get: function() {
                if (primeiroDoTipo === undefined) {
                    primeiroDoTipo = dispositivo && verificarPrimeiroDoTipo(dispositivo);
                }

                return primeiroDoTipo;
            }
        });

        dadosCursor.dispositivoAnterior = obterDispositivoAnterior(dispositivo);
        dadosCursor.tipoAnterior = dadosCursor.dispositivoAnterior && dadosCursor.dispositivoAnterior.getAttribute('data-tipo');

        let matches = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.onMatchesSelector || function() { return true; };

        function possuiAnterior(dispositivo, tipo) {
            /* Implementação falha/incompleta. Uma subseção deve existir depois de uma seção,
             * mas não deveria permitir capítulo + seção + artigo + capítulo + subseção.
             * 
             * Cuidado pois esta implementação não pode ser cara!
             */
            return matches.call(dispositivo, 'p[data-tipo="' + tipo + '"] ~ *');
        }

        let permissoes = {
            titulo: true,
            capitulo: true,
            get secao() {
                return possuiAnterior(dadosCursor.dispositivo, 'capitulo');
            },
            get subsecao() {
                return possuiAnterior(dadosCursor.dispositivo, 'secao');
            },
            artigo: true,
            continuacao: dadosCursor.tipoAnterior === 'artigo' || dadosCursor.continuacao,
            inciso: (dadosCursor.tipoAnterior !== 'titulo' && dadosCursor.tipoAnterior !== 'capitulo' && dadosCursor.tipoAnterior !== 'secao' && dadosCursor.tipoAnterior !== 'subsecao') && !dadosCursor.artigo || !dadosCursor.primeiroDoTipo,
            paragrafo: !dadosCursor.artigo || !dadosCursor.primeiroDoTipo,
            alinea: (dadosCursor.inciso && !dadosCursor.primeiroDoTipo) || dadosCursor.tipoAnterior === 'inciso' || dadosCursor.tipoAnterior === 'alinea' || dadosCursor.tipoAnterior === 'item',
            item: (dadosCursor.alinea && !dadosCursor.primeiroDoTipo) || dadosCursor.tipoAnterior === 'alinea' || dadosCursor.tipoAnterior === 'item'
        };

        Object.defineProperty(this, 'cursor', { value: dadosCursor });
        Object.defineProperty(this, 'permissoes', { value: permissoes });
    }

    comparar(obj2) {
        for (let i in dadosCursor) {
            if (this.dadosCursor[i] !== obj2.dadosCursor[i]) {
                return true;
            }
        }

        return false;
    }

}

/**
 * Determina se o dispositivo é o primeiro do tipo.
 * 
 * @param {Element} dispositivo 
 * @returns {Boolean} Verdadeiro, se for o primeiro do tipo.
 */
function verificarPrimeiroDoTipo(dispositivo) {
    var tipo = dispositivo.getAttribute('data-tipo');

    if (!tipo) {
        return null;
    }

    while (tipo === 'continuacao') {
        dispositvo = dispositivo.previousElementSibling;
        tipo = dispositivo.getAttribute('data-tipo');
    }
    
    let pontosParagem = ({
        parte: [],
        livro: [],
        titulo: [],
        capitulo: ['titulo'],
        secao: ['capitulo', 'titulo'],
        subsecao: ['secao', 'capitulo', 'titulo'],
        artigo: [],
        paragrafo: ['artigo'],
        inciso: ['paragrafo', 'artigo'],
        alinea: ['inciso'],
        item: ['alinea']
    })[tipo].reduce((prev, item) => {
        prev[item] = true;
        return prev;
    }, {});

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        let tipoAnterior = prev.getAttribute('data-tipo');

        if (tipoAnterior === tipo) {
            return false;
        } else if (pontosParagem[tipoAnterior]) {
            return true;
        }
    }

    return true;
}

/**
 * Obtém o tipo de dispositivo anterior.
 * 
 * @param {Element} dipositivo 
 * @returns {Element} Elemento do dispositivo anterior.
 */
function obterDispositivoAnterior(dipositivo) {
    while (!dipositivo.hasAttribute('data-tipo')) {
        dipositivo = dipositivo.parentElement;
    }

    for (let anterior = dipositivo.previousElementSibling; anterior; anterior = anterior.previousElementSibling) {
        if (anterior.hasAttribute('data-tipo')) {
            let tipo = anterior.getAttribute('data-tipo');

            if (tipo !== 'continuacao') {
                return anterior;
            }
        }
    }

    return null;
}

export default ContextoArticulacao;