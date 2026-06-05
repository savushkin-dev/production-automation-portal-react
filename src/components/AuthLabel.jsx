import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import {Context} from "../index";


const AuthLabel = ({
                       loginPath = "/login",
                       logoutPath = "/login"
                   }) => {
    const navigate = useNavigate();
    const {store} = useContext(Context);

    const handleAuthClick = () => {
        if (store.isAuth) {
            store.logout();
            navigate(logoutPath);
        } else {
            navigate(loginPath);
        }
    };

    return (
        <div className="flex items-center h-8 bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center px-3 gap-2 border-r border-gray-200">
                {store.isAuth ? (
                    <>
                        <i className="fa-solid fa-user-tie text-gray-700 text-sm"></i>
                        <span className="font-medium text-gray-700 text-sm">
                            {store.user.username}
                        </span>
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-user text-gray-700 text-sm"></i>
                        <span className="font-medium text-gray-700 text-sm">
                            Гость
                        </span>
                    </>
                )}
            </div>

            <button
                className="px-3 h-full flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors duration-200 group"
                onClick={handleAuthClick}
            >
                {store.isAuth ? (
                    <>
                        <svg width="16px" height="16px" viewBox="0 0 24 24" className="text-gray-700 group-hover:text-red-600 transition-colors">
                            <path fill="currentColor" d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                            Выйти
                        </span>
                    </>
                ) : (
                    <>
                        <svg width="16px" height="16px" viewBox="0 0 24 24" className="text-gray-700 group-hover:text-blue-700 transition-colors">
                            <path fill="currentColor" d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                            Войти
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default AuthLabel;