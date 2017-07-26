/**
 * Evento de notificação de atualização do conteúdo da articulação.
 * 
 * @author Júlio César e Melo
 */
class ArticulacaoChangeEvent extends CustomEvent {
    /**
     * Constrói o evento.
     * 
     * @param {EditorArticulacaoController} editorArticulacaoCtrl 
     */
    constructor(editorArticulacaoCtrl) {
        super('change', {
            bubbles: true,
            cancelable: false
        });
    }
}

export default ArticulacaoChangeEvent;