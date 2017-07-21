import EditorArticulacaoController from './EditorArticulacaoController';
import exportarParaLexML from './lexml/exportarParaLexML'
import css from './editor-articulacao.css';

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
}

// Adiciona CSS
let style = document.createElement('style');
style.innerHTML = css.toString();

let head = document.querySelector('head');

if (head) {
    head.appendChild(style);
} else {
    document.body.appendChild(style);
}

window.silegismgEditorArticulacao = prepararEditorArticulacao;