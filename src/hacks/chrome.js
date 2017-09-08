/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import { interceptar } from './interceptador';

function hackChrome(controller) {
    interceptar(controller, 'alterarTipoDispositivoSelecionado', hackAlterarTipo);

    controller.registrarEventListener('keydown', event => hackInterceptarKeydown(event, controller));
}

/**
 * O chrome faz cache do counter-reset e, quando um counter-reset é introduzido
 * (por mudança de css), os elementos seguintes não são afetados.
 * 
 * @param {EditorArticulacaoController} ctrl 
 * @param {function} metodo
 * @param {Array} argumentos 
 */
function hackAlterarTipo(ctrl, metodo, argumentos) {
    let dispositivo = ctrl.contexto.cursor.dispositivo;
    let contadoresAntigos = extrairContadores(dispositivo);
    let retorno  = metodo.apply(ctrl, argumentos);
    let contadoresNovos = extrairContadores(dispositivo, contadoresAntigos.hash);

    /* Para cada contador novo, vamos redefinir o tipo dos próximos elementos,
     * até que se encontre em um elemento antigo o reinício do contador em questão.
     */
    for (let i = 0, proximo = ctrl.contexto.cursor.dispositivo.nextElementSibling; proximo && i < contadoresNovos.total; proximo = proximo.nextElementSibling) {
        let tipo = proximo.getAttribute('data-tipo');
        let contadoresProximo = extrairContadores(proximo);

        if (contadoresNovos.hash[tipo]) {
            redefinirContador(proximo);
        }

        // Não há necessidade de reiniciar contadores quando o próximo já o reiniciava.
        for (let contador in contadoresProximo.hash) {
            if (contadoresNovos.hash[contador]) {
                contadoresNovos.hash[contador] = false;
                i++;
            }
        }
    }

    return retorno;
}

/**
 * Extrai os contadores reinciiados por este elemento.
 * 
 * @param {Element} dispositivo 
 * @param {Object} contadoresDesconsiderar Hash contendo os contadores que não deverão ser considerados.
 */
function extrairContadores(dispositivo, contadoresDesconsiderar) {
    let counterReset = getComputedStyle(dispositivo).counterReset;
    let contadores = {};
    let cnt = 0;

    for (let regexp = /(.+?)\s\d+\s*/g, m = regexp.exec(counterReset); m; m = regexp.exec(counterReset)) {
        let contador = m[1];

        if (!contadoresDesconsiderar || !contadoresDesconsiderar[contador]) {
            contadores[contador] = true;
            cnt++;
        }
    }

    return { total: cnt, hash: contadores };
}

/**
 * Efetua a redefinição do contador.
 * 
 * @param {Element} dispositivo 
 */
function redefinirContador(dispositivo) {
    let tipo = dispositivo.getAttribute('data-tipo');
    dispositivo.removeAttribute('data-tipo');
    setTimeout(() => dispositivo.setAttribute('data-tipo', tipo));
}

/**
 * O Chrome tem um problema de desempenho que fica evidente ao importar
 * o LexML da Constituição Federal, selecionar todo o texto no editor
 * de articulação, e pressionar qualquer tecla que iria remover o texto
 * selecionado (seja por exclusão ou substituição).
 * 
 * Para cada elemento no DOM a ser excluído ou substituído, o navegador
 * processa os estilos do próximo elemento (conforme ferramenta de profile
 * do próprio navegador), tornando a operação O(n²). Para contornar o problema,
 * realizamos a exclusão do conteúdo via API, interceptando o keydown.
 * 
 * @param {KeyboardEvent} keyboardEvent 
 * @param {EditorArticulacaoController} editorCtrl 
 */
function hackInterceptarKeydown(keyboardEvent, editorCtrl) {
    /* Somente serão tratadas as alterações de conteúdo. Portanto,
     * se houver qualquer tecla modificativa (ctrl, alt ou meta),
     * o evento será ignorado. O evento só será tratado se a tecla for
     * de conteúdo (letra, número ou enter), ou remoção (delete, backspace).
     */
    if (!keyboardEvent.ctrlKey && !keyboardEvent.altKey && !keyboardEvent.metaKey &&
        keyboardEvent.key.length === 1 || keyboardEvent.key === 'Delete' || keyboardEvent.key === 'Backspace' ||
        keyboardEvent.key === 'Enter') {

        let selection = editorCtrl.getSelection();
        let range = selection.getRangeAt(0);

        // Se não houver nada selecionado, então não há problema de desempenho.
        if (!range.collapsed) {
            let inicio = range.startContainer.parentNode;
            let final = range.endContainer.parentNode;

            range.deleteContents();

            /* Se a tecla for de remoção, então evitamos a ação padrão.
                * Entretanto, se for de conteúdo, então deixamos que a ação
                * padrão seja executada, para que o novo conteúdo seja inserido
                * no lugar do conteúdo excluído.
                */
            if (keyboardEvent.key === 'Delete' || keyboardEvent.key === 'Backspace') {
                keyboardEvent.preventDefault();
            }

            /* O range da seleção, ainda que seja de todo o conteúdo, não abrange
                * o elemento inicial e o final. Isto é, se o usuário selecionar tudo
                * usando Ctrl+A e prosseguir com a exclusão com a tecla Delete, 
                * o conteúdo selecionado correpsonderá ao primeiro nó textual do primeiro
                * P até o último nó textual do útlimo P.
                * 
                *        <p><!-- início da seleção -->nó textual</p>
                *        <p>nó textual intermediário</p>
                *        <p>último nó textual<-- final da seleção --></p>
                * 
                * Assim, a exclusão irá remover todos os nós textuais e os elementos intermediários,
                * mantendo, entretanto, o primeiro e último elemento (veja ilustração acima,
                * em que a seleção foi demarcada em comentário).
                * 
                * Para contornar esta situação, realizamos manualmente a exclusão dos elementos,
                * se o elemento inicial da seleção for diferente do final, condicionando
                * a exclusão à presença de conteúdo. Deve-se executar o procedimento somente
                * se o início for diferente do final, pois a seleção pode ser apenas de
                * conteúdo intermediário, como ilustrado a seguir:
                * 
                *      <p>este <!-- início da seleção -->é um <!-- final da seleção -->exemplo.</p>
                */
            if (inicio !== final) {
                if (inicio.textContent.length === 0) {
                    inicio.remove();
                }

                if (final.textContent.length === 0) {
                    final.remove();
                }

                /* Caso todo o conteúdo estivesse selecionado, o editor de articulação
                    * passará a ter nenhum elemento neste momento. Neste caso,
                    * deve-se recriar o conteúdo mínimo.
                    */
                if (editorCtrl._elemento.children.length === 0) {
                    editorCtrl.limpar();
                }
            }
            // ... mas se a seleção for todo o conteúdo de um único elemento...
            else if (inicio.textContent.length === 0 && inicio.children.length === 0) {
                /* então deve-se garantir o conteúdo mínimo, para que o cursor do parágrafo
                    * fique posicionado corretamente.
                    */
                inicio.innerHTML = '<br>';
            }
        }
    }
}

export default hackChrome;