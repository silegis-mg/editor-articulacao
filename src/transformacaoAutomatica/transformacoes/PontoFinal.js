import { TransformacaoDoProximo } from './Transformacao';

/**
 * Ao finalizar o dispositivo com ponto final (.) e o usuário
 * estiver no contexto de uma enumeração, então encerra-se ela,
 * transformando o próximo dispositivo em um nível anterior
 * (ex.: alínea para inciso).
 * 
 * @author Júlio César e Melo
 */
class PontoFinal extends TransformacaoDoProximo {
    constructor() {
        super('.\n');
    }

    get tipoTransformacao() {
        return 'PontoFinal';
    }

    proximoTipo(editor, ctrl, contexto) {
        return {
            get inciso() {
                let dispositivo = contexto.cursor.dispositivo;
                let tipo;

                do {
                    dispositivo = dispositivo.previousElementSibling;
                    tipo = dispositivo.getAttribute('data-tipo');
                } while (tipo !== 'artigo' && tipo !== 'paragrafo');

                return tipo;
            },
            alinea: 'inciso',
            item: 'alinea'
        }[contexto.cursor.tipo];
    }
}

export default PontoFinal;