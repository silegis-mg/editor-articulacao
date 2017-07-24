/**
 * Definição abstrata de uma transformação a ser realizada na
 * seleção da articulação.
 * 
 * @author Júlio César e Melo
 */
class Transformacao {
    constructor(/*sequencias*/) {
        this.sequencias = [];

        for (let i = 0; i < arguments.length; i++) {
            let sequencia = arguments[i];
            this.sequencias.push(sequencia);

            if (sequencia.indexOf('\n') >= 0) {
                this.sequencias.push(sequencia.replace(/\n/g, '\r'));
            }
        }
    }

    transformar(editor, ctrl, contexto, sequencia) {
        throw 'Método não implementado';
    }
}

/**
 * Definição abstrata de uma transformação a ser realizada no
 * próximo dispositivo selecionado, após o disparo do evento
 * 'keyup'. Útil para transformações a ser executadas após
 * a criação de um novo dispositivo.
 * 
 * @author Júlio César e Melo
 */
class TransformacaoDoProximo extends Transformacao {
    transformar(editor, ctrl, contexto) {
        let novoTipo = this.proximoTipo(editor, ctrl, contexto);

        if (novoTipo) {
            onKeyUp(editor, contexto.cursor.elemento, function () { ctrl.alterarTipoDispositivoSelecionado(novoTipo); });
        }
    }

    proximoTipo(editor, ctrl, contexto) {
        throw 'Método não implementado';
    }
}

function onKeyUp(editor, elementoAtual, callback) {
    var handler = function(event) {
        callback(event);
        editor.removeEventListener('keyup', handler);
    };

    editor.addEventListener('keyup', handler);
}

export { Transformacao, TransformacaoDoProximo };
export default Transformacao;