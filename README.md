[![npm version](https://badge.fury.io/js/silegismg-editor-articulacao.svg)](https://badge.fury.io/js/silegismg-editor-articulacao)
[![Node.js CI](https://github.com/silegis-mg/editor-articulacao/actions/workflows/node.js.yml/badge.svg)](https://github.com/silegis-mg/editor-articulacao/actions/workflows/node.js.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/053249e72dc77f0e2e3b/maintainability)](https://codeclimate.com/github/silegis-mg/editor-articulacao/maintainability)

# Editor de Articulação

O editor de articulação é uma biblioteca javascript elaborada pela Assembleia Legislativa de Minas Gerais,
como parte do Sistema de Informação Legislativa de Minas Gerais (Silegis-MG).

Ele permite a edição de texto articulado, formatando e numerando automaticamente artigos, parágrafos,
incisos, alíneas e itens, bem como as divisões em títulos, capítulos, seções e subseções. O texto articulado
é estruturado em formato XML, conforme elemento `Articulacao` definido pelo schema do [LexML](https://github.com/lexml/lexml-xml-schemas/tree/master/src/main/resources/xsd).

## Demonstração

Acesse https://silegis-mg.github.io/editor-articulacao/ para ver uma simples demonstração do editor de articulação funcionando em seu navegador.

## Funcionalidades

* Criação de **rótulo e numeração automática** para dispositivos (artigo, parágrafo, inciso, alínea e item);

* Formatação padrão dos dispositivos, conforme regras de redação definidas no art. 12 da [LCP 78/2004](http://www.almg.gov.br/consulte/legislacao/completa/completa.html?tipo=LCP&num=78&comp=&ano=2004).

  * A formatação pode ser **configurada**, para atender ao padrão de redação federal, sem alteração no código.
    
* Divisão dos artigos em títulos, capítulos, seções e subseções;
* Validação automática de:
  * **caixa alta:** artigos e parágrafos não devem ser escritos usando apenas caixa alta;
  * **uso de aspas:** citações devem estar entre aspas e terminar com ponto final (.);
  * **enumerações:** enumerações devem possuir mais de um elemento;
  * **letra maiúscula:** artigos e parágrafos devem ser iniciados com letra maiúscula;
  * **pontuação:** artigos e parágrafos devem ser terminados com ponto final (.) ou dois pontos (:), sem espaço antes da pontuação, e enumerações devem ser terminadas com ponto final (.), ponto e vírgula (;) ou dois pontos (:), sem espaço antes da pontuação.;
  * **sentença única:** dispositivos devem conter uma única sentença.
* Auto-formatação:
  * **ao abrir aspas**, formata-se automaticamente como um texto dentro do caput, permitindo múltiplas linhas dentro das aspas;
  * **ao fechar aspas**, formata-se a próxima linha como um novo artigo;
  * **ao finalizar com dois pontos**, inicia-se uma enumeração (de artigo ou parágrafo para inciso, de inciso para alínea e de alínea para item);
  * **ao finalizar com ponto final**, finaliza-se a enumeração (de item para alínea, de alínea para inciso, de inciso para artigo ou parágrafo);
  * **ao dar enter em uma linha vazia**, troca a formatação da linha vazia para artigo, quando formatado como parágrafo, ou encerra a enumeração, quando formatado como inciso, alínea ou item.
* Articulação pode ser importada/exportada de/para XML, seguindo especificação do **LexML**;
* Interpretação de conteúdo colado, de forma a permitir a formatação e numeração automática em dispositivos estruturados.

## Como usar a partir do código fonte

### Pré-requisitos para compilação

* [NodeJS com npm](https://nodejs.org/en/download/)

### Baixando o editor

```
git clone https://github.com/silegis-mg/editor-articulacao.git
```

### Instalação das dependências

Após baixar o editor, mude para o diretório onde encontram os fontes e instale as dependências: 

```
cd editor-articulacao
npm install
```

### Executando exemplo

Finalizado o passo anterior, execute:

```
npm start
```

Em seguida, basta abrir o navegador no endereço http://localhost:8080/exemplo.html

### Testando

O editor de articulação possui testes automatizados utilizando karma e protractor.

```
npm test
```

Se estiver utlizando proxy, defina a variável de ambiente http_proxy para que o teste consiga baixar o webdriver do Chrome mais atual.

### Gerando pacote para aplicações finais em ES5

O javascript minificado é gerado por meio do webpack, a partir de uma tarefa do grunt. Existem dois empacotamentos para uso em aplicações finais:

#### Plain-JS

O empacotamento `plain-js` define `silegismgEditorArticulacao` como uma função global para transformar um elemento no DOM em um editor de articulação.
Também define a função `silegismgEditorArticulacaoController` para criar o controller, caso o utilizador queira maior controle
da interface de usuário.

Também é definida a função global [`silegismgInterpretadorArticulacao.interpretar`](#api-interpretador) para interpretação de texto articulado.

##### Gerando pacote

```
npx grunt build-plain
```

É possível incluir o polyfill do babel também, utilizando:

```
npx grunt build-plain-polyfill
```

##### Utilizando plain-js

Existem duas possibilidades para criar o editor de articulação. Uma que incorpora a barra de ferramentas
e outra que apenas vincula o controlador do editor de articulação, permitindo ao utilizador personalizar por
completo a interface de usuário.

Para criar o editor de articulação com barra de ferramentas padrão, utilize a sintaxe `silegismgEditorArticulacao(elemento, opcoes)`.
Para criar o editor de articulação personalizando por completa a interface de usuário, utilize a sintaxe `silegismgEditorArticulacaoController(elemento, opcoes)`, que retornará o controlador, cujos métodos estão descritos na [API do controlador](#api-controlador). Para exemplo de como personalizar a interface, veja o [arquivo de teste do protractor](test/protractor/teste.html).

Veja também a [API do interpretador de articulação](#api-interpretador).

##### Exemplo

```html
<script src="build/silegismg-editor-articulacao-plain-js.js"></script>
<div id="editor"></div>
<script>
  silegismgEditorArticulacao(document.getElementById('editor'));
</script>
```

#### Angular 1

O empacotamento `angular1` registra a diretiva `silegismgEditorArticulacaoConteudo` no módulo `silegismg-editor-articulacao` para AngularJS 1.x.

##### Gerando pacote

```
npx grunt build-angular1
```

##### Exemplo

```html
<script src="build/silegismg-editor-articulacao-angular1.js"></script>
<silegismg-editor-articulacao-conteudo id="editor" opcoes="opcoes"></silegismg-editor-articulacao-conteudo>
```

<a name="opcoes"></a>

### Utilizando como módulo ES6 e webpack

```
npm install silegismg-editor-articulacao
```

JS:
```js
import { ComponenteEdicao, EditorArticulacaoController, interpretadorArticulacao } from 'silegismg-editor-articulacao';

const opcoes = { /* ... */ };
var elemento = document.getElementById('exemplo');
var ctrl = new EditorArticulacaoController(elemento, opcoes);
```

HTML:
```html
<div id="exemplo"></div>
```

#### Configuração do webpack

O editor de articulação importa o conteúdo do CSS e manipula em tempo de execução, a fim de aplicar os parâmetros de configuração. Para tanto, deve-se utilizar o seguinte loader para os arquivos CSS deste módulo:

```json
{
    test: /\.css$/,
    use: {
        loader: 'css-loader',
        options: {
            minimize: true,
            sourceMap: true
        }
    }
}
```

## Opções do editor de articulação

| Atributo | Tipo | Valor padrão | Descrição |
| -------- | ---- | ------------ | --------- |
| shadowDOM | Boolean | false | **(Experimental)** Determina se deve adotar o Shadow DOM, se suportado pelo navegador. |
| transformacaoAutomatica | Boolean | true | Determina se o editor de articulação deve aplicar transformação automática. |
| escaparXML | Boolean | false | Determina o escapamento de caracteres de código alto unicode durante a exportação para lexmlString. |
| rotulo | [Object](#opcoes.rotulo) | | Determina o sufixo para os rótulos dos dispositivos. |
| validarAoAtribuir | Boolean | true | Determina se deve validar o conteúdo atribuído ao componente. |
| validacao | [Object](#opcoes.validacao) | | Determina as validações que devem ocorrer. |

<a name="opcoes.rotulo"></a>

### Opções de rótulo

Todos os atributos de rótulo são do tipo literal (String).

| Atributo | Valor padrão | Descrição |
| -------- | ------------ | --------- |
| separadorArtigo | &#8211; | Separador do rótulo do artigo 1º ao 9º |
| separadorArtigoSemOrdinal | &#8211; | Separador do rótulo do artigo 10 em diante |
| separadorParagrafo | &#8211; | Separador do rótulo do parágrafo 1º ao 9º |
| separadorParagrafoSemOrdinal | &#8211; | Separador do rótulo do parágrafo 10 em diante |
| separadorParagrafoUnico | &#8211; | Separador do rótulo parágrafo único |
| separadorInciso | &#8211; | Separador do rótulo de inciso |
| separadorAlinea | ) | Separador do rótulo da alínea |
| separadorItem | ) | Separador do rótulo do item |

<a name="opcoes.validacao"></a>

### Opções de validação

Todas as opções de validação são habilitadas (valor true) por padrão.

| Atributo | Descrição |
| -------- | --------- |
| caixaAlta | Determina se deve validar o uso de caixa alta. |
| citacao | Determina se deve validar o uso de aspas em citações. |
| enumeracaoElementos | Determina se deve validar a presença de múltiplos elementos em uma enumeração. |
| inicialMaiuscula | Determina se deve validar o uso de letra maiúscula no caput do artigo e em parágrafos. |
| pontuacao | Determina se deve validar as pontuações. |
| pontuacaoEnumeracao | Determina se deve validar pontuação de enumeração. |
| sentencaUnica | Determina se deve exigir sentença única no dispositivo. |

<a name="api-controlador"></a>

## API do controlador

| Propriedade/Função | Retorno/Valor | Descrição |
| ------------------ | ------------- | --------- |
| lexml *(propriedade)* | ElementNS | Obtém ou define o XML da articulação no formato LexML. |
| lexmlString *(propriedade)* | String | Obtém ou define o XML da articulação no formato LexML, porém em String. |
| alterado *(propriedade, somente leitura)* | Boolean | Verifica se o editor de articulação sofreu alteração. |
| alterarTipoDispositivoSelecionado(novoTipo) | void | Altera o tipo do dispositivo em que o cursor se encontra, pelo novo tipo (String) fornecido como parâmetro. Os tipos possíveis são: titulo, capitulo, secao, subsecao, artigo, paragrafo, inciso, alinea e continuacao (todos sem acentuação ou cedilha). |
| contexto | object | Obtém o contexto atual do editor |

### Eventos do controlador

| Evento | Disparo | Condição | Classe do evento | Dados do evento |
|--------|---------|----------|------------------|-----------------|
| change | blur    | Texto articulado alterado | ArticulacaoChangeEvent | N/A |
| contexto | | Objeto de contexto atualizado | ContextoArticulacaoAtualizadoEvent | ContextoArticulacao |
| transformacao | | Controlador aplicou alguma transformação automática | TransformacaoAutomaticaEvent | Objeto contendo os seguintes atributos: automatica (booleano), tipoAnterior (literal, tipo do elemento antes da alteração), novoTipo (literal, tipo do elemento depois da alteração), transformacao (literal, nome da transformacao), editorArticulacaoCtrl (controller) |


<a name="api-interpretador"></a>

## API do interpretador

Para interpretar um texto puro, transformando em um texto estruturado utilizando LexML, utilize a função interpretar (veja [código-fonte](src/interpretadorArticulacao.js)), com a seguinte sintaxe:

```javascript
interpretadorArticulacao.interpretar(texto, formatoDestino, formatoOrigem);
```

onde ``texto`` é uma `string`, ``formatoDestino`` é uma das opções "json", "lexml" (padrão) ou "lexmlString" e ``formatoOrigem`` é "texto" (padrão) ou "html".

Contribuições desejadas
-----------------------
* Identificação de remissões;
* Renumeração automática de remissões, em caso de alterações nos dispositivos;
* Modo de edição de norma, em que alterações a um texto original são consideradas emendas.

Limitações conhecidas (aceita-se contribuições)
-----------------------------------------------
As limitações conhecidas correspondem a um conjunto de funcionalidade que não funciona como deveria, mas seu comportamento é aceitável para a proposta do editor. Contribuições são bem-vindas.

* Copiar do editor de articulação e colar em editor externo omite os rótulos;
* Interpretação de artigo com emenda (exemplo: Art. 283-A da Constituição do Estado de Minas Gerais), apesar de haver suporte para importação de LexML com este tipo de dispositivo.

# Compatibilidade com navegadores

|  Navegador | Compatível | Mantida<sup>[1](#rodape1)</sup> |
| ---------- |:----------:|:----------:|
| Firefox 52 | ✓ | ✓ |
| Firefox Quantum 57 | ✓ | |
| Chrome 62 |  ✓ | ✓ |
| IE 11 |  ✓ | |
| Edge | ✓ | |
| Safari | ? | |

<a name="rodape1"><sup>1</sup></a>: Considera-se compatibilidade com navegador mantida aquela que é constantemente testada pela equipe de desenvolvimento.
