import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { getConfig } from '../config/index.js';
var devConfiguration = getConfig('development');
// 创建webpack compiler 对象
// 向 webpack 函数传入 webpack 配置
var compiler = webpack(devConfiguration);
var devServer = new WebpackDevServer(devConfiguration.devServer, compiler);
devServer
    .start()
    .then(function (value) {
    console.log(value);
})
    .catch(function (reason) {
    console.error(reason);
});
