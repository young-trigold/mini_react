/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from './mini_react/hooks.ts';
import { createRoot, createElement } from './mini_react/react-dom.ts';
/** @jsx createElement */
import { SetStateAction } from './mini_react/type.ts';
import './index.scss';

interface UserDialogProps {
    dialogVisible: boolean;
    setDialogVisible: (action: SetStateAction<boolean>) => void;
    mode: 'add' | 'update';
}

function UserDialog(props: UserDialogProps) {
    const { dialogVisible, setDialogVisible } = props;

    const closeDialog = () => {
        setDialogVisible(false);
    };

    return (
        <div className={`user-dialog ${dialogVisible ? '' : 'closed'}`}>
            <button className="dialog-close-button" type="button" onClick={closeDialog}>
                关闭
            </button>
            <header className="dialog-header">新增/更新用户</header>
            <body className="dialog-body">
                <div className="filed">
                    <label htmlFor="userName">姓名</label>
                    <input type="text" id="userName" />
                </div>
                <div className="filed">
                    <label htmlFor="userName">性别</label>
                    <input type="text" id="userName" />
                </div>
                <div className="filed">
                    <label htmlFor="userName">电话</label>
                    <input type="text" id="userName" />
                </div>
            </body>

            <footer className="dialog-footer">
                <button type="button" onClick={closeDialog}>
                    取消
                </button>
                <button type="button">确定</button>
            </footer>
        </div>
    );
}

function App() {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMode, setDialogMode] = useState<UserDialogProps['mode']>('add');

    const openDialog = () => {
        setDialogVisible(true);
    };

    const [users, setUsers] = useState([
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
    ]);

    const addUser = () => {
        setUsers((oldUsers) => [
            ...oldUsers,
            {
                id: 11,
                familyName: '马',
                givenName: '飞',
                gender: 'Male',
                phone: '2332943750',
                avatar: 'https://robohash.org/facilisreprehenderitin.png?size=300x300&set=set1',
            },
        ]);
    };

    const deleteUser = (id: number) => {
        setUsers((oldUsers) => {
            const copy = oldUsers.slice();
            const userToDelete = copy.findIndex((oldUsers) => id === oldUsers.id);
            copy.splice(userToDelete, 1);
            return copy;
        });
    };

    return (
        <form className="form">
            <button type="button" className="add-button" onClick={addUser}>
                新增
            </button>
            <UserDialog
                dialogVisible={dialogVisible}
                setDialogVisible={setDialogVisible}
                mode={dialogMode}
            ></UserDialog>
            <table className="user-table">
                <caption>用户管理表格</caption>
                <tbody>
                    <tr>
                        <th scope="col">id</th>
                        <th scope="col">姓名</th>
                        <th scope="col">头像</th>
                        <th scope="col">性别</th>
                        <th scope="col">电话</th>
                        <th scope="col">操作</th>
                    </tr>
                    {users.map((user) => (
                        <tr>
                            <td>{user.id}</td>
                            <td>{user.familyName + user.givenName}</td>
                            <td>
                                <img src={user.avatar} width={50} height={50} />
                            </td>
                            <td>{user.gender}</td>
                            <td>{user.phone}</td>
                            <td className="operation-col">
                                <button type="button" onClick={openDialog}>
                                    更新
                                </button>
                                <button type="button" onClick={() => deleteUser(user.id)}>
                                    删除
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </form>
    );
}

const vDOM = <App />;
console.log('<App/>：', vDOM);

const root = createRoot(vDOM);
console.log('正在构建的 fiber 树：', root.root);

const rootContainer = document.getElementById('app');
// debugger;
if (rootContainer) root.render(rootContainer);
else alert("document.getElementById('app') 为 null");
