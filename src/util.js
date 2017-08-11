/**
 * Obtém o dispositivo anterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} pontosParada Tipos de dispositivos desejados.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 * 
 * @author Júlio César e Melo
 */
function encontrarDispositivoAnteriorDoTipo(dispositivo, pontosParada) {
    while (!dispositivo.hasAttribute('data-tipo')) {
        dispositivo = dispositivo.parentElement;
    }

    let setParada = new Set(pontosParada);

    for (let prev = dispositivo.previousElementSibling; prev; prev = prev.previousElementSibling) {
        let tipoAnterior = prev.getAttribute('data-tipo');

        if (setParada.has(tipoAnterior)) {
            return prev;
        }
    }

    return null;
}

/**
 * Obtém o dispositivo posterior, de determinado tipo.
 * 
 * @param {Element} dispositivo 
 * @param {String[]} tipoDispositivoDesejado Tipos de dispositivos desejados.
 * @returns {Element} Dispositivo, se encontrado, ou nulo.
 * 
 * @author Júlio César e Melo
 */
function encontrarDispositivoPosteriorDoTipo(elemento, pontosParada) {
    while (!elemento.hasAttribute('data-tipo')) {
        elemento = elemento.parentElement;
    }

    let setParada = new Set(pontosParada);

    for (let proximo = elemento.nextElementSibling; proximo; proximo = proximo.nextElementSibling) {
        if (setParada.has(proximo.getAttribute('data-tipo'))) {
            return proximo;
        }
    }

    return null;
}

export { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo };