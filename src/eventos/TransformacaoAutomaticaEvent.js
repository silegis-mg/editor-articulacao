/**
 * Evento de notificação de transformação automática ocorrida
 * em dispositivo.
 * 
 * @author Júlio César e Melo
 */
class TransformacaoAutomaticaEvent extends CustomEvent {
    /**
     * Constrói o evento.
     * 
     * @param {EditorArticulacaoController} editorArticulacaoCtrl 
     */
    constructor(editorArticulacaoCtrl, tipoAnterior, novoTipo, transformacao) {
        super('transformacao', {
            detail: {
                automatica: true,
                tipoAnterior: tipoAnterior,
                novoTipo: novoTipo,
                transformacao: transformacao,
                editorArticulacaoCtrl
            }
        });
    }
}

export default TransformacaoAutomaticaEvent;