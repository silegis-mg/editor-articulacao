import { TransformacaoDoProximo } from './Transformacao';

class DoisPontos extends TransformacaoDoProximo {
    constructor() {
        super(':\n');
    }

    proximoTipo(editor, ctrl, contexto) {
        return {
            artigo: 'inciso',
            inciso: 'alinea',
            alinea: 'item',
            paragrafo: 'inciso'
        }[contexto.cursor.tipo];
    }
}

export default DoisPontos;