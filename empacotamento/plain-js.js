/* Cria uma função global, chamada silegismgEditorArticulacao,
 * que permite transformar um DIV em um editor de articulação.
 * A função cria e retorna uma nova instância de EditorArticulacaoController.
 */
import EditorArticulacaoController from '../src/EditorArticulacaoController';

/**
 * Prepara um elemento do DOM como um editor de articulação.
 * 
 * @param {Element} elemento 
 */
function prepararEditorArticulacao(elemento) {
    elemento.ctrlArticulacao = new EditorArticulacaoController(elemento);
    
    Object.defineProperty(elemento, 'lexml', {
        get: function() {
            return this.ctrlArticulacao.lexml;
        },
        set: function(valor) {
            this.ctrlArticulacao.lexml = valor;
        }
    });

    return elemento.ctrlArticulacao;
}

window.silegismgEditorArticulacao = prepararEditorArticulacao;