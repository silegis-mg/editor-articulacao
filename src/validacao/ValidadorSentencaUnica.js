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
        let regexp = /[.;:]\s*(\S)/g;
        let m;
        let valido = true;
        
        for (let m = regexp.exec(texto); m && valido; m = regexp.exec(texto)) {
            valido = m[1].toLowerCase() === m[1];
        }

        return valido;
    }
}

export default ValidadorSentencaUnica;