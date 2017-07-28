/* Cria uma função global, chamada silegismgEditorArticulacao,
 * que permite transformar um DIV em um editor de articulação.
 * A função cria e retorna uma nova instância de EditorArticulacaoController.
 */
import EditorArticulacaoController from '../src/EditorArticulacaoController';

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
            })
        },
        controller: ['$element', '$scope', ($element, $scope) => new EditorArticulacaoController($element[0], $scope.opcoes)],
        controllerAs: 'ctrl'
    }
}

angular.module('silegismg-editor-articulacao', []).directive('silegismgEditorArticulacaoConteudo', editorArticulacaoConteudoDirective)