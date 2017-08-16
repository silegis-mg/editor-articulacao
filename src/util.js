/**
 * Obtém o dispositivo anterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} pontosParada Tipos de dispositivos desejados.
 * @param {String[]} pontosInterrupcao Tipos de dispositivos que, se encontrados, interromperá a obtenção, retornando nulo.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 * 
 * @author Júlio César e Melo
 */
function encontrarDispositivoAnteriorDoTipo(dispositivo, pontosParada, pontosInterrupcao) {
    while (!dispositivo.hasAttribute('data-tipo')) {
        dispositivo = dispositivo.parentElement;
    }

    let setParada = new Set(pontosParada);
    let setInterrupcao = new Set(pontosInterrupcao);

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        let tipoAnterior = prev.getAttribute('data-tipo');

        if (setParada.has(tipoAnterior)) {
            return prev;
        } else if (setInterrupcao.has(tipoAnterior)) {
            return null;
        }
    }

    return null;
}

/**
 * Obtém o dispositivo posterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} pontosParada Tipos de dispositivos desejados.
 * @param {String[]} pontosInterrupcao Tipos de dispositivos que, se encontrados, interromperá a obtenção, retornando nulo.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 * 
 * @author Júlio César e Melo
 */
function encontrarDispositivoPosteriorDoTipo(elemento, pontosParada, pontosInterrupcao) {
    while (!elemento.hasAttribute('data-tipo')) {
        elemento = elemento.parentElement;
    }

    let setParada = new Set(pontosParada);
    let setInterrupcao = new Set(pontosInterrupcao);

    for (let proximo = elemento.nextElementSibling; proximo; proximo = proximo.nextElementSibling) {
        let tipoProximo = proximo.getAttribute('data-tipo');

        if (setParada.has(tipoProximo)) {
            return proximo;
        } else if (setInterrupcao.has(tipoProximo)) {
            return null;
        }
    }

    return null;
}

/**
 * Obtém os tipos de dispositivos em níveis superiores.
 * 
 * @param {String} tipo Tipo cujos tipos superiores serão obtidos.
 */
function getTiposSuperiores(tipo) {
    return {
        inciso: ['artigo', 'paragrafo'],
        alinea: ['artigo', 'paragrafo', 'inciso'],
        item: ['artigo', 'paragrafo', 'inciso', 'alinea']
    }[tipo] || [];
}

export { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo, getTiposSuperiores };