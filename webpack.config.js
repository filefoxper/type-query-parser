const webpack = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const pathBuilder = require('path');

const libsPath = pathBuilder.resolve('src','libs', 'index.ts');

const entryPath = pathBuilder.resolve('src', 'index.ts');

const targetPath = pathBuilder.resolve('dist');

function entry() {
    return {
        mode: 'production',
        devtool: false,
        entry: {
            libs:libsPath,
            ['libs.min']: libsPath,
            ['type-query-parser']: entryPath,
            ['type-query-parser.min']: entryPath
        },
        output: {
            path: targetPath,
            filename: '[name].js',
            library: 'type-query-parser',
            libraryTarget: 'umd'
        },
        optimization: {
            noEmitOnErrors: true,
            minimize: true,
            minimizer: [
                new UglifyJsPlugin({
                    include: /\.min\.js$/,
                }),
            ],
            namedChunks: true
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json', 'txt']
        },
        module: {
            rules: [
                {
                    test: /\.js$|\.ts$|\.tsx$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                plugins: [
                                    ["@babel/plugin-transform-runtime"],
                                    ['@babel/plugin-proposal-export-namespace-from'],
                                    [
                                        '@babel/plugin-proposal-class-properties',
                                        {loose: true},
                                    ]
                                ],
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            modules: false,
                                            targets:{
                                                ie:"8"
                                            }
                                        }
                                    ],
                                ]
                            }
                        },
                        "ts-loader"
                    ]
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            })
        ]
    }
}

module.exports = function (env) {
    return entry();
};
