import { TransformacaoDoProximo } from './Transformacao';

/**
 * Quando usuário encerra as aspas na continuação do caput de um artigo,
 * então cria-se um novo artigo.
 * 
 * @author Júlio César e Melo
 */
class AoFecharAspas extends TransformacaoDoProximo {
    constructor() {
        super('"\n', '".\n');
    }

    proximoTipo(editor, ctrl, contexto) {
        return contexto.cursor.artigo && contexto.cursor.continuacao ? 'artigo' : null;
    }
}

export default AoFecharAspas;