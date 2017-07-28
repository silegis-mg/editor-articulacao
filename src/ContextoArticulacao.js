/**
 * Representa o contexto do usuário no editor de articulação.
 * Possui dois atributos: cursor, contendo o contexto no cursor,
 * e as permissões de alteração de dispositivo na seleção.
 * 
 * @author Júlio César e Melo
 */
class ContextoArticulacao {
    constructor(elementoArticulacao, dispositivo) {
        let cursor = {
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
            elemento: dispositivo,
            get tipo() {
                return this.dispositivo ? this.dispositivo.getAttribute('data-tipo') : 'desconhecido';
            }
        };

        while (dispositivo && dispositivo !== elementoArticulacao && !dispositivo.hasAttribute('data-tipo')) {
            dispositivo = dispositivo.parentElement;
        }

        cursor.dispositivo = dispositivo;
        
        while (dispositivo && dispositivo.getAttribute('data-tipo') === 'continuacao') {
            dispositivo = dispositivo.previousElementSibling;
            cursor.continuacao = true;
        }

        if (!dispositivo) {
            cursor.desconhecido = true;
        } else if (dispositivo === elementoArticulacao) {
            dispositivo.raiz = true;
        } else if (dispositivo.hasAttribute('data-tipo')) {
            cursor[dispositivo.getAttribute('data-tipo')] = true;
        } else {
            cursor.desconhecido = true;
        }

        let primeiroDoTipo, tipoAnterior;
        
        Object.defineProperty(cursor, 'primeiroDoTipo', {
            get: function() {
                if (primeiroDoTipo === undefined) {
                    primeiroDoTipo = dispositivo && verificarPrimeiroDoTipo(dispositivo);
                }

                return primeiroDoTipo;
            }
        });

        cursor.dispositivoAnterior = dispositivo && obterDispositivoAnterior(dispositivo);
        cursor.tipoAnterior = cursor.dispositivoAnterior && cursor.dispositivoAnterior.getAttribute('data-tipo');

        let matches = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.onMatchesSelector || function() { return true; };

        function possuiAnterior(dispositivo, tipo) {
            /* Implementação falha/incompleta. Uma subseção deve existir depois de uma seção,
             * mas não deveria permitir capítulo + seção + artigo + capítulo + subseção.
             * 
             * Cuidado pois esta implementação não pode ser cara!
             */
            return dispositivo && matches.call(dispositivo, 'p[data-tipo="' + tipo + '"] ~ *');
        }

        let anteriorAgrupador = cursor.tipoAnterior === 'titulo' || cursor.tipoAnterior === 'capitulo' || cursor.tipoAnterior === 'secao' || cursor.tipoAnterior === 'subsecao';

        let permissoes = {
            titulo: !anteriorAgrupador,
            capitulo: !anteriorAgrupador || cursor.tipoAnterior === 'titulo',
            get secao() {
                return (!anteriorAgrupador || cursor.tipoAnterior === 'capitulo') && possuiAnterior(cursor.dispositivo, 'capitulo');
            },
            get subsecao() {
                return (!anteriorAgrupador || cursor.tipoAnterior === 'secao') && possuiAnterior(cursor.dispositivo, 'secao');
            },
            artigo: cursor.tipoAnterior !== 'titulo',
            continuacao: cursor.tipoAnterior === 'artigo' || cursor.continuacao,
            inciso: !anteriorAgrupador && (!cursor.artigo || (cursor.artigo && !cursor.primeiroDoTipo)),
            paragrafo: !cursor.artigo || (cursor.artigo && (!cursor.primeiroDoTipo || cursor.continuacao)),
            alinea: (cursor.inciso && !cursor.primeiroDoTipo) || cursor.tipoAnterior === 'inciso' || cursor.tipoAnterior === 'alinea' || cursor.tipoAnterior === 'item',
            item: (cursor.alinea && !cursor.primeiroDoTipo) || cursor.tipoAnterior === 'alinea' || cursor.tipoAnterior === 'item'
        };

        Object.defineProperty(this, 'cursor', { value: cursor });
        Object.defineProperty(this, 'permissoes', { value: permissoes });
    }

    comparar(obj2) {
        for (let i in this.cursor) {
            if (this.cursor[i] !== obj2.cursor[i]) {
                return true;
            }
        }

        for (let i in this.permissoes) {
            if (this.permissoes[i] !== obj2.permissoes[i]) {
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
 * @param {Element} dispositivo 
 * @returns {Element} Elemento do dispositivo anterior.
 */
function obterDispositivoAnterior(dispositivo) {
    while (dispositivo && !dispositivo.hasAttribute('data-tipo')) {
        dispositivo = dispositivo.parentElement;
    }

    if (!dispositivo) {
        return null;
    }

    for (let anterior = dispositivo.previousElementSibling; anterior; anterior = anterior.previousElementSibling) {
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