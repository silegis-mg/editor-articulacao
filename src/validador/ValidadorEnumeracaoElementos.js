import Validador from './Validador';
import { encontrarDispositivoAnteriorDoTipo, encontrarDispositivoPosteriorDoTipo, getTiposSuperiores } from '../util';

/**
 * @author Júlio César e Melo
 */
class ValidadorEnumeracaoElementos extends Validador {
    constructor() {
        super(['inciso', 'alinea', 'item'], 'Enumerações devem possuir mais de um elemento.');
    }

    validar(dispositivo) {
        var tipo = dispositivo.getAttribute('data-tipo');
        var superiores = getTiposSuperiores(tipo);

        return !!encontrarDispositivoAnteriorDoTipo(dispositivo, [tipo], superiores) || !!encontrarDispositivoPosteriorDoTipo(dispositivo, [tipo], superiores);
    }
}

export default ValidadorEnumeracaoElementos;