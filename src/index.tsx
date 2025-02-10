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
