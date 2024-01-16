import ContextoArticulacao from './ContextoArticulacao';
import interpretadorArticulacao from './interpretadorArticulacao';

/**
 * Transforma um elemento do DOM em um editor de articulação com
 * barra de ferramentas.
 */
declare class ComponenteEdicao {
    /**
     * Cria um controlador do Editor de Articulação vinculado a um elemento do DOM.
     * 
     * @param Elemento que receberá o editor de articulação.
     * @param opcoes Opções do editor de articulação.
     */
    constructor(elemento: HTMLElement, opcoes?: IOpcoesEditorArticulacaoController);
}

declare class EditorArticulacaoController {
    /**
     * Cria um controlador do Editor de Articulação vinculado a um elemento do DOM.
     * 
     * @param Elemento que receberá o editor de articulação.
     * @param opcoes Opções do editor de articulação.
     */
    constructor(elemento: HTMLElement, opcoes?: IOpcoesEditorArticulacaoController);

    /**
     * Obtém o XML da articulação no formato LexML.
     */
    get lexml(): Element | DocumentFragment;

    /**
     * Define o XML da articulação no formato LexML.
     */
    set lexml(valor: Element | DocumentFragment);

    /**
     * Obtém o XML da articulação no formato LexML, porém em String.
     */
    get lexmlString(): string;

    /**
     * Define o XML da articulação no formato LexML, porém em String.
     */
    set lexmlString(valor: string);

    /**
     * Verifica se o editor de articulação sofreu alteração.
     */
    get alterado(): boolean;

    /**
     * Altera o tipo do dispositivo em que o cursor se encontra, pelo novo tipo fornecido como parâmetro.
     *
     * @param novoTipo Novo tipo do dispositivo.
     */
    alterarTipoDispositivoSelecionado(novoTipo: TipoDispositivo): void;

    get contexto(): ContextoArticulacao;
}

declare interface IOpcoesEditorArticulacaoController {
    /**
     * Determina se deve adotar o Shadow DOM, caso suportado pelo navegador.
     * (Padrão: false)
     */
    shadowDOM?: boolean;

    /**
     * Determina se o editor de articulação deve aplicar transformação automática.
     * (Padrão: true)
     */
    transformacaoAutomatica?: boolean;

    /**
     * Determina o escapamento de caracteres de código alto unicode durante
     * a exportação para lexmlString.
     * (Padrão: false)
     */
    escaparXML?: boolean;

    /**
     * Determina o sufixo para os rótulos dos dispositivos.
     */
    rotulo?: {
        /**
         * Separador do rótulo do artigo 1º ao 9º 
         */
        separadorArtigo?: string;
        
        /**
         * Separador do rótulo do artigo 10 em diante 
         */
        separadorArtigoSemOrdinal?: string;
        
        /**
         * Separador do rótulo do parágrafo 1º ao 9º 
         */
        separadorParagrafo?: string;
        
        /**
         * Separador do rótulo do parágrafo 10 em diante 
         */
        separadorParagrafoSemOrdinal?: string;
        
        /**
         * Separador do rótulo parágrafo único 
         */
        separadorParagrafoUnico?: string;
        
        /**
         * Separador do rótulo de inciso 
         */
        separadorInciso?: string;
        
        /**
         * Separador do rótulo da alínea 
         */
        separadorAlinea?: string;
        
        /**
         * Separador do rótulo do item 
         */
        separadorItem?: string;
    };

    /**
     * Determina se deve validar o conteúdo atribuído ao componente.
     * (Padrão: true)
     */
    validarAoAtribuir?: boolean;

    /**
     * Determina as validações que devem ocorrer.
     */
    validacao?: {
        /**
         * Determina se deve validar o uso de caixa alta.
         */
        caixaAlta?: boolean;
        
        /**
         * Determina se deve validar o uso de aspas em citações.
         */
        citacao?: boolean;
        
        /**
         * Determina se deve validar a presença de múltiplos elementos em uma enumeração.
         */
        enumeracaoElementos?: boolean;
        
        /**
         * Determina se deve validar o uso de letra maiúscula no caput do artigo e em parágrafos.
         */
        inicialMaiuscula?: boolean;
        
        /**
         * Determina se deve validar as pontuações.
         */
        pontuacao?: boolean;
        
        /**
         * Determina se deve validar pontuação de enumeração.
         */
        pontuacaoEnumeracao?: boolean;
        
        /**
         * Determina se deve exigir sentença única no dispositivo.
         */
        sentencaUnica?: boolean;
    }
}

declare enum TipoDispositivo {
    TITULO = 'titulo',
    CAPITULO = 'capitulo',
    SECAO = 'secao',
    SUBSECAO = 'subsecao',
    ARTIGO = 'artigo',
    PARAGRAFO = 'paragrafo',
    INCISO = 'inciso',
    ALINEA = 'alinea',
    CONTINUACAO = 'continuacao'
}

declare const interpretadorArticulacao = {
    Artigo,
    Paragrafo,
    Inciso,
    Alinea,
    Item,
    Titulo,
    Capitulo,
    Secao,
    Subsecao,
    transformarQuebrasDeLinhaEmP,
    interpretar
}

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param texto Texto a ser interpretado
 * @param formatoDestino Formato a ser retornado: 'json', 'lexml' (padrão) ou "lexmlString".
 * @param formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 */
function interpretar(texto: string, formatoDestino: TFORMATO_DESTINO = 'lexml', formatoOrigem: TFORMATO_ORIGEM = 'texto'): IResultadoInterpretacao | Element | DocumentFragment | string;

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param texto Texto a ser interpretado
 */
function interpretar(texto: string): Element | DocumentFragment;

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param texto Texto a ser interpretado
 * @param formatoDestino Formato a ser retornado: 'json', 'lexml' (padrão) ou "lexmlString".
 * @param formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 */
function interpretar(texto: string, formatoDestino: 'json', formatoOrigem: TFORMATO_ORIGEM = 'texto'): IResultadoInterpretacao;

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param texto Texto a ser interpretado
 * @param formatoDestino Formato a ser retornado: 'json', 'lexml' (padrão) ou "lexmlString".
 * @param formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 */
function interpretar(texto: string, formatoDestino: 'lexml', formatoOrigem: TFORMATO_ORIGEM = 'texto'): Element | DocumentFragment;

/**
 * Interpreta conteúdo de articulação.
 * 
 * @param texto Texto a ser interpretado
 * @param formatoDestino Formato a ser retornado: 'json', 'lexml' (padrão) ou "lexmlString".
 * @param formatoOrigem Formatao a ser processado: 'texto' (padrão), 'html'.
 */
function interpretar(texto: string, formatoDestino: 'lexmlString', formatoOrigem: TFORMATO_ORIGEM = 'texto'): string;

declare interface IResultadoInterpretacao {
    textoAnterior: string;
    articulacao: Dispositivo[];
}

declare type TFORMATO_DESTINO = 'json' | 'lexml' | 'lexmlString';

declare type TFORMATO_ORIGEM = 'texto' | 'html';

declare class Dispositivo {
    constructor(tipo: string, numero: string, descricao: string, derivacoes: string[]);

    adicionar(dispositivo: Dispositivo);

    /**
     * Transforma o conteúdo na descrição em fragmento do DOM.
     */
    transformarConteudoEmFragmento(): DocumentFragment;

    /**
     * Transforma o dispositivo no formato do editor.
     */
    paraEditor(): DocumentFragment;
}

declare class Artigo extends Dispositivo {
    constructor(numero: string, caput: string);

    adicionar(incisoOuParagrafo: Inciso | Paragrafo);
}

declare class Paragrafo extends Dispositivo {
    constructor(numero: string, descricao: string);

    adicionar(inciso: Inciso);
}

declare class Inciso extends Dispositivo {
    constructor(numero: string, descricao: string);

    adicionar(alinea: Alinea);
}

declare class Alinea extends Dispositivo {
    constructor(numero: string, descricao: string);

    adicionar(item: Item);
}

declare class Item extends Dispositivo {
    constructor(numero: string, descricao: string);
}

declare class Divisao extends Dispositivo {
    constructor(tipo: string, numero: string, descricao: string);
    
    adicionar(item);
}

declare class Titulo extends Divisao {
    constructor(numero: string, descricao: string);
}

declare class Capitulo extends Divisao {
    constructor(numero: string, descricao: string);
}

declare class Secao extends Divisao {
    constructor(numero: string, descricao: string);
}

declare class Subsecao extends Divisao {
    constructor(numero: string, descricao: string);
}

/**
 * Representa o contexto do usuário no editor de articulação.
 * Possui dois atributos: cursor, contendo o contexto no cursor,
 * e as permissões de alteração de dispositivo na seleção.
 */
declare class ContextoArticulacao {
    constructor(elementoArticulacao: HTMLElement, dispositivo: Dispositivo);

    comparar(obj2: ContextoArticulacao): boolean {
        for (let i in this.cursor) {
            if (this.cursor[i] !== obj2.cursor[i]) {
                return true;
            }
        }

        for (let i in this.permissoes) {
            if (this.permissoes[i] !== obj2.permissoes[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determina se o contexto atual é válido.
     *
     * @returns {Boolean} Verdadeiro, se o contexto estiver válido.
     */
    get valido(): boolean;

    /**
     * Verifica quais tipos de dispositivos são permitidos no contexto atual.
     */
    readonly permissoes: {
        readonly titulo: boolean;
        readonly capitulo: boolean;
        readonly secao: boolean;
        readonly subsecao: boolean;
        readonly artigo: boolean;
        readonly continuacao: boolean;
        readonly inciso: boolean;
        readonly paragrafo: boolean;
        readonly alinea: boolean;
        readonly item: boolean;
    }

    /**
     * Informações sobre o contexto onde está o cursor.
     */
    readonly cursor: {
        /**
         * Indica se o cursor está em um trecho com itálico.
         */
        readonly italico: boolean;

        /**
         * Indica se o cursor está em um elemento desconhecido.
         */
        readonly desconhecido: boolean;

        /**
         * Indica se o cursor está em um título.
         */
        readonly titulo: boolean;

        /**
         * Indica se o cursor está em um capítulo.
         */
        readonly capitulo: boolean;

        /**
         * Indica se o cursor está em uma seção.
         */
        readonly secao: boolean;

        /**
         * Indica se o cursor está em uma subseção.
         */
        readonly subsecao: boolean;

        /**
         * Indica se o cursor está em um artigo.
         */
        readonly artigo: boolean;

        /**
         * Indica se o cursor está em uma continuação (outra linha)
         * do dispositivo.
         */
        readonly continuacao: boolean;

        /**
         * Indica se o cursor está em um parágrafo.
         */
        readonly paragrafo: boolean;

        /**
         * Indica se o cursor está em uma alínea.
         */
        readonly inciso: boolean;

        /**
         * Indica se o cursor está em uma alínea.
         */
        readonly alinea: boolean;

        /**
         * Indica se o cursor está em um item.
         */
        readonly item: boolean;

        /**
         * Indica se o cursor está na raíz do editor.
         */
        readonly raiz: boolean;

        /**
         * Elemento do DOM do dispositivo atual.
         */
        readonly elemento: HTMLElement;

        /**
         * Tipo do dispositivo atual.
         */
        readonly tipo: TipoDispositivo;

        /**
         * Dispositivo atual.
         */
        readonly dispositivo: Dispositivo;

        /**
         * Instância do dispositivo anterior.
         */
        readonly dispositivoAnterior: Dispositivo;

        /**
         * Tipo do dispositivo anterior.
         */
        readonly tipoAnterior: TipoDispositivo;
    }
}

export = {
    ComponenteEdicao,
    EditorArticulacaoController,
    interpretadorArticulacao
}