import { Transformacao } from './Transformacao';

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