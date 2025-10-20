import React, {useState} from 'react'
import {styleInput, styleLabelInput} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";

export function ModalSelect({title, message, onClose, onAgreement, options}) {

    const [selectValue, setSelectValue] = useState(options[0]);


    const handleChangeSelect = (event) => {
        if (event != null) {
            setSelectValue(event);
        } else {
            setSelectValue(options[1]);
        }
    };



    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30 rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8" style={{zIndex: 100}}
            >
                <h1 className="text-2xl font-medium text-start mb-6">{title}</h1>
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <span className={styleLabelInput}>Выберите шаблон отчета</span>
                        <Select className="text-sm font-medium "
                                placeholder={"Все статусы"}
                                value={selectValue}
                                onChange={handleChangeSelect}
                                styles={CustomStyle}
                                options={options}
                                isClearable={false} isSearchable={false}/>
                    </div>
                    <div className="flex flex-row justify-end mt-4">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Отмена
                            </button>
                            <button onClick={() => {onAgreement(selectValue.value)}}
                                    className="min-w-[50px] text-xs h-7 font-medium px-2 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                                Выбрать
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}