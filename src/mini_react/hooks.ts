import { miniReact } from './index.ts';
import { UseState, UseStateHook } from './type.ts';

/**
 * 状态钩子
 * @param initialState 初始状态
 */
export const useState: UseState = <State>(initialState: State) => {
    const oldHook: UseStateHook<State> | undefined =
        miniReact.workInProgressFiber?.alternate?.useStateHooks?.[miniReact.workInProgressFiber!.useStateHookIndex!];
    const newHook: UseStateHook<State> = {
        state: oldHook ? oldHook.state : initialState,
        actions: [],
    };
    oldHook?.actions?.forEach((action) => {
        newHook.state = action instanceof Function ? action(newHook.state) : action;
    });
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
