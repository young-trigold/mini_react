import webpack from 'webpack';
import { getConfig } from '../config/index.js';

// 创建webpack compiler 对象
// 向 webpack 函数传入 webpack 配置
const compiler = webpack(getConfig('none'));

compiler.run((error, status) => {
    // 1. 配置错误
    console.log('1. 检测配置错误...');
    if (error) {
        console.error(error);
        return;
    }
    console.log('配置没有问题！');

    // 2. 编译错误
    console.log('2. 检测编译错误...');
    if (status) {
        if (!status.hasErrors()) {
            console.log('编译成功！');
            return;
        }
        const compilingErrors = status.toJson().errors;
        compilingErrors?.forEach((compilingError, index) => {
            console.error(`第 ${index + 1} 个错误：`);
            console.error(compilingError);
        });
    }
});
