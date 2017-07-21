import { TransformacaoDoProximo } from './Transformacao';

class AoIniciarAspas extends TransformacaoDoProximo {
    constructor() {
        super('"\n', '"\n.');
    }

    proximoTipo(editor, ctrl, contexto) {
        return contexto.cursor.artigo && contexto.cursor.continuacao ? 'artigo' : null;
    }
}

export default AoIniciarAspas;