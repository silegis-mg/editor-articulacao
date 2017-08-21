import importarDeLexML from '../src/lexml/importarDeLexML';
import exportarParaLexML from '../src/lexml/exportarParaLexML';
import interpretadorArticulacao from '../src/interpretadorArticulacao';
import { transformarTextoPuro, transformar } from '../src/ClipboardController';
import ValidacaoController from '../src/validacao/ValidacaoController';

window.importarDeLexML = importarDeLexML;
window.exportarParaLexML = exportarParaLexML;
window.interpretadorArticulacao = interpretadorArticulacao;
window.clipbaordControllerModule = {
    interpretarTextoPuro: transformarTextoPuro,
    transformar: transformar
};
window.ValidacaoController = ValidacaoController;