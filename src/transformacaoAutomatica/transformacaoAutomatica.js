import DoisPontos from './transformacoes/DoisPontos';
import PontoFinal from './transformacoes/PontoFinal';
import AoIniciarAspas from './transformacoes/AoIniciarAspas';
import AoFecharAspas from './transformacoes/AoFecharAspas';

function adicionarTransformacaoAutomatica(editorArticulacaoCtrl, elemento) {
    var parser = {}, estado = [];

    adicionarParser(parser, new DoisPontos());
    adicionarParser(parser, new PontoFinal());
    adicionarParser(parser, new AoIniciarAspas());
    adicionarParser(parser, new AoFecharAspas());

    elemento.addEventListener('keypress', event => estado = processarEstado(event, parser, estado, editorArticulacaoCtrl, elemento));
    elemento.addEventListener('mouseup', event => estado = []);
    elemento.addEventListener('touchend', event => estado = []);
}


function adicionarParser(parser, transformador) {
    transformador.sequencias.forEach(function(sequencia) {
        var i, pAtual = parser, c;
        var handler = transformador.transformar.bind(transformador);

        for (i = 0; i < sequencia.length; i++) {
            c = sequencia.charCodeAt(i);

            if (!pAtual[c]) {
                pAtual[c] = {};
            }

            pAtual = pAtual[c];
        }

        let objHandler = {
            sequencia: sequencia,
            handler: handler
        };

        if (pAtual.$handler) {
            pAtual.$handler.push(objHandler);
        } else {
            pAtual.$handler = [objHandler];
        }
    });
};

/**
 * Realiza o parsing da edição.
 */
function processarEstado(event, _parser, _estadoParser, controller, elemento) {
    var novoEstado = [],
        c = event.charCode || event.keyCode;

    _estadoParser.forEach(function (estado) {
        if (estado[c]) {
            novoEstado.push(estado[c]);
        }
    });

    if (_parser[c]) {
        novoEstado.push(_parser[c]);
    }

    novoEstado.forEach(function (estado) {
        if (estado.$handler) {
            estado.$handler.forEach(objHandler => objHandler.handler(elemento, controller, controller.contexto, objHandler.sequencia.replace(/\r/g, '\n')));
        }
    });

    return novoEstado;
};

export default adicionarTransformacaoAutomatica;