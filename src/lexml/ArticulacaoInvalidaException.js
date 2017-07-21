class ArticulacaoInvalidaException {
    constructor(dispositivo, mensagem) {
        this.dispositivo = dispositivo;
        this.mensagem = mensagem;
    }

    get tipo() {
        return dispositivo.tagName;
    }
}

export default ArticulacaoInvalidaException;