/* eslint-disable @typescript-eslint/no-unused-vars */
import { createElement } from '../mini_react/react-dom.ts';
import { useEffect, useRef } from '../mini_react/hooks.ts';
/** @jsx createElement */
import { SetStateAction } from '../mini_react/type.ts';
import { FormValue, User } from './type.ts';

export interface UserDialogProps {
    dialogVisible: boolean;
    setDialogVisible: (action: SetStateAction<boolean>) => void;
    mode: 'add' | 'update';
    setUsers: (action: SetStateAction<User[]>) => void;
    formValue: FormValue;
    setFormValue: (action: SetStateAction<FormValue>) => void;
}

export const UserDialog = (props: UserDialogProps) => {
    const { dialogVisible, setDialogVisible, setUsers, mode, formValue, setFormValue } = props;

    /**
     * 当对话框打开时自动聚焦第一个输入（姓氏），关闭时恢复之前的焦点。
     * 使用 useRef 保存打开对话框前的活动元素引用。
     */
    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (dialogVisible) {
            // 保存当前活动元素
            previousActiveElementRef.current = document.activeElement as HTMLElement | null;
            // 打开对话框后聚焦第一个输入框（通过 id 查询）
            const firstInput = document.getElementById('userFamilyName') as HTMLElement | null;
            firstInput?.focus?.();
        } else {
            // 对话框关闭时恢复之前的焦点
            try {
                previousActiveElementRef.current?.focus?.();
            } catch (e) {
                // 忽略恢复焦点错误
            }
        }
    }, [dialogVisible]);

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
                    <label htmlFor="userFamilyName">姓</label>
                    <input
                        value={formValue?.familyName ?? ''}
                        type="text"
                        id="userFamilyName"
                        onChange={(event) => {
                            setFormValue(
                                (oldFormValue) =>
                                    ({
                                        ...(oldFormValue ?? {}),
                                        familyName: event.target.value,
                                    }) as FormValue,
                            );
                        }}
                    />
                </div>
                <div className="filed">
                    <label htmlFor="userGivenName">名</label>
                    <input
                        value={formValue?.givenName ?? ''}
                        type="text"
                        id="userGivenName"
                        onChange={(event) => {
                            setFormValue(
                                (oldFormValue) =>
                                    ({
                                        ...(oldFormValue ?? {}),
                                        givenName: event.target.value,
                                    }) as FormValue,
                            );
                        }}
                    />
                </div>
                <div className="filed">
                    <p>性别</p>
                    <div>
                        <input
                            checked={formValue?.gender === 'Male'}
                            type="radio"
                            onChange={(event) => {
                                setFormValue(
                                    (oldFormValue) =>
                                        ({
                                            ...(oldFormValue ?? {}),
                                            gender: 'Male',
                                        }) as FormValue,
                                );
                            }}
                        />
                        <label>男</label>
                    </div>
                    <div>
                        <input
                            checked={formValue?.gender === 'Female'}
                            type="radio"
                            onChange={(event) => {
                                setFormValue(
                                    (oldFormValue) =>
                                        ({
                                            ...(oldFormValue ?? {}),
                                            gender: 'Female',
                                        }) as FormValue,
                                );
                            }}
                        />
                        <label>女</label>
                    </div>
                    <div>
                        <input
                            checked={formValue?.gender === 'Non-binary'}
                            type="radio"
                            onChange={(event) => {
                                setFormValue(
                                    (oldFormValue) =>
                                        ({
                                            ...(oldFormValue ?? {}),
                                            gender: 'Non-binary',
                                        }) as FormValue,
                                );
                            }}
                        />
                        <label>其他</label>
                    </div>
                </div>
                <div className="filed">
                    <label htmlFor="phone">电话</label>
                    <input
                        value={formValue?.phone ?? ''}
                        type="text"
                        id="phone"
                        onChange={(event) => {
                            setFormValue(
                                (oldFormValue) =>
                                    ({
                                        ...(oldFormValue ?? {}),
                                        phone: event.target.value,
                                    }) as FormValue,
                            );
                        }}
                    />
                </div>
            </body>

            <footer className="dialog-footer">
                <button type="button" onClick={closeDialog}>
                    取消
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (mode === 'add') {
                            setUsers((oldUsers) => [
                                ...oldUsers,
                                { ...formValue, id: oldUsers.length + 1, avatar: '' } as User,
                            ]);
                        }

                        if (mode === 'update') {
                            setUsers((oldUsers) => {
                                const copy = oldUsers.slice();
                                const index = oldUsers.findIndex((oldUser) => formValue?.id === oldUser.id);
                                copy.splice(index, 1, formValue!);
                                return copy;
                            });
                        }

                        closeDialog();
                    }}
                >
                    确定
                </button>
            </footer>
        </div>
    );
};
