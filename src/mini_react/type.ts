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
        * useState 钩子集合（用于保存函数组件中的状态钩子信息）
     */
    useStateHooks?: UseStateHook[];
    /**
        * 当前函数组件内部正在使用的 useState 钩子索引（用于按调用顺序读取/写入对应 hook）
     */
    useStateHookIndex?: number;
    /**
        * useEffect 钩子集合（保存 effect 回调、依赖和 cleanup）
     */
    useEffectHooks?: UseEffectHook[];
    /**
        * 当前函数组件内部正在使用的 useEffect 钩子索引（按调用顺序）
     */
    useEffectHookIndex?: number;
    /**
        * useRef 钩子集合（保存组件内创建的引用对象）
     */
    useRefHooks?: unknown[];
    /**
        * 当前函数组件内部正在使用的 useRef 钩子索引（按调用顺序）
     */
    useRefHookIndex?: number;
    /**
     * 可复用的 fiber
     */
    alternate?: Fiber | null;
    /**
     * 当前 fiber 的来源类型
     */
    tag?: 'UPDATE' | 'ADD' | 'DELETE';
}

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

export type SetStateAction<State> = State | ((previousState: State) => State);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * useState 钩子结构，用于在每次渲染间保存 state 和待处理的 actions
 */
export interface UseStateHook<State = any> {
    /** 当前状态值 */
    state: State;
    /** 累积的状态更新 action 列表（在下一次调和时会被消费） */
    actions: SetStateAction<State>[];
}

export interface UseEffectHook {
    /** 依赖数组；为 null 或 undefined 表示每次都执行 */
    deps?: unknown[] | null;
    /** 上一次 effect 返回的 cleanup 函数（若有），会在下一次执行前被调用 */
    cleanup?: (() => void) | void;
    /** effect 回调函数，可能返回 cleanup */
    effect?: () => void | (() => void) | void;
}

export interface UseRefHook<T = any> {
    current: T;
}

export interface UseReducerHook<State = any, Action = any> {
    state: State;
    actions: Action[];
}

/**
 * useState 接口类型定义：返回当前 state 和 更新函数 setState
 */
export interface UseState {
    <State>(initialState: State): [State, (action: SetStateAction<State>) => void];
    index?: number;
}

export interface UseEffect {
    /**
     * useEffect 接口：接受 effect 回调和可选依赖数组
     */
    (effect: () => void | (() => void) | void, deps?: unknown[] | null): void;
}

export interface UseRef {
    /** 返回一个可变的引用对象 `{ current }`，跨渲染保持引用不变 */
    <T = any>(initial: T): { current: T };
}

export interface UseReducer {
    /**
     * useReducer 接口：接受 reducer 和初始状态，返回当前 state 和 dispatch
     */
    <State, Action>(reducer: (s: State, a: Action) => State, initialState: State): [State, (a: Action) => void];
}
