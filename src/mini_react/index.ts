/**
 * 下一个 fiber 工作节点
 */
let nextUnitOfWork: Fiber | null | undefined = null;

/**
 * 正在构建的 fiber 树的根引用
 */
let workInProgressRoot: Fiber | null | undefined = null;

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
        console.log('workInProgressRoot', workInProgressRoot);
        commitRoot();
    }
    window.requestIdleCallback(workLoop);
};

window.requestIdleCallback(workLoop);

/**
 * Fiber 树节点类型
 */
interface Fiber {
    /**
     * 标签类型
     */
    type: 'TEXT' | keyof HTMLElementTagNameMap;
    /**
     * 属性
     */
    props?: {
        /**
         * 后代虚拟DOM元素
         */
        children: Fiber[];
    } & Record<string, unknown>;
    /**
     * 对应的真实 DOM
     */
    dom?: HTMLElement | Text | null;
    /**
     * 直接子节点
     */
    child?: Fiber;
    /**
     * 直接父节点
     */
    parent?: Fiber;
    /**
     * 直接兄弟节点
     */
    sibling?: Fiber;
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
export const createElement = (type: Fiber['type'], props: Record<string, unknown> | null, ...children: Fiber[]) => {
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
 * @param fiber fiber 树节点
 * @returns fiber 树节点对应的真实 DOM
 */
const createDOM = (fiber: Fiber) => {
    const dom =
        fiber.type == 'TEXT' ? document.createTextNode(fiber.textContent ?? '') : document.createElement(fiber.type);
    const isProperty = (key: string) => key !== 'children';
    if (!fiber.props) return;

    Object.entries(fiber.props)
        .filter(([key]) => isProperty(key))
        .forEach(([key, value]) => {
            if (key === 'style') {
                const styleAsString = Object.entries(value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(';');
                dom[key] = styleAsString;
            } else dom[key] = value;
        });
    return dom;
};

// 构建 fiber 子节点
const beginWork = (fiber: Fiber) => {
    if (!fiber.dom) fiber.dom = createDOM(fiber);
    let preChildFiber: Fiber | null = null;
    for (let i = 0; i < fiber.props.children.length; i++) {
        const child = fiber.props.children[i];
        const childFiber: Fiber = { type: child.type, parent: fiber, dom: null };
        if (child instanceof Object) {
            childFiber.type = child.type;
            childFiber.props = child.props;
        } else {
            childFiber.type = 'TEXT';
            childFiber.props = { children: [] };
            childFiber.textContent = child;
        }
        if (i === 0) fiber.child = childFiber;
        else preChildFiber!.sibling = childFiber;
        preChildFiber = childFiber;
    }
};

const completeWork = (fiber: Fiber) => {
    // 选择下一个 fiber 工作节点
    if (fiber.child) return fiber.child;
    let nextFiber: Fiber | undefined = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
};

/**
 * 构建当前的 fiber 的节点，并返回下一个工作节点
 * @param fiber fiber 树节点
 * @returns 下一个 fiber 树工作节点
 */
function performUnitOfWork(fiber: Fiber) {
    beginWork(fiber);
    return completeWork(fiber);
}

const commitWork = (fiber: Fiber | null | undefined) => {
    if (!fiber) return;
    if (!fiber.parent) return;
    const domParent = fiber.parent.dom;
    if (!domParent) return;
    if (fiber.dom) {
        // if (fiber.dom instanceof HTMLElement) fiber.dom.style.outline = '2px solid green';
        domParent.appendChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
    // setTimeout(() => commitWork(fiber.child), 100);
    // setTimeout(() => commitWork(fiber.sibling), 100);
};

function commitRoot() {
    commitWork(workInProgressRoot?.child);
    workInProgressRoot = null;
}

/**
 * 将虚拟 DOM 转为真实 DOM 并挂载到容器内
 * @param element 虚拟 DOM
 * @param container 真实 DOM 容器
 */
export const render = (element: Fiber, container: HTMLElement) => {
    workInProgressRoot = {
        type: 'div',
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = workInProgressRoot;
};
