import ProblemaValidacao from './ProblemaValidacao';
import ValidadorCaixaAlta from './ValidadorCaixaAlta';
import ValidadorCitacao from './ValidadorCitacao';
import ValidadorIniciarLetraMaiuscula from './ValidadorIniciarLetraMaiuscula';
import ValidadorPontuacaoArtigoParagrafo from './ValidadorPontuacaoArtigoParagrafo';
import ValidadorPontuacaoEnumeracao from './ValidadorPontuacaoEnumeracao';
import ValidadorSentencaUnica from './ValidadorSentencaUnica';

/**
 * Controler para realizar validação nos dispositivos.
 * 
 * @author Júlio César e Melo
 */
class ValidacaoController {
    constructor(elaboracaoCtrl) {
        this.elaboracaoCtrl = elaboracaoCtrl;

        let opcoes = elaboracaoCtrl.opcoes.validacao;

        this.validadores = [];

        if (opcoes !== false) {
            habilitar(opcoes, 'caixaAlta', this.validadores, ValidadorCaixaAlta);
            habilitar(opcoes, 'citacao', this.validadores, ValidadorCitacao);
            habilitar(opcoes, 'inicialMaiuscula', this.validadores, ValidadorIniciarLetraMaiuscula);
            habilitar(opcoes, 'pontuacao', this.validadores, ValidadorPontuacaoArtigoParagrafo);
            habilitar(opcoes, 'enumeracao', this.validadores, ValidadorPontuacaoEnumeracao);
            habilitar(opcoes, 'sentencaUnica', this.validadores, ValidadorSentencaUnica);
        }
    }

    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {ProblemaValidacao[]} Problemas encontrados.
     */
    validar(dispositivo) {
        var problemas = [];

        if (dispositivo.textContent.length > 0) {
            this.validadores.forEach(validador => {
                if (validador.aplicaSeA(dispositivo) && !validador.validar(dispositivo)) {
                    problemas.push(new ProblemaValidacao(dispositivo, validador.constructor.name, validador.descricao));
                }
            });

            if (problemas.length > 0) {
                dispositivo.setAttribute('data-invalido', problemas.reduce((prev, problema) => prev ? prev + ' ' + problema.descricao : problema.descricao, null));
            } else {
                dispositivo.removeAttribute('data-invalido');
            }
        }

        return problemas;
    }
}

/**
 * Habilita um validador.
 * 
 * @param {Object} opcoes Conjunto de opções fornecidas para o controller de validação.
 * @param {String} nomeOpcao Nome da opção para habilitar um validador.
 * @param {Validador[]} validadores Vetor de validadores.
 * @param {Class} Validador Classe do validador.
 */
function habilitar(opcoes, nomeOpcao, validadores, Validador) {
    if (opcoes === true || opcoes[nomeOpcao] !== false) {
        validadores.push(new Validador());
    }
}

export default ValidacaoController;