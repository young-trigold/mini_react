interface FiberNode {
    type: 'TEXT_ELEMENT' | keyof HTMLElementTagNameMap;
    props?: {
        children: FiberNode[];
    } & Record<string, unknown>;
    dom?: HTMLElement | Text | null;
    child?: FiberNode;
    parent?: FiberNode;
    sibling?: FiberNode;
    textContent?: string;
}

export const createElement = (
    type: FiberNode['type'],
    props: Record<string, unknown> | null,
    ...children: FiberNode[]
) => {
    return {
        type,
        props: {
            ...(props ?? {}),
            children: children.flat(),
        },
    };
};

const createDOM = (fiberNode: FiberNode) => {
    const dom =
        fiberNode.type == 'TEXT_ELEMENT'
            ? document.createTextNode(fiberNode.textContent ?? '')
            : document.createElement(fiberNode.type);
    const isProperty = (key: string) => key !== 'children';
    if (!fiberNode.props) return;
    Object.keys(fiberNode.props)
        .filter(isProperty)
        .forEach((name) => {
            if (!fiberNode.props) return;
            dom[name] = fiberNode.props[name];
        });
    return dom;
};

const performUnitOfWork = (fiberNode: FiberNode) => {
    if (!fiberNode.dom) fiberNode.dom = createDOM(fiberNode);
    let preChildFiber: FiberNode | null = null;
    for (let i = 0; i < fiberNode.props.children.length; i++) {
        const child = fiberNode.props.children[i];
        const childFiber: FiberNode = { type: child.type, parent: fiberNode, dom: null };
        if (child instanceof Object) {
            childFiber.type = child.type;
            childFiber.props = child.props;
        } else {
            childFiber.type = 'TEXT_ELEMENT';
            childFiber.props = { children: [] };
            childFiber.textContent = child;
        }
        if (i === 0) fiberNode.child = childFiber;
        else preChildFiber!.sibling = childFiber;
        preChildFiber = childFiber;
    }
    if (fiberNode.child) return fiberNode.child;
    let nextFiber: FiberNode | undefined = fiberNode;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
};

let nextUnitOfWork: FiberNode | null | undefined = null;
let workInProgressRoot: FiberNode | null | undefined = null;

const commitWork = (fiber: FiberNode | null | undefined) => {
    if (!fiber) return;
    if (!fiber.parent) return;
    const domParent = fiber.parent.dom;
    if (!domParent) return;
    if (fiber.dom) domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
};

function commitRoot() {
    commitWork(workInProgressRoot?.child);
    workInProgressRoot = null;
}

const workLoop: IdleRequestCallback = (deadline) => {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 5;
    }
    if (!nextUnitOfWork && workInProgressRoot) {
        console.log(workInProgressRoot);
        commitRoot();
    }
    window.requestIdleCallback(workLoop);
};

window.requestIdleCallback(workLoop);

export const render = (element: FiberNode, container: HTMLElement) => {
    workInProgressRoot = {
        type: 'div',
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = workInProgressRoot;
};
