import path from 'path';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
export var getConfig = function (mode) {
    return {
        mode: mode,
        entry: {
            index: path.resolve('src', 'index.tsx'),
        },
        output: {
            clean: true,
            environment: {
                arrowFunction: false,
                asyncFunction: false,
                bigIntLiteral: false,
                const: false,
                destructuring: false,
                document: true,
                dynamicImport: false,
                dynamicImportInWorker: false,
                forOf: false,
                globalThis: false,
                module: false,
                nodePrefixForCoreModules: false,
                optionalChaining: false,
                templateLiteral: false,
            },
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        bugfixes: true,
                                        targets: {
                                            chrome: '58',
                                            ie: '11',
                                        },
                                        useBuiltIns: 'usage',
                                        corejs: { version: '3.38.0', proposals: true },
                                    },
                                ],
                                ['@babel/preset-react'],
                                '@babel/preset-typescript',
                            ],
                        },
                    },
                },
                {
                    test: /\.(sa|sc|c)ss$/i,
                    use: [
                        {
                            loader: mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
                            options: {},
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    auto: true,
                                    localIdentName: '[name]_[local]_[hash:base64:5]',
                                    namedExport: false,
                                },
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        [
                                            'postcss-preset-env',
                                            {
                                            // Options
                                            },
                                        ],
                                    ],
                                },
                            },
                        },
                        'sass-loader',
                    ],
                },
            ],
        },
        plugins: [
            new HTMLWebpackPlugin({
                template: path.resolve('src', 'index.html'),
            }),
            new MiniCssExtractPlugin(),
        ],
        devServer: {
            open: true,
            compress: true,
        },
        devtool: mode === 'development' ? 'eval-cheap-module-source-map' : 'cheap-module-source-map',
    };
};
