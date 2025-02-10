import webpack from 'webpack';
import { getConfig } from '../config/index.js';
// 创建webpack compiler 对象
// 向 webpack 函数传入 webpack 配置
var compiler = webpack(getConfig('production'));
compiler.run(function (error, status) {
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
        var compilingErrors = status.toJson().errors;
        compilingErrors === null || compilingErrors === void 0 ? void 0 : compilingErrors.forEach(function (compilingError, index) {
            console.error("\u7B2C ".concat(index + 1, " \u4E2A\u9519\u8BEF\uFF1A"));
            console.error(compilingError);
        });
    }
});
