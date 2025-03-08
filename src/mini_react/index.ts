/**
 * 下一个 fiber 工作节点
 */
let nextUnitOfWork: Fiber | null | undefined = null;

/**
 * 上一次提交到真实 DOM 的 fiber 树的根引用
 */
let lastCommittedRoot: Fiber | null | undefined = null;

/**
 * 正在构建的 fiber 树的根引用
 */
let workInProgressRoot: Fiber | null | undefined = null;

/**
 * 正在构建的 fiber 节点
 */
let workInProgressFiber: Fiber | null = null;

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
        commit();
    }
    window.requestIdleCallback(workLoop);
};

window.requestIdleCallback(workLoop);

/**
 * 构建当前的 fiber 的节点，并返回下一个工作节点
 * @param fiber fiber 树节点
 * @returns 下一个 fiber 树工作节点
 */
function performUnitOfWork(fiber: Fiber) {
    buildFiberTree(fiber);
    return getNextFiberNode(fiber);
}

/**
 * 构建 fiber 子节点
 */
function buildFiberTree(fiber: Fiber) {
    workInProgressFiber = fiber;
    /**
     * 是函数组件
     */
    const isFunctionComponent = fiber.type instanceof Function;
    if (!isFunctionComponent && !fiber.dom) fiber.dom = createDOM(fiber);

    const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber?.props?.children;
    let preChildFiber: Fiber | null = null;
    children?.forEach((child, childIndex) => {
        /**
         * 是原始文本
         */
        const isTextContent = !(child instanceof Object);
        const childFiber: Fiber = {
            type: isTextContent ? 'TEXT' : child.type,
            props: isTextContent ? { children: [] } : child.props,
            parent: fiber,
            dom: null,
            textContent: child as unknown as string,
            useStateHooks: [],
            alternate: null,
        };
        if (childIndex === 0) fiber.child = childFiber;
        else preChildFiber!.sibling = childFiber;
        preChildFiber = childFiber;
    });
}

/**
 * 选择下一个 fiber 工作节点
 */
function getNextFiberNode(fiber: Fiber) {
    if (fiber.child) return fiber.child;
    let nextFiber: Fiber | undefined = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

/**
 * 提交 fiber root 上的所有离屏 DOM 到真实 DOM
 */
function commit() {
    commitFiber(workInProgressRoot!.child);
    lastCommittedRoot = workInProgressRoot;
    workInProgressRoot = null;
}

function commitFiber(fiber: Fiber | null | undefined) {
    if (!fiber) return;
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    const parentDOM = domParentFiber.dom;
    if (!parentDOM) return;
    if (fiber.dom) parentDOM.appendChild(fiber.dom);

    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseStateHook<State = any> {
    state: State;
    actions: ((previousState: State) => State)[];
}

interface UseState {
    <State>(initialState: State): [State, (action: (previousState: State) => State) => void];
    index?: number;
}

export const useState: UseState = <State>(initialState: State) => {
    if (!useState.index) useState.index = 0;
    const oldHook = workInProgressFiber?.useStateHooks?.[useState.index];
    const hook: UseStateHook<State> = {
        state: oldHook ? oldHook.state : initialState,
        actions: [],
    };
    const setState = (action: (previousState: State) => State) => {
        hook.actions.push(action);
        workInProgressRoot = {
            type: workInProgressFiber!.type,
            dom: lastCommittedRoot?.dom,
            props: lastCommittedRoot?.props,
            alternate: lastCommittedRoot,
        };
        nextUnitOfWork = workInProgressFiber;
    };
    workInProgressFiber?.useStateHooks?.push?.(hook);
    useState.index++;
    return [hook.state, setState];
};

export function createRoot(element: Fiber): { root: Fiber; render: (container: HTMLElement) => void } {
    const root: Fiber = {
        type: 'div',
        dom: null,
        props: {
            children: [element],
        },
    };
    return {
        root,
        render(container) {
            root.dom = container;
            workInProgressRoot = root;
            nextUnitOfWork = workInProgressRoot;
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

/**
 * 根据传入fiber 树节点创建对应的 DOM
 * @param fiber fiber 树节点
 * @returns fiber 树节点对应的真实 DOM
 */
function createDOM(fiber: Fiber) {
    const dom =
        fiber.type == 'TEXT'
            ? document.createTextNode(fiber.textContent ?? '')
            : document.createElement(fiber.type as keyof HTMLElementTagNameMap);
    const isProperty = (key: string) => key !== 'children';
    if (!fiber.props) return;

    Object.entries(fiber.props)
        .filter(([key]) => isProperty(key))
        .forEach(([key, value]) => {
            if (key === 'style') {
                const styleAsString = Object.entries(value as object)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(';');
                dom[key] = styleAsString;
            } else dom[key] = value;
        });
    return dom;
}

/**
 * Fiber 树节点类型
 */
interface Fiber {
    /**
     * fiber 类型
     * 如果是一个函数，则为函数组件
     * 否则是一个 html 元素标签
     */
    readonly type: 'TEXT' | keyof HTMLElementTagNameMap | ((props: Fiber['props']) => Fiber);
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
    /**
     * use state hook
     */
    useStateHooks?: UseStateHook[];
    /**
     * 可复用的 fiber
     */
    alternate?: Fiber | null;
}
