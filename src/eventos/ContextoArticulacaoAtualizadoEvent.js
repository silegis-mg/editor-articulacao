/**
 * Evento de notificação de atualização do contexto de edição.
 * Útil para atualização da interface de usuário, habilitando ou
 * desabilitando botões.
 * 
 * @author Júlio César e Melo
 */
class ContextoArticulacaoAtualizadoEvent extends CustomEvent {
    /**
     * Constrói o evento.
     * 
     * @param {EditorArticulacaoController} editorArticulacaoCtrl 
     */
    constructor(editorArticulacaoCtrl) {
        super('contexto', {
            detail: editorArticulacaoCtrl
        });
    }
}

export default ContextoArticulacaoAtualizadoEvent;