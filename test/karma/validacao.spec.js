describe('Validação', function() {
    'use strict';
    
    var ctrl = new window.ValidacaoController({});

    function criarDispositivo(tipo, texto) {
        var dispositivo = document.createElement('p');

        dispositivo.setAttribute('data-tipo', tipo);
        dispositivo.textContent = texto;

        return dispositivo;
    }

    function testar(tipo, texto/*, ...erros*/) {
        var dispositivo = criarDispositivo(tipo, texto);
        var validacao = ctrl.validar(dispositivo);
        var erros = [];
        
        Array.prototype.push.apply(erros, arguments);

        erros.splice(0, 2);

        expect(validacao.length).toBe(erros.length);

        for (let i = 0; i < validacao.length; i++) {
            expect(validacao[i].tipo).toBe(erros[i]);
        }
    }

    describe('Validador de sentença única', function() {
        it ('Único período deve ser válido.', function() {
            testar('artigo', 'Esta é uma sentença única.')
        });

        it ('Abreviação deve ser válida.', function() {
            testar('artigo', 'Esta é um teste de citação do art. 5º da constituição.')
        });

        it ('Dois períodos devem ser inválidos.', function() {
            testar('artigo', 'Este é um teste. Este é outro.', 'sentencaUnica');
        });

        it ('Dois períodos com abreviação no primeiro deve tornar artigo inválido.', function() {
            testar('artigo', 'Este é um teste de citação do art. 5º da constituição. Este é outro.', 'sentencaUnica');
        });
    });
});