import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { getConfig } from '../config/index.js';

const devConfiguration = getConfig('development');
// 创建webpack compiler 对象
// 向 webpack 函数传入 webpack 配置
const compiler = webpack(devConfiguration);
const devServer = new WebpackDevServer(devConfiguration.devServer, compiler);
devServer
    .start()
    .then((value) => {
        console.log(value);
    })
    .catch((reason) => {
        console.error(reason);
    });
