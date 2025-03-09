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
export interface UseStateHook<State = any> {
    state: State;
    actions: SetStateAction<State>[];
}

export interface UseState {
    <State>(initialState: State): [State, (action: SetStateAction<State>) => void];
    index?: number;
}
