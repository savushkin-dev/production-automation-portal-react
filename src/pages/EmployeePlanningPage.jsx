import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useContext, useState} from "react";
import {ModalNotifyError} from "../components/modal/ModalNotifyError";
import {observer} from 'mobx-react-lite';
import {ModalNotify} from "../components/modal/ModalNotify";
import {useNavigate} from "react-router-dom";
import {Context} from "../index";

function EmployeePlanningPage() {

    const {store} = useContext(Context);

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState("");
    const [isModalError, setIsModalError] = useState(false);
    const [isModalNotify, setIsModalNotify] = useState(false);




    return (<>
        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
        }}/>
        <div className="flex flex-row window-height">
            <div className="hidden lg:block w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>
            <div className="flex flex-col w-full">

                <>
                    <div
                        className="px-1 lg:px-16 pt-6 pb-2 flex flex-row gap-2 items-center justify-between text-center">
                        <span className="text-2xl font-bold">Планирование персонала</span>

                        <div className="flex flex-row gap-3">

                        </div>

                    </div>

                    {/* Фильтры */}
                    <div className="px-1 lg:px-24 pb-2">

                    </div>



                </>

                {isModalError &&
                    <ModalNotifyError title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}
                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}
            </div>
        </div>
    </>);
}

export default observer(EmployeePlanningPage);