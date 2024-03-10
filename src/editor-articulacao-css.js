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
const css = `
.silegismg-editor-articulacao {
  counter-reset: parte livro titulo capitulo secao subsecao artigo;
  outline: none;
}

.silegismg-editor-articulacao p::before {
  font-weight: bolder;
  animation: .25s ease-in rotulo;
}

.silegismg-editor-articulacao p[data-tipo] {
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo]::before {
  float: left;
  padding: 0 1ex 0 4ex;
}

.silegismg-editor-articulacao p {
  text-indent: 4ex;
  text-align: justify;
  border-left: solid 2px transparent;
  padding-left: 1ex;
}

.silegismg-editor-articulacao p[data-invalido] {
  border-left-color: red;
}

.silegismg-editor-articulacao p[data-invalido]::after {
  display: block;
  content: attr(data-invalido);
  color: red;
  text-indent: 0;
  margin-left: auto;
  font-size: 90%;
}

.silegismg-editor-articulacao p[data-tipo="titulo"]::before {
  content: 'Título ' counter(titulo, upper-roman);
  counter-increment: titulo;
  display: block;
  text-align: center;
  margin-right: 0;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="titulo"] {
  counter-reset: capitulo;
  text-transform: uppercase;
  font-weight: bolder;
  font-size: 110%;
  text-align: center;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="capitulo"]::before {
  content: 'Capítulo ' counter(capitulo, upper-roman);
  counter-increment: capitulo;
  display: block;
  text-align: center;
  font-weight: normal;
  margin-right: 0;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="capitulo"] {
  counter-reset: secao;
  text-transform: uppercase;
  font-size: 110%;
  text-align: center;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="secao"]::before {
  content: 'Seção ' counter(secao, upper-roman);
  counter-increment: secao;
  display: block;
  text-align: center;
  margin-right: 0;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="secao"] {
  counter-reset: subsecao;
  font-weight: bolder;
  font-size: 110%;
  text-align: center;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="subsecao"]::before {
  content: 'Subseção ' counter(subsecao, upper-roman);
  counter-increment: subsecao;
  display: block;
  text-align: center;
  margin-right: 0;
  text-indent: 0;
}

.silegismg-editor-articulacao p[data-tipo="subsecao"] {
  font-weight: bolder;
  font-size: 110%;
  text-align: center;
  text-indent: 0;
}


.silegismg-editor-articulacao p[data-tipo="artigo"]::before {
  content: 'Art. ' counter(artigo) 'º' '\${separadorArtigo}';
  counter-increment: artigo;
}

.silegismg-editor-articulacao p[data-tipo="artigo"].emenda::before {
  content: 'Art. ' counter(artigo) 'º-' counter(emenda, upper-latin) '\${separadorArtigo}';
  counter-increment: emenda;
}

/* A partir do artigo 10, não se usa "º" */

.silegismg-editor-articulacao p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda)::before {
  content: 'Art. ' counter(artigo) '\${separadorArtigoSemOrdinal}';
}

.silegismg-editor-articulacao p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"]:not(.emenda) ~ p[data-tipo="artigo"].emenda::before {
  content: 'Art. ' counter(artigo) '-' counter(emenda, upper-latin) '\${separadorArtigoSemOrdinal}';
}

.silegismg-editor-articulacao p[data-tipo='artigo'] {
  counter-reset: paragrafo inciso emenda;
}

.silegismg-editor-articulacao p[data-tipo='artigo'].emenda {
  counter-reset: paragrafo inciso;
}

.silegismg-editor-articulacao p[data-tipo='paragrafo'] {
  counter-reset: inciso;
}

.silegismg-editor-articulacao p[data-tipo='paragrafo']::before {
  content: '§ ' counter(paragrafo) 'º' '\${separadorParagrafo}';
  counter-increment: paragrafo;
}

.silegismg-editor-articulacao p.semOrdinal[data-tipo='paragrafo']::before {
  content: '§ ' counter(paragrafo) '\${separadorParagrafoSemOrdinal}';
  counter-increment: paragrafo;
}

.silegismg-editor-articulacao p[data-tipo='paragrafo'].unico::before {
  content: 'Parágrafo único\${separadorParagrafoUnico}';
}

.silegismg-editor-articulacao p[data-tipo='inciso'] {
  counter-reset: alinea;
}

.silegismg-editor-articulacao p[data-tipo='inciso']::before {
  content: counter(inciso, upper-roman) '\${separadorInciso}';
  counter-increment: inciso;
}

.silegismg-editor-articulacao p[data-tipo='alinea'] {
  counter-reset: item;
}

.silegismg-editor-articulacao p[data-tipo='alinea']::before {
  content: counter(alinea, lower-latin) '\${separadorAlinea}';
  counter-increment: alinea;
}

.silegismg-editor-articulacao p[data-tipo='item']::before {
  content: counter(item) '\${separadorItem}';
  counter-increment: item;
}


/* O primeiro artigo não deve ter margem superior */

.silegismg-editor-articulacao > *:first-child {
  margin-top: 0;
}


/* O último artigo não deve ter margem inferior */

.silegismg-editor-articulacao > *:last-child {
  margin-bottom: 0;
}

@keyframes rotulo {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;

export default css;