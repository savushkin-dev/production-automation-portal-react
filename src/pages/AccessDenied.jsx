import {observer} from "mobx-react-lite";
import {useNavigate} from "react-router-dom";
import React from "react";


function AccessDenied() {
    const navigate = useNavigate();

    return (
        <>
            <div className="bg-gray-50 flex flex-col h-screen justify-center items-center">
                <span className="text-9xl font-bold ">
                    403
                </span>
                <span className="text-xl font-bold ">
                    У вас недостаточно прав для доступа к этому ресурсу!
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

export default observer(AccessDenied)