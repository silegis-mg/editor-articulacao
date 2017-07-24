import { Transformacao } from './Transformacao';

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

    transformar(editor, ctrl, contexto) {
        if (contexto.cursor.tipoAnterior === 'artigo') {
            ctrl.alterarTipoDispositivoSelecionado('continuacao');
        }

        return null;
    }
}

export default AoIniciarAspas;