import Validador from './Validador';
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo } from '../util';

class ValidadorCitacao extends Validador {
    constructor() {
        super('continuacao', 'Citações devem estar entre aspas e terminar com ponto final (.).');
    }

    validar(dispositivo) {
        let texto = dispositivo.textContent;
        let inicio = seNulo(encontrarDispositivoAnteriorDoTipo(dispositivo, ['artigo']), posterior => posterior.nextElementSibling, dispositivo);

        if (dispositivo === inicio) {
            return /^["“]/.test(texto);
        }

        let termino = seNulo(encontrarDispositivoPosteriorDoTipo(dispositivo, ['artigo', 'paragrafo', 'inciso']), posterior => posterior.previousElementSibling, dispositivo);

        if (dispositivo === termino) {
            return /.+[”"]\.$/.test(texto);
        }

        // Se estamos no meio da citação, não devem haver aspas.
        return !/[“”"]/.test(texto);
    }
}

/**
 * Se o objeto não estiver nulo, então executa uma função consumidora deste objeto.
 * Caso o contrário, retorna um outro valor.
 * 
 * @param {*} obj Objeto a ser verificado.
 * @param {*} fnSeNaoNulo Função cujo resultado será retornado caso o objeto seja diferente de nulo.
 * @param {*} seNulo Valor retornado caso seja nulo.
 */
function seNulo(obj, fnSeNaoNulo, seNulo) {
    return obj ? fnSeNaoNulo(obj) : seNulo;
}

export default ValidadorCitacao;