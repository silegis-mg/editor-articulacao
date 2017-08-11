import Validador from './Validador';

class ValidadorIniciarLetraMaiuscula extends Validador {
    constructor() {
        super('artigo', 'Artigos devem ser iniciados com letra maiúscula.');
    }

    validar(dispositivo) {
        var texto = dispositivo.textContent;

        return texto.charAt(0).toUpperCase() === texto.charAt(0);
    }
}

export default ValidadorIniciarLetraMaiuscula;