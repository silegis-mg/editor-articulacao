import Validador from './Validador';

/**
 * @author Júlio César e Melo
 */
class ValidadorIniciarLetraMaiuscula extends Validador {
    constructor() {
        super(['artigo', 'paragrafo'], 'Artigos e parágrafos devem ser iniciados com letra maiúscula.');
    }

    validar(dispositivo) {
        var texto = dispositivo.textContent;

        return texto.charAt(0).toUpperCase() === texto.charAt(0);
    }
}

export default ValidadorIniciarLetraMaiuscula;