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
const editorHtml = `
<style rel="stylesheet/css">
    .silegismg-editor-base {
        border: solid 1px #ccc;
        border-top: none;
    }

    .silegismg-editor-base .silegismg-editor-botoes {
        background: #ccc;
        padding: 18px 4px 4px 4px;
    }

    .silegismg-editor-base .silegismg-editor-botoes .silegismg-editor-botoes-agrupamento {
        display: inline-block;
        margin-right: 1ex;
    }

    .silegismg-editor-base .silegismg-editor-botoes .silegismg-editor-botoes-agrupamento:before {
        content: attr(data-agrupamento);
        position: absolute;
        margin-top: -1.3em;
        font-size: 12px;
    }

    .silegismg-editor-base .silegismg-editor-botoes button[disabled] {
        opacity: .5;
    }

    .silegismg-editor-base .silegismg-editor-botoes button.atual {
        background: white;
        color: black;
        border: white 2px;
        padding: 2px 1ex;
        font-weight: bolder;
    }

    .silegismg-editor-base .silegismg-editor-conteudo {
        margin: 2ex;
    }
</style>
<div class="silegismg-editor-base">
    <!-- Barra de ferramentas para alterar formatação de dispositivos -->    
    <div class="silegismg-editor-botoes">
        <div class="silegismg-editor-botoes-agrupamento" data-agrupamento="Divisão do texto">
            <button data-tipo-destino="titulo">Título</button>
            <button data-tipo-destino="capitulo">Capítulo</button>
            <button data-tipo-destino="secao">Seção</button>
            <button data-tipo-destino="subsecao">Subseção</button>
        </div>
        <div class="silegismg-editor-botoes-agrupamento" data-agrupamento="Formatação de dispositivos">
            <button data-tipo-destino="continuacao">Continuação</button>
            <button data-tipo-destino="artigo">Artigo</button>
            <button data-tipo-destino="paragrafo">Parágrafo</button>
            <button data-tipo-destino="inciso">Inciso</button>
            <button data-tipo-destino="alinea">Alínea</button>
            <button data-tipo-destino="item">Item</button>
        </div>
    </div>
    <div class="silegismg-editor-conteudo">
    </div>
</div>
`;

export default editorHtml;