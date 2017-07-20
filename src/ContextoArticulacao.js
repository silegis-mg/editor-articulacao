class ContextoArticulacao {
    constructor(elementoArticulacao, dispositivo) {
        let dadosCursor = {
            italico: dispositivo.tagName === 'I',
            desconhecido: false,
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

        dadosCursor.primeiroDoTipo = dispositivo && verificarPrimeiroDoTipo(dispositivo);
        dadosCursor.tipoAnterior =  dispositivo && obterTipoAnterior(dispositivo);

        let permissoes = {
            artigo: true,
            continuacao: dadosCursor.tipoAnterior === 'artigo' || dadosCursor.continuacao,
            inciso: !dadosCursor.artigo || !dadosCursor.primeiroDoTipo,
            paragrafo: !dadosCursor.artigo || !dadosCursor.primeiroDoTipo,
            alinea: (dadosCursor.inciso && !dadosCursor.primeiroDoTipo) || dadosCursor.tipoAnterior === 'inciso' || dadosCursor.tipoAnterior === 'alinea',
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
        artigo: ['raiz'],
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
 * @returns {String} Tipo do dispositivo anterior.
 */
function obterTipoAnterior(dipositivo) {
    while (!dipositivo.hasAttribute('data-tipo')) {
        dipositivo = dipositivo.parentElement;
    }

    for (let anterior = dipositivo.previousElementSibling; anterior; anterior = anterior.previousElementSibling) {
        if (anterior.hasAttribute('data-tipo')) {
            let tipo = anterior.getAttribute('data-tipo');

            if (tipo !== 'continuacao') {
                return tipo;
            }
        }
    }

    return null;
}

export default ContextoArticulacao;