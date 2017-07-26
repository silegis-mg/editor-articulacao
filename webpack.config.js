const webpack = require('webpack');

module.exports = function (empacotamento, debug) {
    return {
        entry: './empacotamento/' + empacotamento + '.js',
        output: {
            path: __dirname + '/build',
            filename: 'silegismg-editor-articulacao-' + empacotamento + '.js'
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
                sourceMap: true
            })
        ]
    };
};