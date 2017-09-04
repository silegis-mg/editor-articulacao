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

 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

/* Cria uma função global, chamada silegismgEditorArticulacao,
 * que permite transformar um DIV em um editor de articulação.
 * A função cria e retorna uma nova instância de EditorArticulacaoController.
 */
import EditorArticulacaoController from '../src/EditorArticulacaoController';
import interpretadorArticulacao from '../src/interpretadorArticulacao';

angular.module('silegismg-editor-articulacao', [])
    .directive('silegismgEditorArticulacaoConteudo', editorArticulacaoConteudoDirective)
    .service('silegismgInterpretadorArticulacaoService', interpretadorArticulacaoService);

function editorArticulacaoConteudoDirective() {
    return {
        restrict: 'EAC',
        require: 'ngModel',
        scope: {
            opcoes: '<?'
        },
        link: function(scope, element, attrs, ngModel) {
            ngModel.$render = () => {
                scope.ctrl.lexml = ngModel.$viewValue;
            };

            element[0].addEventListener('change', () => {
                try {
                    ngModel.$setViewValue(scope.ctrl.lexml.outerHTML, 'change');
                    ngModel.$setValidity('lexml', true);
                } catch (e) {
                    ngModel.$setValidity('lexml', false);
                    throw e;
                }
            });

            scope.$on('$destroy', () => scope.ctrl.desregistrar());
        },
        controller: ['$element', '$scope', ($element, $scope) => new EditorArticulacaoController($element[0], $scope.opcoes)],
        controllerAs: 'ctrl'
    };
}

function interpretadorArticulacaoService() {
    return interpretadorArticulacao;
}