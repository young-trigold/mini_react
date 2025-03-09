import { miniReact } from './index.ts';
import { Fiber } from './type.ts';

const isProperty = (key: string) => key !== 'children';
const isEvent = (key: string) => key.startsWith('on');

/**
 * 根据传入fiber 树节点创建对应的 DOM
 * @param fiber fiber 树节点
 * @returns fiber 树节点对应的真实 DOM
 */
export function createDOM(fiber: Fiber) {
    const dom =
        fiber.type == 'TEXT'
            ? document.createTextNode(fiber.textContent ?? '')
            : document.createElement(fiber.type as keyof HTMLElementTagNameMap);
    updateDom(dom, undefined, fiber.props);
    return dom;
}

const isNew =
    (prev: Fiber['props'] = { children: [] }, next: Fiber['props'] = { children: [] }) =>
    (key: string) =>
        prev[key] !== next[key];
const isGone =
    (_, next: Fiber['props'] = { children: [] }) =>
    (key: string) =>
        !(key in next);

export function updateDom(
    dom: HTMLElement | Text,
    prevProps: Fiber['props'] = { children: [] },
    nextProps: Fiber['props'] = { children: [] },
) {
    // 移除所有旧的事件监听器
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name] as EventListenerOrEventListenerObject);
        });
    // 添加事件监听器
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name] as EventListenerOrEventListenerObject);
        });
    // 移除所有旧的属性
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = '';
        });
    // 设置所有属性
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = nextProps[name];
        });
}

/**
 * 创建一个 fiber 根用来渲染
 * @param element 虚拟 DOM
 * @returns 渲染函数
 */
export function createRoot(element: Fiber): { root: Fiber; render: (container: HTMLElement) => void } {
    const root: Fiber = {
        type: 'div',
        dom: null,
        props: {
            children: [element],
        },
        alternate: miniReact.lastCommittedRoot,
    };
    return {
        root,
        render(container) {
            miniReact.deletedFibers = [];
            root.dom = container;
            miniReact.workInProgressRoot = root;
            miniReact.nextUnitOfWork = miniReact.workInProgressRoot;
        },
    };
}

/**
 * 创建虚拟 DOM 元素
 * @param type 标签
 * @param props 属性
 * @param children 后代元素
 * @returns 虚拟 DOM 元素
 */
export function createElement(type: Fiber['type'], props: Record<string, unknown> | null, ...children: Fiber[]) {
    return {
        type,
        props: {
            ...(props ?? {}),
            children: children.flat(),
        },
    };
}
