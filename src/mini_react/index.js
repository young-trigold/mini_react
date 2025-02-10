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

