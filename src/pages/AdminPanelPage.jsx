import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import Loading from "../components/loading/Loading";
import React, {useEffect, useState} from "react";
import UserService from "../services/UserService";
import {ModalNotify} from "../components/modal/ModalNotify";
import {ModalConfirmation} from "../components/modal/ModalConfirmation";

function AdminPanelPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalAddUser, setIsModalAddUser] = useState(false);
    const [isModalConfirmation, setIsModalConfirmation] = useState(false);

    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([])

    const [userToDelete, setUserToDelete] = useState(null);

    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        roles: ['ROLE_VIEWER']
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [])

    async function fetchUsers() {
        try {
            setIsLoading(true);
            const response = await UserService.getAllUsers();
            setUsers(response.data);
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при загрузке пользователей");
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchRoles() {
        try {
            setIsLoading(true);
            const response = await UserService.getAvailableRoles();
            setAvailableRoles(response.data.map(role => role.name));
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при загрузке ролей");
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
        }
    }

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles.map(role => role.name));
    };

    const handleRoleToggle = (role) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;

        try {
            setIsLoading(true);
            const response = await UserService.updateUserRoles(selectedUser.id, selectedRoles);
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === response.data.id ? response.data : user
            ));
            setMsg("Роли пользователя " + selectedUser.username + " успешно обновлены");
            setSelectedUser(null);
            setSelectedRoles([]);
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при обновлении ролей");
        } finally {
            setIsLoading(false);
            setIsModalNotify(true);
        }
    };

    const handleDeleteUser = async (user) => {
        setUserToDelete(user);
        setMsg(`Вы уверены, что хотите удалить пользователя "${user.username}"?`);
        setIsModalConfirmation(true)
    };

    const deleteUser = async () => {
        if (!userToDelete) return;

        try {
            setIsLoading(true);
            await UserService.deleteUser(userToDelete.id);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
            if (selectedUser?.id === userToDelete.id) {
                setSelectedUser(null);
                setSelectedRoles([]);
            }
            setMsg(`Пользователь "${userToDelete.username}" успешно удален`);
            setIsModalNotify(true);
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при удалении пользователя");
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
            setIsModalConfirmation(false);
            setUserToDelete(null);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.username.trim()) {
            setMsg("Введите имя пользователя");
            setIsModalNotify(true);
            return;
        }

        if (!newUser.password) {
            setMsg("Введите пароль");
            setIsModalNotify(true);
            return;
        }

        if (newUser.password.length < 4) {
            setMsg("Пароль должен содержать минимум 4 символа");
            setIsModalNotify(true);
            return;
        }

        const rolesToSend = newUser.roles.filter(role => role !== "ROLE_VIEWER");

        try {
            setIsLoading(true);
            const response = await UserService.createUser({
                username: newUser.username,
                password: newUser.password,
                roles: rolesToSend
            });
            setUsers(prevUsers => [...prevUsers, response.data]);
            setMsg(`Пользователь "${newUser.username}" успешно создан`);
            setIsModalAddUser(false);
            resetNewUserForm();
            setIsModalNotify(true);
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при создании пользователя");
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
        }
    };

    const resetNewUserForm = () => {
        setNewUser({
            username: '',
            password: '',
            roles: ['ROLE_VIEWER']
        });
    };

    const handleNewUserRoleToggle = (role) => {
        if (role === "ROLE_VIEWER") return;

        setNewUser(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }));
    };

    function handleCloseEdit() {
        setSelectedUser(null);
        setSelectedRoles([]);
    }

    function getBgColor(role) {
        const colors = {
            "ROLE_ADMIN": "bg-gradient-to-r from-emerald-600 to-teal-600",
            "ROLE_EDITOR": "bg-gradient-to-r from-amber-600 to-orange-600",
            "ROLE_SCHEDULER": "bg-gradient-to-r from-indigo-600 to-blue-600",
        };
        return colors[role] || "bg-gradient-to-r from-gray-600 to-gray-600";
    }

    return (<>
        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {}}/>
        <div className="flex flex-row window-height bg-gray-50">
            <div className="w-[200px] py-2 border-r bg-white">
                <LeftNavigation/>
            </div>

            <div className="flex flex-col w-full">
                {isLoading && <Loading/>}

                {!isLoading && <>
                    {/* Современная шапка */}
                    <div className="flex flex-row justify-between items-center px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                        <div>
                            <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Управление пользователями
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Управление учетными записями и правами доступа
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalAddUser(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Добавить пользователя
                        </button>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-4 gap-4 px-8 pt-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Всего пользователей</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{users.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Администраторы</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                                        {users.filter(u => u.roles?.some(r => r.name === "ROLE_ADMIN")).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Редакторы отчетов</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                                        {users.filter(u => u.roles?.some(r => r.name === "ROLE_EDITOR")).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Работа с планировщиком</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                                        {users.filter(u => u.roles?.some(r => r.name === "ROLE_SCHEDULER")).length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Основной контент */}
                    <div className="flex gap-6 p-8">
                        {/* Таблица пользователей */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Роли</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </span>
                                                    </div>
                                                    <span className="text-md font-medium text-gray-900">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700">
                                                        {user.authType}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {user.roles?.map((role, index) => (
                                                        <span key={index} className={`${getBgColor(role.name)} px-2 py-0.5 rounded-md text-sm font-medium text-white shadow-sm`}>
                                                                {role.name.substring(5)}
                                                            </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1  transition-opacity">
                                                    <button
                                                        onClick={() => handleUserSelect(user)}
                                                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                        title="Редактировать роли"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Удалить пользователя"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {users.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium mb-1">Нет пользователей</h3>
                                    <p className="text-sm">Нажмите "Добавить пользователя" чтобы создать первого</p>
                                </div>
                            )}
                        </div>

                        {/* Панель редактирования ролей */}
                        <div className="w-80 shrink-0">
                            {!selectedUser ? (
                                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">Выберите пользователя для редактирования ролей</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
                                    <div className="px-5 py-4 bg-gradient-to-r bg-blue-800">
                                        <h3 className="text-sm font-semibold text-white">Редактор ролей</h3>
                                        <p className="text-xs text-white mt-0.5">{selectedUser.username}</p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Доступные роли</p>
                                        <div className="space-y-1">
                                            {availableRoles.map((role, index) => (
                                                <label key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                        disabled={role === "ROLE_VIEWER"}
                                                        checked={selectedRoles.includes(role)}
                                                        onChange={() => handleRoleToggle(role)}
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">{role.substring(5)}</span>
                                                    {role === "ROLE_VIEWER" && (
                                                        <span className="ml-2 text-xs text-gray-400">(базовая)</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 pt-5 mt-2 border-t border-gray-100">
                                            <button
                                                onClick={handleCloseEdit}
                                                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                onClick={handleSaveRoles}
                                                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Сохранить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>}

                {/* Модальные окна */}
                {isModalAddUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                            <div className="px-6 py-5 bg-gradient-to-r bg-gray-800 hover:bg-gray-700">
                                <h3 className="text-lg font-semibold text-white">Добавление пользователя</h3>
                                <p className="text-sm text-gray-400 mt-0.5">Заполните информацию о новом пользователе</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Логин</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                        placeholder="ivan.ivanov"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                        placeholder="Минимум 4 символа"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Роли</label>
                                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-auto">
                                        {availableRoles.map((role, index) => (
                                            <label key={index} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                    disabled={role === "ROLE_VIEWER"}
                                                    checked={newUser.roles.includes(role)}
                                                    onChange={() => handleNewUserRoleToggle(role)}
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{role.substring(5)}</span>
                                                {role === "ROLE_VIEWER" && (
                                                    <span className="ml-2 text-xs text-gray-400">(обязательная)</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsModalAddUser(false);
                                        resetNewUserForm();
                                    }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-white hover:bg-gray-800 transition-colors"
                                >
                                    Создать
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isModalNotify && (
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>
                )}

                {isModalConfirmation && (
                    <ModalConfirmation
                        title={"Подтверждение удаления"}
                        message={msg}
                        onClose={() => setIsModalConfirmation(false)}
                        onAgree={deleteUser}
                        onDisagree={() => setIsModalConfirmation(false)}
                    />
                )}
            </div>
        </div>
    </>)
}

export default observer(AdminPanelPage);