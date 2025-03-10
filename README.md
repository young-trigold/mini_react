# 从 0 到 1 实现一个 mini 版的 react

## 实现内容：（全部使用 typescript）

- createElement
- createRoot/render
- fiber 架构
- reconcile
- 函数组件和 useState

## 最终效果

- 渲染

<img width="1511" alt="image" src="https://github.com/user-attachments/assets/7a30085d-5439-4ff3-9ac9-3c2dc4a72122" />

- 构建的fiber树

<img width="712" alt="image" src="https://github.com/user-attachments/assets/2ccbe513-2725-489b-b0c5-1dc4f78febac" />


- 新增

<img width="1511" alt="image" src="https://github.com/user-attachments/assets/728f3287-3d8d-435c-9d9e-21cb181f45a3" />

<img width="1506" alt="image" src="https://github.com/user-attachments/assets/f9e6ce91-be2b-494c-ad70-2d6da2f3851b" />


- 删除

<img width="1489" alt="image" src="https://github.com/user-attachments/assets/2d589453-b1bd-4a1a-98e8-3972de6564f5" />


- 更新

<img width="1496" alt="image" src="https://github.com/user-attachments/assets/aaf78b79-0adf-4dd5-bb21-4de194e2e25c" />

<img width="1500" alt="image" src="https://github.com/user-attachments/assets/61192438-9202-406c-98ab-c769d9a91e96" />

<img width="1501" alt="image" src="https://github.com/user-attachments/assets/4230783a-366f-4ea3-8b03-da98ea362aad" />


# JSX，createElement 和虚拟 DOM

## JSX 转编译

```tsx
// webpack 配置
{
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        bugfixes: true,
                        targets: {
                            chrome: '58',
                            ie: '11',
                        },
                        useBuiltIns: 'usage',
                        corejs: { version: '3.38.0', proposals: true },
                    },
                ],
                ['@babel/preset-react'],
                '@babel/preset-typescript',
            ],
        },
    },
}

// 使用 pragma 
import { createElement } from '../mini_react/react-dom.ts';
/** @jsx createElement */
```

## createElement 实现

```ts
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
```

## createRoot/ render 函数实现

```tsx
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
```

# 时间分片: workloop

```ts
export interface MiniReact {
    /**
     * 下一个 fiber 工作节点
     */
    nextUnitOfWork: Fiber | null | undefined;
    /**
     * 上一次提交到真实 DOM 的 fiber 树的根引用
     */
    lastCommittedRoot: Fiber | null | undefined;
    /**
     * 正在构建的 fiber 树的根引用
     */
    workInProgressRoot: Fiber | null | undefined;
    /**
     * 正在构建的 fiber 节点
     */
    workInProgressFiber: Fiber | null | undefined;
    /**
     * 需要删除的 fiber 节点
     */
    deletedFibers: Fiber[];
}

export const miniReact: MiniReact = {
    nextUnitOfWork: null,
    lastCommittedRoot: null,
    workInProgressRoot: null,
    workInProgressFiber: null,
    deletedFibers: [],
};

/**
 * react 工作循环
 */
const workLoop: IdleRequestCallback = (deadline) => {
    let shouldYield = false;
    while (miniReact.nextUnitOfWork && !shouldYield) {
        miniReact.nextUnitOfWork = performUnitOfWork(miniReact.nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 5;
    }
    if (!miniReact.nextUnitOfWork && miniReact.workInProgressRoot) {
        commit();
    }
    window.requestIdleCallback(workLoop);
};

window.requestIdleCallback(workLoop);
```

# 时间分片: fiber

## 构建fiber阶段

```ts
/**
 * Fiber 树节点类型
 */
export interface Fiber {
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
    /**
     * 当前 fiber 的来源类型
     */
    tag?: 'UPDATE' | 'ADD' | 'DELETE';
}

/**
 * 构建当前的 fiber 的节点，并返回下一个工作节点
 * @param fiber fiber 树节点
 * @returns 下一个 fiber 树工作节点
 */
function performUnitOfWork(fiber: Fiber) {
    /**
     * 函数组件类型的 fiber
     */
    if (fiber.type instanceof Function) buildFunctionComponentFibers(fiber);
    else buildHostComponentFibers(fiber);
    return getNextFiberNode(fiber);
}

/**
 * 更新
 * @param fiber fiber 节点
 */
function buildFunctionComponentFibers(fiber: Fiber) {
    miniReact.workInProgressFiber = fiber;
    fiber.useStateHookIndex = 0;
    miniReact.workInProgressFiber.useStateHooks = [];
    const children = [(fiber.type as (props: Fiber['props']) => Fiber)(fiber.props)];
    reconcileChildren(fiber, children);
}

function buildHostComponentFibers(fiber: Fiber) {
    if (!fiber.dom) fiber.dom = createDOM(fiber);
    reconcileChildren(fiber, fiber?.props?.children ?? []);
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
```

## commit 阶段

```ts
/**
 * 提交 fiber root 上的所有离屏 DOM 到真实 DOM
 */
function commit() {
    miniReact.deletedFibers.forEach(commitFiber);
    commitFiber(miniReact.workInProgressRoot!.child);
    miniReact.lastCommittedRoot = miniReact.workInProgressRoot;
    miniReact.workInProgressRoot = null;
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
```

# reconcile：添加，删除和更新

```ts
/**
 * 协调 fiber 的新老直接子节点
 * @param fiber fiber 节点
 * @param children fiber 节点的直接子节点
 */
function reconcileChildren(fiber: Fiber, children: Fiber[]) {
    let preChildFiber: Fiber | null = null;
    let childIndex = 0;
    const { length } = children;
    let oldChild = fiber?.alternate?.child;
    while (childIndex < length || oldChild != null) {
        let newFiber: Fiber | null = null;
        const child = children[childIndex];
        /**
         * old child 和 现在的 child 是相同类型
         */
        const sameType = oldChild && child && child.type === oldChild.type;
        /**
         * child 是原始文本节点
         */
        const isTextContent = !(child instanceof Object);
        if (sameType) {
            // update
            newFiber = {
                type: oldChild!.type,
                props: child.props,
                dom: oldChild!.dom,
                parent: fiber,
                alternate: oldChild,
                textContent: isTextContent ? child : '',
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
                textContent: isTextContent ? child : '',
                tag: 'ADD',
            };
        }
        if (oldChild && !sameType) {
            // delete
            oldChild.tag = 'DELETE';
            miniReact.deletedFibers.push(oldChild);
        }

        if (childIndex === 0) fiber.child = newFiber!;
        else preChildFiber!.sibling = newFiber!;

        preChildFiber = newFiber;
        oldChild = oldChild?.sibling;
        childIndex++;
    }
}
```

# hooks：useState

```ts
/**
 * 状态钩子
 * @param initialState 初始状态
 */
export const useState: UseState = <State>(initialState: State) => {
    const oldHook: UseStateHook<State> | undefined =
        miniReact.workInProgressFiber?.alternate?.useStateHooks?.[miniReact.workInProgressFiber!.useStateHookIndex!];
    const hook: UseStateHook<State> = {
        state: oldHook ? oldHook.state : initialState,
        actions: [],
    };
    oldHook?.actions?.forEach((action) => {
        hook.state = action instanceof Function ? action(hook.state) : action;
    });
    const setState = (action: (previousState: State) => State) => {
        hook.actions.push(action);
        miniReact.workInProgressRoot = {
            type: 'div',
            dom: miniReact.lastCommittedRoot?.dom,
            props: miniReact.lastCommittedRoot?.props,
            alternate: miniReact.lastCommittedRoot,
        };
        miniReact.deletedFibers = [];
        miniReact.nextUnitOfWork = miniReact.workInProgressRoot;
    };
    miniReact.workInProgressFiber?.useStateHooks?.push?.(hook);
    miniReact.workInProgressFiber!.useStateHookIndex!++;
    return [hook.state, setState];
};
```
