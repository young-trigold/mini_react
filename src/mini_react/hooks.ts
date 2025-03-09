import { miniReact } from './index.ts';
import { UseState, UseStateHook } from './type.ts';

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
