import Transformacao from './Transformacao';

/**
 * Quando usuário der um enter em uma linha vazia, então
 * transforma-se o dispositivo para um nível anterior
 * (ex.: de alínea para inciso).
 * 
 * @author Júlio César e Melo
 */
class RecuarComEnterEmDispositivoVazio extends Transformacao {
    constructor() {
        super('\n');
    }

    get tipoTransformacao() {
        return 'RecuarComEnterEmDispositivoVazio';
    }

    /**
     * Efetua a transformação.
     * 
     * @param {Element} elementoEditor Elemento em que está o editor de articulação.
     * @param {EditorArticulacaoController} ctrl Controlador do editor.
     * @param {ContextoArticulacao} contexto Contexto atual.
     * @param {String} sequencia Sequência que disparou a transformação.
     * @param {KeyboardEvent} event Evento do teclado.
     */
    transformar(elementoEditor, ctrl, contexto, sequencia, event) {
        if (contexto.cursor.dispositivo.textContent.trim().length === 0) {
            let novoTipo = {
                item: 'alinea',
                alinea: 'inciso',
                get inciso() {
                    for (let dispositivo = contexto.cursor.dispositivoAnterior; dispositivo; dispositivo = dispositivo.previousElementSibling) {
                        let tipo = dispositivo.getAttribute('data-tipo');

                        if (tipo === 'artigo' || tipo === 'paragrafo') {
                            return tipo;
                        }
                    }

                    return 'artigo';
                }
            }[contexto.cursor.tipo] || 'artigo';

            ctrl.alterarTipoDispositivoSelecionado(novoTipo);
            event.preventDefault();
        }
    }
}

export default RecuarComEnterEmDispositivoVazio;