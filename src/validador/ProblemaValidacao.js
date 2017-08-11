/**
 * Representa um problema que descreve a invalidação de um dispositivo.
 */
class ProblemaValidacao {
    /**
     * Constrói o problema.
     * 
     * @param {Element} dispositivo Dispositivo inválido.
     * @param {String} tipo Tipo do validador (nome da classe) que considerou o dispositivo inválido.
     * @param {String} descricao Descrição para o problema.
     */
    constructor(dispositivo, tipo, descricao) {
        this.dispositivo = dispositivo;
        this.tipo = tipo;
        this.descricao = descricao;
    }
}

export default ProblemaValidacao;