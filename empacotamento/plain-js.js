import EditorArticulacaoController from '../src/EditorArticulacaoController';
import exportarParaLexML from '../src/lexml/exportarParaLexML';

/**
 * Prepara um elemento do DOM como um editor de articulação.
 * 
 * @param {Element} elemento 
 */
function prepararEditorArticulacao(elemento) {
    elemento.ctrlArticulacao = new EditorArticulacaoController(elemento);
    
    Object.defineProperty(elemento, 'lexml', {
        get: function() {
            return exportarParaLexML(elemento);
        }
    });

    return elemento.ctrlArticulacao;
}

window.silegismgEditorArticulacao = prepararEditorArticulacao;