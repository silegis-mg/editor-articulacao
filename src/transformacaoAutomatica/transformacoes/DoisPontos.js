import { TransformacaoDoProximo } from './Transformacao';

/**
 * Ao terminar um dispositivo com dois pontos (:), assume-se
 * que será feita uma enumeração e, portanto, transforma
 * o próximo dispositivo em inciso, alínea ou item, conforme
 * contexto.
 * 
 * @author Júlio César e Melo
 */
class DoisPontos extends TransformacaoDoProximo {
    constructor() {
        super(':\n');
    }

    get tipoTransformacao() {
        return 'DoisPontos';
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