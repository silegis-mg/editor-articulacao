Editor de Articulação
=====================

Funcionalidades
---------------
* Criação de **rótulo e numeração automática** para dispositivos (artigo, parágrafo, inciso, alínea e item);

* Formatação padrão dos dispositivos, conforme regras de redação definidas no art. 12 da [LCP 78/2004](http://www.almg.gov.br/consulte/legislacao/completa/completa.html?tipo=LCP&num=78&comp=&ano=2004).

  * A formatação pode ser **configurável**, para atender ao padrão de redação federal, sem alteração no código.
    
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

Limitações conhecidas
---------------------
* Copiar do editor de articulação e colar em editor externo omite os rótulos.

Contribuições desejadas
-----------------------
* Identificação de remissões;
* Renumeração automática de remissões, em caso de alterações nos dispositivos.