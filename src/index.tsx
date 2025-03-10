/* eslint-disable @typescript-eslint/no-unused-vars */
import { App } from './App/index.tsx';
import { createRoot, createElement } from './mini_react/react-dom.ts';
/** @jsx createElement */

const vDOM = <App />;
console.log('<App/>：', vDOM);

const root = createRoot(vDOM);
console.log('正在构建的 fiber 树：', root.root);

const rootContainer = document.getElementById('app');
if (rootContainer) root.render(rootContainer);
else alert("document.getElementById('app') 为 null");
