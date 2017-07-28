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
                    use: 'css-loader'
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2016', 'es2015'],
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
                keep_classnames: true
            })
        ]
    };
};