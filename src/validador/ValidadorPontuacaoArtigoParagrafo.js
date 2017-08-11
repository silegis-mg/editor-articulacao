import Validador from './Validador';

class ValidadorPontuacaoArtigoParagrafo extends Validador {
    constructor() {
        super(['artigo', 'paragrafo'], 'Artigos e parágrafos devem ser terminados com ponto final (.) ou dois pontos (:), sem espaço antes da pontuação.');
    }

    validar(dispositivo) {
        return /.*\S+[:.]$/.test(dispositivo.textContent);
    }
}

export default ValidadorPontuacaoArtigoParagrafo;