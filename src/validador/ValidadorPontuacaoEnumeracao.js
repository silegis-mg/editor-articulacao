import Validador from './Validador';

class ValidadorPontuacaoEnumeracao extends Validador {
    constructor() {
        super(['inciso', 'alinea', 'item'], 'Enumerações devem ser terminadas com ponto final (.) ou ponto-e-vírgula (;), sem espaço entre a pontuação.');
    }

    validar(dispositivo) {
        return /.*\S+[;.]$/.test(dispositivo.textContent);
    }
}

export default ValidadorPontuacaoEnumeracao;