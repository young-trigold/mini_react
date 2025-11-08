import { miniReact } from './index.ts';
import { UseState, UseStateHook } from './type.ts';

/**
 * hooks 实现模块
 *
 * 本文件提供简化版 React Hooks 的实现：`useState`、`useEffect`、`useRef`、`useReducer`。
 * 所有注释均为简体中文，函数行为尽量模拟 React 的常见用法，但为简化实现，某些细节（如调度优先级、批量更新等）未完全实现。
 */

/**
 * useState
 *
 * 说明：在函数组件内部按调用顺序维护一组 state hook（保存在当前 fiber 上）。
 * 每次渲染时，会从上一次的 hook 中读取旧状态，并应用挂起的 actions，生成新的 state。
 *
 * 参数：
 * - `initialState`：第一次渲染时的初始状态值。
 *
 * 返回值：
 * - `[state, setState]`：当前状态和用于更新状态的函数。调用 `setState` 会将 action 推入 hook 的 actions 列表并触发一次根节点的重新调和。
 */
export const useState: UseState = <State>(initialState: State) => {
    const { workInProgressFiber } = miniReact;
    const oldHook: UseStateHook<State> | undefined =
        workInProgressFiber?.alternate?.useStateHooks?.[workInProgressFiber!.useStateHookIndex!];
    const oldState = oldHook ? oldHook.state : initialState;
    let newState = oldState;
    oldHook?.actions?.forEach((action) => {
        newState = action instanceof Function ? action(newState) : action;
    });
    const newHook: UseStateHook<State> = {
        state: newState,
        actions: [],
    };
    const setState = (action: (previousState: State) => State) => {
        newHook.actions.push(action);
        miniReact.workInProgressRoot = {
            type: 'div',
            dom: miniReact.lastCommittedRoot?.dom,
            props: miniReact.lastCommittedRoot?.props,
            alternate: miniReact.lastCommittedRoot,
        };
        miniReact.deletedFibers = [];
        miniReact.nextUnitOfWork = miniReact.workInProgressRoot;
    };
    miniReact.workInProgressFiber?.useStateHooks?.push?.(newHook);
    miniReact.workInProgressFiber!.useStateHookIndex!++;
    return [newHook.state, setState];
};

import { UseEffect, UseEffectHook, UseRef, UseRefHook, UseReducer } from './type.ts';

/**
 * useEffect
 *
 * 说明：记录传入的 effect 回调和依赖数组（deps）。在本实现中，effect 不会在渲染阶段执行，
 * 而是在 commit 完成后统一由 `runEffects` 调用；如果上一次的 effect 返回了 cleanup，则在下一次执行前调用。
 *
 * 参数：
 * - `effect`：副作用函数，可能返回一个 cleanup 函数。
 * - `deps`：可选依赖数组；当 deps 为 `null` 或 `undefined` 时表示每次都执行；否则按浅比较判断是否需要重新执行。
 */
export const useEffect: UseEffect = (effect, deps) => {
    const { workInProgressFiber } = miniReact;
    // 获取上一次对应 hook（来自 alternate）
    const oldHook: UseEffectHook | undefined =
        workInProgressFiber?.alternate?.useEffectHooks?.[workInProgressFiber!.useEffectHookIndex!];
    const newHook: UseEffectHook = {
        deps: deps ?? null,
        cleanup: undefined,
        effect,
    };
    // 将新的 effect hook 推入当前正在构建的 fiber
    miniReact.workInProgressFiber?.useEffectHooks?.push?.(newHook);
    // 增加索引
    miniReact.workInProgressFiber!.useEffectHookIndex!++;
};

/**
 * useRef
 *
 * 说明：返回一个稳定的可变引用对象 `{ current }`，跨渲染保持同一对象引用。
 * 如果在上一次渲染中已经存在对应的 ref，则复用该对象。
 *
 * 参数：
 * - `initial`：ref 的初始值（只在第一次挂载时使用）。
 */
export const useRef: UseRef = <T>(initial: T) => {
    const { workInProgressFiber } = miniReact;
    const oldRef = workInProgressFiber?.alternate?.useRefHooks?.[workInProgressFiber!.useRefHookIndex!] as
        | UseRefHook<T>
        | undefined;
    if (oldRef) {
        // 如果上一次存在 ref，则复用
        miniReact.workInProgressFiber?.useRefHooks?.push?.(oldRef);
        miniReact.workInProgressFiber!.useRefHookIndex!++;
        return oldRef as UseRefHook<T>;
    }
    const newRef: UseRefHook<T> = { current: initial };
    miniReact.workInProgressFiber?.useRefHooks?.push?.(newRef);
    miniReact.workInProgressFiber!.useRefHookIndex!++;
    return newRef;
};

/**
 * useReducer（简化版）
 *
 * 说明：本实现为了简洁直接基于 `useState` 实现 reducer 行为：
 * - `dispatch` 调用会把 action 交给 reducer 计算新的状态，并使用 `setState` 更新。
 *
 * 参数：
 * - `reducer`：(state, action) => newState。
 * - `initialState`：初始状态。
 *
 * 返回值：
 * - `[state, dispatch]`。
 */
export const useReducer: UseReducer = <State, Action>(reducer: (s: State, a: Action) => State, initialState: State) => {
    // 使用 useState 简化实现：把 reducer 包装进 dispatch
    const [state, setState] = useState<State>(initialState);
    const dispatch = (action: Action) => setState((prev) => reducer(prev as State, action));
    return [state as State, dispatch];
};
