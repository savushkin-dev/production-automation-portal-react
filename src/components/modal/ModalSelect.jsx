import React, {useState} from 'react';
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";
import {WhiteButton} from "../reportsConstruct/buttons/WhiteButton";
import {BlueButton} from "../reportsConstruct/buttons/BlueButton";

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
                    <div className="flex flex-row justify-end mt-5 gap-2">
                        <WhiteButton onClick={onClose} text={"Отмена"}/>
                        <BlueButton onClick={handleAgreement} text={"Выбрать"} disabled={!selectValue}/>
                    </div>
                </div>
            </div>
        </>
    );
}