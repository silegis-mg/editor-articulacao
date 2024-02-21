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
const path = require('path');

module.exports = ['plain-js', 'angular1', 'playwright'].map(empacotamento => {
    var entry = './empacotamento/' + empacotamento + '.js';
    var sufixo = empacotamento;

    return {
        entry: entry,
        name: empacotamento,
        output: {
            path: __dirname + '/build',
            filename: 'silegismg-editor-articulacao-' + sufixo + '.js'
        },
        mode: 'production',
        devServer: {
            static: {
                directory: path.join(__dirname, 'tests')
            },
            port: 9000
        },
        module: {
            rules: [
                {
                    test: /tests?/,
                    use: 'ignore-loader'
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader'
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        devtool: 'source-map'
    };
});
