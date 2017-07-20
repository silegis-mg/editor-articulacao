/**
 * Evento de notificação de atualização do contexto de edição.
 * Útil para atualização da interface de usuário, habilitando ou
 * desabilitando botões.
 */
class ContextoArticulacaoAtualizado extends CustomEvent {
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

export default ContextoArticulacaoAtualizado;