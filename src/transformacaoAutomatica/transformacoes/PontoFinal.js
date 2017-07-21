import { TransformacaoDoProximo } from './Transformacao';

class PontoFinal extends TransformacaoDoProximo {
    constructor() {
        super('.\n');
    }

    proximoTipo(editor, ctrl, contexto) {
        return {
            get inciso() {
                let dispositivo = contexto.cursor.dispositivo;
                let tipo;

                do {
                    dispositivo = dispositivo.previousElementSibling;
                    tipo = dispositivo.getAttribute('data-tipo')
                } while (tipo !== 'artigo' && tipo !== 'paragrafo');

                return tipo;
            },
            alinea: 'inciso',
            item: 'alinea'
        }[contexto.cursor.tipo];
    }
}

export default PontoFinal;