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

class TransformacaoDoProximo extends Transformacao {
    transformar(editor, ctrl, contexto) {
        let novoTipo = this.proximoTipo(editor, ctrl, contexto);

        if (novoTipo) {
            aoSelecionarOutroElemento(editor, contexto.cursor.elemento, function () { ctrl.alterarTipoDispositivoSelecionado(novoTipo); });
        }
    }

    proximoTipo(editor, ctrl, contexto) {
        throw 'Método não implementado';
    }
}

function aoSelecionarOutroElemento(editor, elementoAtual, callback) {
    var handler = function(event) {
        if (event.detail.cursor.elemento !== elementoAtual) {
            callback(event);
            editor.removeEventListener('contexto', handler);
        }
    };

    editor.addEventListener('contexto', handler);
}

export { Transformacao, TransformacaoDoProximo };
export default Transformacao;