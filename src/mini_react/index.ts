import { createDOM, updateDom } from './react-dom.ts';
import { Fiber, MiniReact } from './type.ts';

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
