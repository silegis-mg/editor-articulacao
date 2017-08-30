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

import ProblemaValidacao from './ProblemaValidacao';
import ValidadorCaixaAlta from './ValidadorCaixaAlta';
import ValidadorCitacao from './ValidadorCitacao';
import ValidadorEnumeracaoElementos from './ValidadorEnumeracaoElementos';
import ValidadorIniciarLetraMaiuscula from './ValidadorIniciarLetraMaiuscula';
import ValidadorPontuacaoArtigoParagrafo from './ValidadorPontuacaoArtigoParagrafo';
import ValidadorPontuacaoEnumeracao from './ValidadorPontuacaoEnumeracao';
import ValidadorSentencaUnica from './ValidadorSentencaUnica';

/**
 * Controler para realizar validação nos dispositivos.
 */
class ValidacaoController {
    constructor(opcoes) {
        this.validadores = [];

        if (opcoes !== false) {
            habilitar(opcoes, 'caixaAlta', this.validadores, ValidadorCaixaAlta);
            habilitar(opcoes, 'citacao', this.validadores, ValidadorCitacao);
            habilitar(opcoes, 'enumeracaoElementos', this.validadores, ValidadorEnumeracaoElementos);
            habilitar(opcoes, 'inicialMaiuscula', this.validadores, ValidadorIniciarLetraMaiuscula);
            habilitar(opcoes, 'pontuacao', this.validadores, ValidadorPontuacaoArtigoParagrafo);
            habilitar(opcoes, 'pontuacaoEnumeracao', this.validadores, ValidadorPontuacaoEnumeracao);
            habilitar(opcoes, 'sentencaUnica', this.validadores, ValidadorSentencaUnica);
        }
    }

    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {ProblemaValidacao[]} Problemas encontrados.
     */
    validar(dispositivo) {
        if (!dispositivo) {
            return;
        }

        let problemas = [];

        if (dispositivo.textContent.length > 0) {
            this.validadores.forEach(item => {
                var validador = item.validador;
                var opcao = item.opcao;

                if (validador.aplicaSeA(dispositivo) && !validador.validar(dispositivo)) {
                    problemas.push(new ProblemaValidacao(dispositivo, opcao, validador.descricao));
                }
            });

            if (problemas.length > 0) {
                dispositivo.setAttribute('data-invalido', problemas.reduce((prev, problema) => prev ? prev + ' ' + problema.descricao : problema.descricao, null));
            } else {
                dispositivo.removeAttribute('data-invalido');
            }
        }

        return problemas;
    }
}

/**
 * Habilita um validador.
 * 
 * @param {Object} opcoes Conjunto de opções fornecidas para o controller de validação.
 * @param {String} nomeOpcao Nome da opção para habilitar um validador.
 * @param {Validador[]} validadores Vetor de validadores.
 * @param {Class} Validador Classe do validador.
 */
function habilitar(opcoes, nomeOpcao, validadores, Validador) {
    if (opcoes === true || opcoes[nomeOpcao] !== false) {
        validadores.push({ validador: new Validador(), opcao: nomeOpcao });
    }
}

export default ValidacaoController;