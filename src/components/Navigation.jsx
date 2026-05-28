import React, {useContext, useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {arrowDown, arrowUp} from "../data/icons";
import {Context} from "../index";
import RoleGuard from "./RoleGuard";
import AuthLabel from "./AuthLabel";



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
                <div className="flex flex-row h-full font-medium w-full px-3 text-white items-center bg-blue-800">
                    <span className="font-medium text-white px-3 ">Автоматизация производства</span>

                    <span className="mx-1 text-white">|</span>
                    <span className="text-white font-medium px-3">
                        {process.env.REACT_APP_PRODUCTION_BRANCH_NAME}
                    </span>

                </div>
            </div>

            <div className="flex h-10 w-3/12 lg:h-auto lg:w-auto justify-end items-center bg-blue-800">
                <div className="flex h-10 lg:h-auto lg:w-auto justify-end items-center bg-gray-50 rounded mr-4">
                    <AuthLabel loginPath={'/login'} logoutPath={'/login'}/>
                </div>
            </div>

        </nav>
    )
}