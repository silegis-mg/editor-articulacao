import { interceptar } from './interceptador';

function hackChrome(controller) {
    interceptar(controller, 'alterarTipoDispositivoSelecionado', hackAlterarTipo);
}

/**
 * O chrome faz cache do counter-reset e, quando um counter-reset é introduzido
 * (por mudança de css), os elementos seguintes não são afetados.
 * 
 * @param {EditorArticulacaoController} ctrl 
 * @param {function} metodo
 * @param {*} argumentos 
 * 
 * @author Júlio César e Melo
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
 * 
 * @author Júlio César e Melo
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
 * 
 * @author Júlio César e Melo
 */
function redefinirContador(dispositivo) {
    let tipo = dispositivo.getAttribute('data-tipo');
    dispositivo.setAttribute('data-tipo', '');
    setTimeout(() => dispositivo.setAttribute('data-tipo', tipo));
}

export default hackChrome;