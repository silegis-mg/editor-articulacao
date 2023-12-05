/* eslint-disable prefer-const */
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

import { IOpcoesValidacao } from '../IOpcoesEditorArticulacaoController';
import ProblemaValidacao from './ProblemaValidacao';
import Validador from './Validador';
import ValidadorCaixaAlta from './ValidadorCaixaAlta';
import ValidadorCitacao from './ValidadorCitacao';
import ValidadorEnumeracaoElementos from './ValidadorEnumeracaoElementos';
import ValidadorIniciarLetraMaiuscula from './ValidadorIniciarLetraMaiuscula';
import ValidadorPontuacaoArtigoParagrafo from './ValidadorPontuacaoArtigoParagrafo';
import ValidadorPontuacaoEnumeracao from './ValidadorPontuacaoEnumeracao';
import ValidadorSentencaUnica from './ValidadorSentencaUnica';

interface IValidador {
    validador: Validador;
    opcao: keyof IOpcoesValidacao;
}

/**
 * Controler para realizar validação nos dispositivos.
 */
export default class ValidacaoController {

    private validadores: IValidador[];

    constructor(habilitado: boolean);
    constructor(opcoes: IOpcoesValidacao);
    constructor(opcoes: IOpcoesValidacao | boolean) {
        this.validadores = [];

        if (opcoes !== false) {
            this.habilitar(opcoes, 'caixaAlta', new ValidadorCaixaAlta());
            this.habilitar(opcoes, 'citacao', new ValidadorCitacao());
            this.habilitar(opcoes, 'enumeracaoElementos', new ValidadorEnumeracaoElementos());
            this.habilitar(opcoes, 'inicialMaiuscula', new ValidadorIniciarLetraMaiuscula());
            this.habilitar(opcoes, 'pontuacao', new ValidadorPontuacaoArtigoParagrafo());
            this.habilitar(opcoes, 'pontuacaoEnumeracao', new ValidadorPontuacaoEnumeracao());
            this.habilitar(opcoes, 'sentencaUnica', new ValidadorSentencaUnica());
        }
    }

    /**
     * Realiza a validação do dispositivo.
     * 
     * @param {Element} dispositivo Dispositivo a ser validado.
     * @returns {ProblemaValidacao[]} Problemas encontrados.
     */
    validar(dispositivo: Element): ProblemaValidacao[] {
        if (!dispositivo) {
            return [];
        }

        let problemas: ProblemaValidacao[] = [];

        if (dispositivo.textContent.trim().length > 0) {
            this.validadores.forEach(item => {
                let validador = item.validador;
                let opcao = item.opcao;

                if (validador.aplicaSeA(dispositivo) && !validador.validar(dispositivo)) {
                    problemas.push(new ProblemaValidacao(dispositivo, opcao, validador.descricao));
                }
            });

            if (problemas.length > 0) {
                dispositivo.setAttribute('data-invalido', problemas.reduce<string>((prev, problema) => prev ? prev + ' ' + problema.descricao : problema.descricao, null));
            } else {
                dispositivo.removeAttribute('data-invalido');
            }
        }

        return problemas;
    }


    /**
     * Habilita um validador.
     * 
     * @param {Object} opcoes Conjunto de opções fornecidas para o controller de validação.
     * @param {String} nomeOpcao Nome da opção para habilitar um validador.
     * @param {Class} Validador Classe do validador.
     */
    private habilitar(opcoes: IOpcoesValidacao | boolean, nomeOpcao: keyof IOpcoesValidacao,validador: Validador) {
        this.validadores.push({ validador: validador, opcao: nomeOpcao });
    }

}
