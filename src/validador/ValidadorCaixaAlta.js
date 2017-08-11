import Validador from './Validador';

class ValidadorIniciarLetraMaiuscula extends Validador {
    constructor() {
        super(['artigo', 'paragrafo'], 'Artigos e parágrafos não devem ser escritos usando apenas caixa alta.');
    }

    validar(dispositivo) {
        var texto = dispositivo.textContent;

        return texto.length === 0 || texto.toUpperCase() !== texto;
    }
}

export default ValidadorIniciarLetraMaiuscula;