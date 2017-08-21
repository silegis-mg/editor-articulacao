import Validador from './Validador';

/**
 * @author Júlio César e Melo
 */
class ValidadorPontuacaoEnumeracao extends Validador {
    constructor() {
        super(['inciso', 'alinea', 'item'], 'Enumerações devem ser terminadas com ponto final (.), ponto e vírgula (;) ou dois pontos (:), sem espaço antes da pontuação.');
    }

    validar(dispositivo) {
        return /.*\S+(?:[;.:]|; ou|; e)$/.test(dispositivo.textContent);
    }
}

export default ValidadorPontuacaoEnumeracao;