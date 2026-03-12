import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import Loading from "../components/loading/Loading";
import React, {useEffect, useState} from "react";
import UserService from "../services/UserService";
import {ModalNotify} from "../components/modal/ModalNotify";

function AdminPanelPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const [isModalNotify, setIsModalNotify] = useState(false);

    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([])


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
            setMsg(e.response.data.message);
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
            setMsg(e.response.data.message);
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
            setMsg(e.response.data.message);
        } finally {
            setIsLoading(false);
            setIsModalNotify(true);
        }
    };

    function handleCloseEdit() {
        setSelectedUser(null);
        setSelectedRoles([]);
    }

    function getBgColor(role) {
        if (role === "ROLE_ADMIN") {
            return "bg-teal-600"
        } else if (role === "ROLE_EDITOR") {
            return "bg-amber-600"
        } else if (role === "ROLE_SCHEDULER") {
            return "bg-indigo-500"
        } else {
            return "bg-stone-500"
        }
    }


    return (<>

        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
        }}/>
        <div className="flex flex-row window-height">
            <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>

            <div className="flex flex-col w-full ">
                {isLoading && <Loading/>}

                {!isLoading && <>
                    {/* Шапка с заголовком */}
                    <div className="flex flex-row py-3 px-8 border-b-2 bg-white shadow-sm">
                        <div
                            className="flex justify-between w-2/6 text-2xl font-medium items-center text-center">
                            <span className="text-xl font-bold text-gray-800">Панель администратора</span>
                        </div>
                        <div className="flex flex-row justify-end w-4/6">

                        </div>
                    </div>

                    <div className="px-6 py-4 my-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-[4px] h-8 bg-blue-600 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Управление пользователями и их ролями. Выберите пользователя для
                                    редактирования
                                    и назначьте ему соответствующие роли из списка доступных.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                                    <span className="text-sm font-medium text-blue-700">
                                        {users.length} пользователей
                                    </span>
                            </div>
                        </div>
                    </div>

                    {/* Основной контент */}
                    <div className="px-8 py-6">
                        <div className="flex flex-row gap-6">
                            <div className="border rounded-lg bg-white shadow-sm w-3/4">
                                <div className="px-4 py-3 border-b rounded-t-lg bg-gray-50 text-gray-700">
                                    <h3 className="text-lg font-medium">Пользователи</h3>
                                </div>

                                <div className="flex flex-row px-4 py-2 bg-gray-50 border-b">
                                    <div className="w-1/5 py-1 px-1 font-medium text-gray-600 text-sm text-center">Логин
                                    </div>
                                    <div
                                        className="w-1/5 py-1 px-1 font-medium text-gray-600 text-sm text-center">Тип
                                        аунтификации
                                    </div>
                                    <div
                                        className="w-2/5 py-1 px-1 font-medium text-gray-600 text-sm text-center">Роли
                                    </div>
                                    <div
                                        className="w-1/5 py-1 px-1 font-medium text-gray-600 text-sm text-center">Действия
                                    </div>
                                </div>

                                {/* Список пользователей */}
                                <div className="divide-y h-full max-h-[60vh] overflow-auto">
                                    {users.map((user, index) => (
                                        <div key={index}
                                             className="flex flex-row px-4 py-2 hover:bg-gray-50 transition-colors">
                                            <div className="w-1/5 py-1 px-1 text-md text-center text-gray-700 truncate"
                                                 title={user.username}>
                                                {user.username}
                                            </div>
                                            <div className="w-1/5 py-1 px-1 text-sm text-gray-600 text-center">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-sm">
                                                    {user.authType}
                                                </span>
                                            </div>
                                            <div className="w-2/5 py-1 px-1 text-center">
                                                {user.roles.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        {user.roles.map((role, idx) => (
                                                            <span key={idx}
                                                                  className={`${getBgColor(role.name)} px-2 py-0.5 rounded-full text-sm font-medium text-white inline-block`}>
                                                    {role.name.substring(5)}
                                                </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="bg-red-600 px-2 py-0.5 rounded-full text-xs font-medium text-white">
                                                        Нет ролей
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-1/5 py-1 px-1 text-center">
                                                <button
                                                    className="px-3 py-1 text-sm font-medium border rounded bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    Редактировать
                                                    <i className=" pl-2 fa-solid fa-user-pen"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {users.length === 0 && (
                                        <div
                                            className="flex flex-col items-center justify-center py-12 text-gray-500">
                                            <div className="text-4xl mb-4">👥</div>
                                            <h3 className="text-lg font-medium mb-2">Пользователи не
                                                найдены</h3>
                                            <p className="text-sm text-gray-400">В системе пока нет
                                                зарегистрированных пользователей</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Панель редактирования ролей */}
                            <div className="border rounded-lg bg-white shadow-sm h-full w-1/4">
                                <div className="px-4 py-3 border-t rounded-t-lg bg-blue-800 text-white">
                                    <h3 className="text-lg font-medium ">Редактор ролей</h3>
                                </div>

                                <div className="p-4">
                                    {!selectedUser ? (
                                        <div
                                            className="flex flex-col items-center justify-center py-8 text-gray-400">
                                            <i className="text-5xl text-gray-700 fa-solid fa-users"></i>
                                            <p className="text-sm text-center mt-6">Выберите пользователя для
                                                редактирования</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-4 pb-3 border-b">
                                                <p className="text-xs text-gray-500 mb-1">Редактирование</p>
                                                <p className="font-medium text-gray-800 break-words">{selectedUser.username}</p>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Доступные
                                                    роли</p>
                                                <div className="space-y-2">
                                                    {availableRoles.map((role, index) => (
                                                        <label key={index}
                                                               className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-800 focus:ring-blue-500"
                                                                disabled={role === "ROLE_VIEWER"}
                                                                checked={selectedRoles.includes(role)}
                                                                onChange={() => handleRoleToggle(role)}
                                                            />
                                                            <span className="ml-3 text-sm text-gray-700">
                                                    {role.substring(5)}
                                                </span>
                                                            {role === "ROLE_VIEWER" && (
                                                                <span
                                                                    className="ml-2 text-xs text-gray-400">(обязательная)</span>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-row justify-end gap-2 pt-3 border-t">
                                                <button
                                                    onClick={handleCloseEdit}
                                                    className="px-3 py-1 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                                                >
                                                    Отмена
                                                </button>
                                                <button
                                                    onClick={handleSaveRoles}
                                                    className="px-3 py-1 text-sm font-medium rounded bg-blue-800 text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    Сохранить
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg}
                                 onClose={() => setIsModalNotify(false)}/>
                }
            </div>


        </div>
    </>)
}

export default observer(AdminPanelPage)