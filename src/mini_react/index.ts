/**
 * Fiber 树节点类型
 */
interface FiberNode {
    /**
     * 标签类型
     */
    type: 'TEXT_ELEMENT' | keyof HTMLElementTagNameMap;
    /**
     * 属性
     */
    props?: {
        /**
         * 后代虚拟DOM元素
         */
        children: FiberNode[];
    } & Record<string, unknown>;
    /**
     * 对应的真实 DOM
     */
    dom?: HTMLElement | Text | null;
    /**
     * 直接子节点
     */
    child?: FiberNode;
    /**
     * 直接父节点
     */
    parent?: FiberNode;
    /**
     * 直接兄弟节点
     */
    sibling?: FiberNode;
    /**
     * 若为文本节点，则存储文本内容
     */
    textContent?: string;
}

/**
 * 创建虚拟 DOM 元素
 * @param type 标签
 * @param props 属性
 * @param children 后代元素
 * @returns 虚拟 DOM 元素
 */
export const createElement = (
    type: FiberNode['type'],
    props: Record<string, unknown> | null,
    ...children: FiberNode[]
) => {
    return {
        type,
        props: {
            ...(props ?? {}),
            children: children.flat(),
        },
    };
};

/**
 * 根据传入fiber 树节点创建对应的 DOM
 * @param fiberNode fiber 树节点
 * @returns fiber 树节点对应的真实 DOM
 */
const createDOM = (fiberNode: FiberNode) => {
    const dom =
        fiberNode.type == 'TEXT_ELEMENT'
            ? document.createTextNode(fiberNode.textContent ?? '')
            : document.createElement(fiberNode.type);
    const isProperty = (key: string) => key !== 'children';
    if (!fiberNode.props) return;
    Object.keys(fiberNode.props)
        .filter(isProperty)
        .forEach((name) => {
            if (!fiberNode.props) return;
            dom[name] = fiberNode.props[name];
        });
    return dom;
};

/**
 * 构建当前的 fiber 的节点，并返回下一个工作节点
 * @param fiberNode fiber 树节点
 * @returns 下一个 fiber 树工作节点
 */
const performUnitOfWork = (fiberNode: FiberNode) => {
    if (!fiberNode.dom) fiberNode.dom = createDOM(fiberNode);
    let preChildFiber: FiberNode | null = null;
    for (let i = 0; i < fiberNode.props.children.length; i++) {
        const child = fiberNode.props.children[i];
        const childFiber: FiberNode = { type: child.type, parent: fiberNode, dom: null };
        if (child instanceof Object) {
            childFiber.type = child.type;
            childFiber.props = child.props;
        } else {
            childFiber.type = 'TEXT_ELEMENT';
            childFiber.props = { children: [] };
            childFiber.textContent = child;
        }
        if (i === 0) fiberNode.child = childFiber;
        else preChildFiber!.sibling = childFiber;
        preChildFiber = childFiber;
    }
    if (fiberNode.child) return fiberNode.child;
    let nextFiber: FiberNode | undefined = fiberNode;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
};

/**
 * 下一个 fiber 工作节点
 */
let nextUnitOfWork: FiberNode | null | undefined = null;

/**
 * 正在构建的fiber树的根引用
 */
let workInProgressRoot: FiberNode | null | undefined = null;

const commitWork = (fiber: FiberNode | null | undefined) => {
    if (!fiber) return;
    if (!fiber.parent) return;
    const domParent = fiber.parent.dom;
    if (!domParent) return;
    if (fiber.dom) domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
};

function commitRoot() {
    commitWork(workInProgressRoot?.child);
    workInProgressRoot = null;
}

/**
 * react 工作循环
 */
const workLoop: IdleRequestCallback = (deadline) => {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 5;
    }
    if (!nextUnitOfWork && workInProgressRoot) {
        console.log(workInProgressRoot);
        commitRoot();
    }
    window.requestIdleCallback(workLoop);
};

window.requestIdleCallback(workLoop);

/**
 * 将虚拟 DOM 转为真实 DOM 并挂载到容器内
 * @param element 虚拟 DOM
 * @param container 真实 DOM 容器
 */
export const render = (element: FiberNode, container: HTMLElement) => {
    workInProgressRoot = {
        type: 'div',
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = workInProgressRoot;
};
