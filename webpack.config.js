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

const webpack = require('webpack');

module.exports = function (empacotamento, debug, polyfill) {
    var entry = './empacotamento/' + empacotamento + '.js';
    var sufixo = polyfill ? empacotamento + '-polyfill' : empacotamento;

    return {
        entry: polyfill ? ['babel-polyfill', entry] : entry,
        output: {
            path: __dirname + '/build',
            filename: 'silegismg-editor-articulacao-' + sufixo + '.js'
        },
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    use: {
                        loader: 'css-loader',
                        options: {
                            minimize: true,
                            sourceMap: true
                        }
                    }
                },
                {
                    test: /\.html$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                            removeComments: true,
                        }
                    }
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [['env', {
                                targets: {
                                    browsers: ['last 2 versions', 'firefox >= 52', 'ie >= 11']
                                }
                            }]],
                            plugins: [["babel-plugin-transform-builtin-extend", {
                                globals: ["CustomEvent"]
                            }]]
                        }
                    }
                }
            ]
        },
        devtool: 'source-map',
        plugins: debug ? [] : [
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                uglifyOptions: {
                    keep_classnames: true
                }
            })
        ]
    };
};
