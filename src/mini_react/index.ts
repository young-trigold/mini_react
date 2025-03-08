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

let deletions: Fiber[] = [];

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
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) updateFunctionComponent(fiber);
    else updateHostComponent(fiber);
    return getNextFiberNode(fiber);
}

function updateFunctionComponent(fiber: Fiber) {
    workInProgressFiber = fiber;
    fiber.useStateHookIndex = 0;
    workInProgressFiber.useStateHooks = [];
    const children = [(fiber.type as (props: Fiber['props']) => Fiber)(fiber.props)];
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
    if (!fiber.dom) fiber.dom = createDOM(fiber);
    reconcileChildren(fiber, fiber?.props?.children ?? []);
}

function reconcileChildren(fiber: Fiber, children: Fiber[]) {
    let preChildFiber: Fiber | null = null;
    let childIndex = 0;
    const { length } = children;
    let oldFiber = fiber?.alternate?.child;
    while (childIndex < length || oldFiber != null) {
        let newFiber: Fiber | null = null;
        const child = children[childIndex];
        /**
         * 是原始文本
         */
        const isTextContent = !(child instanceof Object);
        const sameType = oldFiber && child && child.type == oldFiber.type;
        if (sameType) {
            // update
            newFiber = {
                type: oldFiber!.type,
                props: child.props,
                dom: oldFiber!.dom,
                parent: fiber,
                alternate: oldFiber,
                textContent: child as unknown as string,
                tag: 'UPDATE',
            };
        }
        if (child && !sameType) {
            // add
            newFiber = {
                type: isTextContent ? 'TEXT' : child.type,
                props: isTextContent ? { children: [] } : child.props,
                dom: null,
                parent: fiber,
                alternate: null,
                textContent: child as unknown as string,
                tag: 'ADD',
            };
        }
        if (oldFiber && !sameType) {
            // delete
            oldFiber.tag = 'DELETE';
            deletions.push(oldFiber);
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        if (childIndex === 0) fiber.child = newFiber!;
        else preChildFiber!.sibling = newFiber!;

        preChildFiber = newFiber;
        childIndex++;
    }
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
    deletions.forEach(commitFiber);
    commitFiber(workInProgressRoot!.child);
    lastCommittedRoot = workInProgressRoot;
    workInProgressRoot = null;
}

function commitFiber(fiber: Fiber | null | undefined) {
    if (!fiber) return;
    let domParentFiber = fiber.parent;
    while (!domParentFiber?.dom) {
        domParentFiber = domParentFiber?.parent;
    }
    const parentDOM = domParentFiber.dom;
    if (!parentDOM) return;

    if (fiber.tag === 'ADD' && fiber.dom != null) {
        parentDOM.appendChild(fiber.dom);
    } else if (fiber.tag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber?.alternate?.props, fiber.props);
    } else if (fiber.tag === 'DELETE' && fiber.dom != null) {
        commitDeletion(fiber, parentDOM);
    }
    commitFiber(fiber.child);
    commitFiber(fiber.sibling);
}

function commitDeletion(fiber: Fiber | null | undefined, parentDOM: HTMLElement | Text) {
    if (!fiber) return;
    if (fiber.dom) {
        parentDOM.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, parentDOM);
    }
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
    const oldHook = workInProgressFiber?.useStateHooks?.[workInProgressFiber!.useStateHookIndex!];
    const hook: UseStateHook<State> = {
        state: oldHook ? oldHook.state : initialState,
        actions: [],
    };
    oldHook?.actions?.forEach((action) => {
        hook.state = action(hook.state);
    });
    const setState = (action: (previousState: State) => State) => {
        hook.actions.push(action);
        workInProgressRoot = {
            type: 'div',
            dom: lastCommittedRoot?.dom,
            props: lastCommittedRoot?.props,
            alternate: lastCommittedRoot,
        };
        nextUnitOfWork = workInProgressRoot;
    };
    workInProgressFiber?.useStateHooks?.push?.(hook);
    workInProgressFiber!.useStateHookIndex!++;
    return [hook.state, setState];
};

export function createRoot(element: Fiber): { root: Fiber; render: (container: HTMLElement) => void } {
    const root: Fiber = {
        type: 'div',
        dom: null,
        props: {
            children: [element],
        },
        alternate: lastCommittedRoot,
    };
    return {
        root,
        render(container) {
            deletions = [];
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

const isProperty = (key: string) => key !== 'children';
const isEvent = (key: string) => key.startsWith('on');

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

function updateDom(
    dom: HTMLElement | Text,
    prevProps: Fiber['props'] = { children: [] },
    nextProps: Fiber['props'] = { children: [] },
) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name] as EventListenerOrEventListenerObject);
        });
    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = '';
        });
    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = nextProps[name];
        });
    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name] as EventListenerOrEventListenerObject);
        });
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
     * use state hook index
     */
    useStateHookIndex?: number;
    /**
     * 可复用的 fiber
     */
    alternate?: Fiber | null;
    tag?: 'UPDATE' | 'ADD' | 'DELETE';
}
