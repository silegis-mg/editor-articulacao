/**
 * Classe abstrata para validar dispositivos.
 * 
 * @author Júlio César e Melo
 */
class Validador {
    /**
     * Constrói o validador.
     * 
     * @param {String[]} tipos Tipos de dispositivos que serão validados.
     * @param {String} descricao Descrição da validação.
     */
    constructor(tipos, descricao) {
        this.tipos = tipos instanceof Array ? new Set(tipos) : new Set([tipos]);
        this.descricao = descricao;
    }

    /**
     * Verifiac se o validador se aplica ao dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     */
    aplicaSeA(dispositivo) {
        return this.tipos.has(dispositivo.getAttribute('data-tipo'));
    }
    
    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {Boolean} Verdadeiro se o dispositivo estiver válido.
     */
    validar(dispositivo) {
        throw 'Não implementado.';
    }
}

export default Validador;