import React, {useContext, useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {arrowDown, arrowUp} from "../data/icons";
import {Context} from "../index";
import RoleGuard from "./RoleGuard";



export function Navigation(props) {
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [dropdownSettings, setDropdownSettings] = useState(false);


    const container = useRef();

    const handleClickOutside = (e) => {
        if (container.current && !container.current.contains(e.target)) {
            setDropdownSettings(false);
        }
    };

    const handleClickMenu = (e) => {
        props.setOpenMenu(!props.isOpenMenu)
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (

        <nav className=" lg:h-[50px] w-full flex justify-between  item-center border-b-2">
            <div className="flex flex-col w-9/12 lg:w-full lg:flex-row lg:justify-between bg-gray-50 items-center">

                <div className="flex flex-row justify-center h-10 w-[202px] text-center items-center  lg:text-center ">

                    <div className="">
                        <img src="/newpng.png" className="w-28" alt="Logo"/>
                    </div>


                </div>
                <div className="flex h-full flex-row  font-medium w-full px-3 text-white items-center bg-blue-800">
                    <span className="font-medium  text-white px-3 w-full">Автоматизация производства</span>

                </div>
            </div>

            <div className="flex h-10 w-3/12 lg:h-auto lg:w-auto justify-end items-center bg-blue-800">
                <div className="flex h-10 lg:h-auto lg:w-auto justify-end items-center bg-gray-50 rounded mr-4">
                    {/* Блок пользователя */}
                    <div
                        className="flex items-center h-8 bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center px-3 gap-2 border-r border-gray-200">
                            {store.isAuth ? (
                                <>
                                    <i className="fa-solid fa-user-tie text-gray-700 text-sm"></i>
                                    <span className="font-medium text-gray-700 text-sm">{store.user.username}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-user text-gray-700 text-sm"></i>
                                    <span className="font-medium text-gray-700 text-sm">Гость</span>
                                </>
                            )}
                        </div>

                        {/* Блок входа/выхода */}
                        <button
                            className="px-3 h-full flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={() => {
                                if (store.isAuth) {
                                    store.logout();
                                }
                                navigate("/login");
                            }}>
                            {store.isAuth ? (
                                <>
                                    <svg width="16px" height="16px" viewBox="0 0 24 24"
                                         className="text-gray-700 group-hover:text-red-600 transition-colors">
                                        <path fill="currentColor"
                                              d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"/>
                                    </svg>
                                    <span
                                        className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Выйти</span>
                                </>
                            ) : (
                                <>
                                    <svg width="16px" height="16px" viewBox="0 0 24 24"
                                         className="text-gray-700 group-hover:text-blue-600 transition-colors">
                                        <path fill="currentColor"
                                              d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                                    </svg>
                                    <span
                                        className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Войти</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>

        </nav>
    )
}