/**
 * Intercepta um método após sua execução.
 * 
 * @param {Object} objeto Objeto ou classe a ser interceptada. Se o tipo for uma classe, a interceptação ocorrerá sobre o prototype.
 * @param {String} metodo Método a ser interceptado.
 * @param {function} interceptador Função interceptadora, que receberá o objeto, o valor retornado e os argumentos.
 */
function interceptar(objeto, metodo, interceptador) {
    if (!objeto) throw 'Objeto não fornecido.';
    if (!metodo) throw 'Método não fornecido.';
    if (!interceptador) throw 'Interceptador não fornecido.';

    if (typeof objeto === 'function') {
        interceptar(objeto.prototype, metodo, interceptador);
    } else {
        let metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw 'Método não encontrado: ' + metodo;
        }

        objeto[metodo] = function() {
            return interceptador(this, metodoOriginal, arguments);
        }
    }
}

/**
 * Intercepta um método após sua execução.
 * 
 * @param {Object} objeto Objeto ou classe a ser interceptada. Se o tipo for uma classe, a interceptação ocorrerá sobre o prototype.
 * @param {String} metodo Método a ser interceptado.
 * @param {function} interceptador Função interceptadora, que receberá o objeto, o valor retornado e os argumentos.
 */
function interceptarApos(objeto, metodo, interceptador) {
    if (!objeto) throw 'Objeto não fornecido.';
    if (!metodo) throw 'Método não fornecido.';
    if (!interceptador) throw 'Interceptador não fornecido.';

    if (typeof objeto === 'function') {
        interceptarApos(objeto.prototype, metodo, interceptador);
    } else {
        let metodoOriginal = objeto[metodo];

        if (!metodoOriginal) {
            throw 'Método não encontrado: ' + metodo;
        }

        objeto[metodo] = function() {
            var resultado = metodoOriginal.apply(this, arguments);

            return interceptador(this, resultado, arguments);
        }
    }
}

export { interceptar, interceptarApos };
export default {};