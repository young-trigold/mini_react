# 介绍

建造一个小型的 React。

# 渲染流程

状态 => JSX => createElement => 虚拟 DOM 对象 => render => 真实 DOM

状态改变后，上述渲染流程重新执行。

```tsx
import { transformSync } from '@babel/core';
import reactPreset from '@babel/preset-react';

const jsx = `/** @jsx createElement */<table>
        <caption>用户管理表格</caption>
        <tbody>
            <tr>
                <th scope="col">id</th>
                <th scope="col">姓名</th>
                <th scope="col">头像</th>
                <th scope="col">性别</th>
                <th scope="col">电话</th>
            </tr>
            {users.map((user) => (
                <tr>
                    <td>{user.id}</td>
                    <td>{user.familyName + user.givenName}</td>
                    <td>
                        <img src={user.avatar} />
                    </td>
                    <td>{user.gender}</td>
                    <td>{user.phone}</td>
                </tr>
            ))}
        </tbody>
    </table>`;

const result = transformSync(jsx, {
    presets: [reactPreset],
});

// webpack 插件将 jsx 转为 createElement
console.log(result.code);

/** @jsx createElement */ createElement(
    'table',
    null,
    createElement('caption', null, '\u7528\u6237\u7BA1\u7406\u8868\u683C'),
    createElement(
        'tbody',
        null,
        createElement(
            'tr',
            null,
            createElement(
                'th',
                {
                    scope: 'col',
                },
                'id',
            ),
            createElement(
                'th',
                {
                    scope: 'col',
                },
                '\u59D3\u540D',
            ),
            createElement(
                'th',
                {
                    scope: 'col',
                },
                '\u5934\u50CF',
            ),
            createElement(
                'th',
                {
                    scope: 'col',
                },
                '\u6027\u522B',
            ),
            createElement(
                'th',
                {
                    scope: 'col',
                },
                '\u7535\u8BDD',
            ),
        ),
        users.map((user) =>
            createElement(
                'tr',
                null,
                createElement('td', null, user.id),
                createElement('td', null, user.familyName + user.givenName),
                createElement(
                    'td',
                    null,
                    createElement('img', {
                        src: user.avatar,
                    }),
                ),
                createElement('td', null, user.gender),
                createElement('td', null, user.phone),
            ),
        ),
    ),
);

// 自定义 createElement
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

// 实际VDOM
{
    "type": "table",
    "props": {
        "children": [
            {
                "type": "caption",
                "props": {
                    "children": [
                        "用户管理表格"
                    ]
                }
            },
            {
                "type": "tbody",
                "props": {
                    "children": [
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "th",
                                        "props": {
                                            "scope": "col",
                                            "children": [
                                                "id"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "th",
                                        "props": {
                                            "scope": "col",
                                            "children": [
                                                "姓名"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "th",
                                        "props": {
                                            "scope": "col",
                                            "children": [
                                                "头像"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "th",
                                        "props": {
                                            "scope": "col",
                                            "children": [
                                                "性别"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "th",
                                        "props": {
                                            "scope": "col",
                                            "children": [
                                                "电话"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                1
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "益梓彤"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/culpaperferendisa.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "3912617534"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                2
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "谷海程"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/necessitatibussolutacumque.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Male"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "7466336115"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                3
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "郭辰华"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/officiisiustosaepe.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Bigender"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "6595909475"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                4
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "樊宸瑜"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/cupiditatererumsapiente.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "1957084442"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                5
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "岑银含"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/placeatquiafacere.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Non-binary"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "9592449471"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                6
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "蔺培安"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/expeditateneturquia.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "3772026769"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                7
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "熊雅静"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/sequienimut.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "3781292014"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                8
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "红海程"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/estconsequatursint.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "7914616067"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                9
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "慎彦军"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/repellendusautut.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Female"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "8569428953"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type": "tr",
                            "props": {
                                "children": [
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                10
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "薛萧然"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                {
                                                    "type": "img",
                                                    "props": {
                                                        "src": "https://robohash.org/facilisreprehenderitin.png?size=300x300&set=set1",
                                                        "children": []
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "Male"
                                            ]
                                        }
                                    },
                                    {
                                        "type": "td",
                                        "props": {
                                            "children": [
                                                "7432943750"
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    }
}

// render 函数
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)
​
  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })
​
  element.props.children.forEach(child =>
    render(child, dom)
  )
​
  container.appendChild(dom)
}
```

# 时间分片

将渲染任务分片在空闲时间执行。

```ts
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
```

```tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, createElement } from './mini_react/index.ts';
/** @jsx createElement */
const users = [
    {
        id: 1,
        familyName: '益',
        givenName: '梓彤',
        gender: 'Female',
        phone: '3912617534',
        avatar: 'https://robohash.org/culpaperferendisa.png?size=300x300&set=set1',
    },
    {
        id: 2,
        familyName: '谷',
        givenName: '海程',
        gender: 'Male',
        phone: '7466336115',
        avatar: 'https://robohash.org/necessitatibussolutacumque.png?size=300x300&set=set1',
    },
    {
        id: 3,
        familyName: '郭',
        givenName: '辰华',
        gender: 'Bigender',
        phone: '6595909475',
        avatar: 'https://robohash.org/officiisiustosaepe.png?size=300x300&set=set1',
    },
    {
        id: 4,
        familyName: '樊',
        givenName: '宸瑜',
        gender: 'Female',
        phone: '1957084442',
        avatar: 'https://robohash.org/cupiditatererumsapiente.png?size=300x300&set=set1',
    },
    {
        id: 5,
        familyName: '岑',
        givenName: '银含',
        gender: 'Non-binary',
        phone: '9592449471',
        avatar: 'https://robohash.org/placeatquiafacere.png?size=300x300&set=set1',
    },
    {
        id: 6,
        familyName: '蔺',
        givenName: '培安',
        gender: 'Female',
        phone: '3772026769',
        avatar: 'https://robohash.org/expeditateneturquia.png?size=300x300&set=set1',
    },
    {
        id: 7,
        familyName: '熊',
        givenName: '雅静',
        gender: 'Female',
        phone: '3781292014',
        avatar: 'https://robohash.org/sequienimut.png?size=300x300&set=set1',
    },
    {
        id: 8,
        familyName: '红',
        givenName: '海程',
        gender: 'Female',
        phone: '7914616067',
        avatar: 'https://robohash.org/estconsequatursint.png?size=300x300&set=set1',
    },
    {
        id: 9,
        familyName: '慎',
        givenName: '彦军',
        gender: 'Female',
        phone: '8569428953',
        avatar: 'https://robohash.org/repellendusautut.png?size=300x300&set=set1',
    },
    {
        id: 10,
        familyName: '薛',
        givenName: '萧然',
        gender: 'Male',
        phone: '7432943750',
        avatar: 'https://robohash.org/facilisreprehenderitin.png?size=300x300&set=set1',
    },
];

const vDOM = (
    <table>
        <caption>用户管理表格</caption>
        <tbody>
            <tr>
                <th scope="col">id</th>
                <th scope="col">姓名</th>
                <th scope="col">头像</th>
                <th scope="col">性别</th>
                <th scope="col">电话</th>
            </tr>
            {users.map((user) => (
                <tr>
                    <td>{user.id}</td>
                    <td>{user.familyName + user.givenName}</td>
                    <td>
                        <img src={user.avatar} />
                    </td>
                    <td>{user.gender}</td>
                    <td>{user.phone}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

console.log(vDOM);

render(vDOM, document.getElementById('app')!);
```
