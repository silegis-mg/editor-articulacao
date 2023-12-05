export default interface IOpcoesEditorArticulacaoController {
    /**
     * Determina se deve adotar o Shadow DOM, caso suportado pelo navegador.
     * (Padrão: false)
     */
    shadowDOM?: boolean;

    /**
     * Determina se deve permitir a edição, ou se o componente será somente para leitura.
     */
    somenteLeitura: false,

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
    rotulo?: IOpcoesRotulos;

    /**
     * Determina se deve validar o conteúdo atribuído ao componente.
     * (Padrão: true)
     */
    validarAoAtribuir?: boolean;

    /**
     * Determina as validações que devem ocorrer.
     */
    validacao?: IOpcoesValidacao;
} // eslint-disable-line semi

export interface IOpcoesRotulos {
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
}

export interface IOpcoesValidacao {
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