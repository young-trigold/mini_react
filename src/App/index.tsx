/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from '../mini_react/hooks.ts';
import { createElement } from '../mini_react/react-dom.ts';
/** @jsx createElement */
import './app.scss';
import { FormValue, User } from './type.ts';
import { UserDialog, UserDialogProps } from './UserDialog.tsx';

const usersData: User[] = [
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

export const App = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMode, setDialogMode] = useState<UserDialogProps['mode']>('add');
    const [formValue, setFormValue] = useState<FormValue>(null);

    const openDialog = () => {
        setDialogVisible(true);
    };

    const [users, setUsers] = useState<User[]>(usersData);

    /**
     * 同步 users 到 localStorage：
     * - 首次挂载时尝试从 localStorage 加载已保存的 users（覆盖默认数据）
     * - 每次 users 变更时同步保存到 localStorage
     */
    useEffect(() => {
        try {
            const raw = localStorage.getItem('mini_react_users');
            if (raw) {
                const parsed = JSON.parse(raw) as User[];
                if (Array.isArray(parsed)) {
                    setUsers(parsed);
                }
            }
        } catch (e) {
            // 忽略解析错误
            // eslint-disable-next-line no-console
            console.error('从 localStorage 加载 users 失败', e);
        }
        // 仅在首次挂载时执行
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('mini_react_users', JSON.stringify(users));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('保存 users 到 localStorage 失败', e);
        }
    }, [users]);

    const addUser = () => {
        setFormValue(null);
        setDialogMode('add');
        openDialog();
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
                setUsers={setUsers}
                formValue={formValue}
                setFormValue={setFormValue}
            />
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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDialogMode('update');
                                        setFormValue(user);
                                        openDialog();
                                    }}
                                >
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
};
