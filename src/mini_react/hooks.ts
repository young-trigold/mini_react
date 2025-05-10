import { miniReact } from './index.ts';
import { UseState, UseStateHook } from './type.ts';

/**
 * 状态钩子
 * @param initialState 初始状态
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
