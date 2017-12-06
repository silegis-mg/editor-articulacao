# Hacks para navegadores

Qualquer código que seja exclusivamente para tratar um comportamento específico
de um determinado navegador deve ser externalizado, de forma a melhorar
a legibilidade do código e manutenibilidade, de forma a permitir a
validação dos hacks em versões novas dos navegadores. Tais códigos devem
ser separados por navegador, de forma a agrupar qualquer intervenção
específica para um navegador.

# Polyfill

Polyfill deve também ser implementado à parte, no arquivo `polyfill.js`.