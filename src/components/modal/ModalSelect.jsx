import React, {useState} from 'react';
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";

export function ModalSelect({title, onClose, onAgreement, options}) {
    const [selectValue, setSelectValue] = useState(null);

    const handleAgreement = () => {
        if (selectValue) {
            const parsed = JSON.parse(selectValue.value);
            onAgreement(parsed.name, parsed.category);
        }
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                style={{zIndex: 99}}
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] p-5 z-30 rounded bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8"
                style={{zIndex: 100}}
            >
                <h1 className="text-2xl font-medium text-start mb-6">{title}</h1>
                <div className="flex flex-col">
                    <span className="text-sm font-medium mb-2">Выберите шаблон отчета</span>
                    <Select
                        placeholder="Введите текст для поиска..."
                        value={selectValue}
                        onChange={setSelectValue}
                        styles={CustomStyle}
                        options={options}
                        isSearchable={true}
                        noOptionsMessage={() => "Отчеты не найдены"}
                    />
                    <div className="flex flex-row justify-end mt-4">
                        <button onClick={onClose}
                                className="px-4 mx-2 h-8 rounded text-sm font-medium border border-slate-400 hover:bg-gray-200">
                            Отмена
                        </button>
                        <button onClick={handleAgreement}
                                disabled={!selectValue}
                                className={`px-4 text-sm h-8 font-medium rounded text-white 
                                    ${selectValue ? 'bg-blue-800 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                            Выбрать
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}