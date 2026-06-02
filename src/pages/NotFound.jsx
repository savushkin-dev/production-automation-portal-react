import {observer} from "mobx-react-lite";
import React from "react";
import {useNavigate} from "react-router-dom";


function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <div className="bg-gray-50 flex flex-col h-screen justify-center items-center">
                <span className="text-9xl font-bold ">
                    404
                </span>
                <span className="text-xl font-bold">
                    Ресурс не найден!
                </span>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600"
                >
                    На главную
                </button>
            </div>
        </>
    )
}

export default observer(NotFound)