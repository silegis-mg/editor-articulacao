import { Transformacao } from './Transformacao';
import TransformacaoAutomaticaEvent from '../../eventos/TransformacaoAutomaticaEvent';

/**
 * Quando usuário cria um novo artigo e o inicia com aspas,
 * este é transformado em continuação do caput do artigo.
 * 
 * @author Júlio César e Melo
 */
class AoIniciarAspas extends Transformacao {
    constructor() {
        super('\n"');
    }

    get tipoTransformacao() {
        return 'AoIniciarAspas';
    }

    transformar(editor, ctrl, contexto) {
        if (contexto.cursor.tipoAnterior === 'artigo') {
            ctrl.alterarTipoDispositivoSelecionado('continuacao');
            ctrl.dispatchEvent(new TransformacaoAutomaticaEvent(ctrl, 'artigo', 'continuacao', this.constructor.name));
        }

        return null;
    }
}

export default AoIniciarAspas;