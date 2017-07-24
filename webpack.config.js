module.exports = {
    entry: './src/plain-js.js',
    output: {
        path: __dirname + '/build',
        filename: 'silegismg-editor-articulacao.js'
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
    devtool: '#inline-source-map'
}

/*Object.defineProperty(module.exports, 'desenv', {
    value: function () {
        var copia = JSON.parse(JSON.stringify(this));
        copia.module.loaders.splice(1, 1);
        return copia;
    }
});*/