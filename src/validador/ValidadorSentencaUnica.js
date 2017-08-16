import Validador from './Validador';

/**
 * @author Júlio César e Melo
 */
class ValidadorSentencaUnica extends Validador {
    constructor() {
        super(['artigo', 'paragrafo', 'inciso', 'alinea', 'item'], 'Dispositivos devem conter uma única sentença.');
    }

    validar(dispositivo) {
        let texto = dispositivo.textContent;
        let m = /[.;:]\s*(\S)/.exec(texto);

        return !m || m[1].toLowerCase() === m[1];
    }
}

export default ValidadorSentencaUnica;