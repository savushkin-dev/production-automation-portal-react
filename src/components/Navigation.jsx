import React, {useContext, useEffect, useRef, useState} from 'react'
import {Context} from "../index";
import AuthLabel from "./AuthLabel";
import {LeftNavigation} from "./leftNavigation/LeftNavigation";

export function Navigation(props) {
    const {store} = useContext(Context);

    const [dropdownSettings, setDropdownSettings] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const container = useRef();

    const handleClickOutside = (e) => {
        if (container.current && !container.current.contains(e.target)) {
            setDropdownSettings(false);
        }
    };

    const handleClickMenu = (e) => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        props.setOpenMenu(newState);
        document.body.style.overflow = newState ? 'hidden' : 'auto';
    };

    const handleMenuItemClick = () => {
        setIsMobileMenuOpen(false);
        props.setOpenMenu(false);
        document.body.style.overflow = 'auto';
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <nav className="w-full flex flex-col lg:flex-row lg:h-[50px] border-b-2 relative z-40">

            {/* Название - сверху на мобильных, по центру на десктопе */}
            <div className="flex flex-row items-center justify-center lg:justify-center flex-1 px-3 bg-blue-800 h-[40px] lg:h-[50px] order-1 lg:order-2">
                <div className="flex items-center font-medium text-white h-8">
                    <span className="font-medium text-white px-3 text-sm lg:text-base">
                        Автоматизация производства<span className="mx-2">|</span>{process.env.REACT_APP_PRODUCTION_BRANCH_NAME}
                    </span>

                </div>
                {/* Авторизация на десктопе справа от названия */}
                <div className="hidden lg:flex items-center ml-auto">
                    <AuthLabel loginPath={'/login'} logoutPath={'/login'}/>
                </div>
            </div>

            {/* Нижняя строка на мобильных / левая часть на десктопе */}
            <div className="flex flex-row justify-between items-center h-12 lg:h-[50px] w-full lg:w-auto px-2 bg-gray-50 lg:bg-gray-50 flex-shrink-0 order-2 lg:order-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClickMenu}
                        className="lg:hidden p-2 hover:bg-gray-200 rounded-md transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"/>
                            )}
                        </svg>
                    </button>

                    <div className="w-[160px] lg:pt-2 lg:px-4">
                        <img src="/newpng.png" className="w-28" alt="Logo"/>
                    </div>
                </div>

                {/* Авторизация на мобильных */}
                <div className="flex items-center lg:hidden">
                    <div className="flex items-center bg-gray-50 rounded mr-2 ">
                        <AuthLabel loginPath={'/login'} logoutPath={'/login'}/>
                    </div>
                </div>
            </div>

            {/* Мобильное меню */}
            <div className={`
                lg:hidden fixed inset-0 top-[80px] z-50
                transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleClickMenu}
                />

                <div className={`
                    absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div
                        className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Меню</span>
                        <button
                            onClick={handleClickMenu}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div className="py-2">
                        <LeftNavigation onItemClick={handleMenuItemClick}/>
                    </div>
                </div>
            </div>
        </nav>
    )
}