import {styleInput, styleInputWithoutRounded, styleLabelInput} from "../../data/styles";
import Select from "react-select";
import {CustomStyle, CustomStyleWithoutRounded} from "../../data/styleForSelect";
import React, {useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';

export function ModalSQL({value, parameters, isValid, onChange, onClose, setParameters}) {


    const updateParameter = (key, field, value) => {
        if (field === "type") {
            setParameters(parameters.map(p =>
                p.key === key ? {...p, [field]: value.value} : p
            ));
            return;
        }

        setParameters(parameters.map(p =>
            p.key === key ? {...p, [field]: value} : p
        ));
    };

    const addParameter = (key) => {
        setParameters([...parameters, {
            id: uuidv4(), // Генерирует уникальный ID
            order: parameters.length,
            name: '',
            key: key,
            type: 'TEXT',
            default: ''
        }]);
    };


    const findAndAddParameters = (inputString) => {
        const wordsStartingWithColon = inputString.match(/@(\w+)/g) || [];
        const keys = wordsStartingWithColon.map(word => word.substring(1));
        keys.forEach(key => {
            const keyExists = parameters.some(param => param.key === key);
            if (!keyExists) {
                addParameter(key);
            }
        });
    };

    const removeUnusedParameters = (sqlString) => {
        const usedKeys = (sqlString.match(/@(\w+)/g) || []).map(word => word.substring(1));
        setParameters(prevParams =>
            prevParams.filter(param => usedKeys.includes(param.key))
        );
    };

    function onChangeSql(e) {
        onChange(e);
        findAndAddParameters(e.target.value);
        removeUnusedParameters(e.target.value);
    }

    const options = [
        {
            value: 'TEXT',
            label: 'Текст'
        },
        {
            value: 'NUMBER',
            label: 'Число'
        },
        {
            value: 'DATE',
            label: 'Дата'
        },
        {
            value: 'BOOLEAN',
            label: 'Да/Нет'
        },
    ]

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[900px] lg:w-[900px] p-5 z-30 rounded bg-white absolute top-[15%] left-1/2 -translate-x-1/2 px-8">
                <h1 className="text-2xl font-medium text-start mb-5">Запрос SQL для данных отчета</h1>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-2">В текстовом поле требуется ввести SQL запрос. Далее запрашиваемые данные могут быть использованы в отчете.
                    Параметры задаются с помощью символа собака '@parameter', затем требуется настроить описание этих параметров в окне "Параметры запроса". Пример - SELECT * FROM PRODUCT WHERE ID = @id;
                    </span>

                    <div className="flex flex-col ">
                        <span className={styleLabelInput}>SQL</span>
                        <textarea
                            className={styleInput + " min-h-[200px] text-orange-700 font-medium"}
                            value={value}
                            onChange={onChangeSql}
                        />
                    </div>


                </div>
                <h1 className="text-2xl font-medium text-start mt-2 mb-3">Параметры запроса</h1>

                <div className="flex flex-row mb-1">
                    <span className="text-sm text-center font-medium w-[10%]">Пор.№</span>
                    <span className="text-sm text-center font-medium w-1/4">Название параметра</span>
                    <span className="text-sm text-center font-medium w-1/4">Параметр</span>
                    <span className="text-sm text-center font-medium w-1/4">Тип</span>
                    <span className="text-sm text-center font-medium w-1/4">Знач. по умолчанию</span>
                </div>

                <div className="max-h-36 overflow-auto">
                    {parameters.map((param,index) => (
                        <div key={param.id} className="flex flex-row py-0">
                            <input
                                className={styleInputWithoutRounded + " font-medium w-[10%]"}
                                type="number" min={1}
                                value={param.order}
                                onChange={(e) => updateParameter(param.id, 'order', e.target.value)}
                            />
                            <input className={styleInputWithoutRounded + " font-medium mr-0 w-1/4"}
                                   value={param.name}
                                   onChange={(e) => {
                                       updateParameter(param.key, 'name', e.target.value);
                                   }}
                                   placeholder="Название параметра"
                            />
                            <input className={styleInputWithoutRounded + " font-medium mr-0 w-1/4"}
                                   value={param.key}
                                   onChange={(e) => updateParameter(param.key, 'key', e.target.value)}
                                   placeholder="Параметр (:param)"
                            />

                            <Select className="text-sm font-medium w-1/4 mr-0"
                                    placeholder={"Тип параметра"}
                                    value={{
                                        value: param.type,
                                        label: options.find(option => option.value === param.type)?.label || null
                                    }}
                                    onChange={(e) => updateParameter(param.key, 'type', e)}
                                    styles={CustomStyleWithoutRounded}
                                    options={options}
                                    menuPortalTarget={document.body}
                                    isClearable={false} isSearchable={false}/>


                            {param.type === "TEXT" &&
                                <input
                                    className={styleInputWithoutRounded + " font-medium w-1/4"}
                                    type="text"
                                    value={param.default}
                                    onChange={(e) => updateParameter(param.key, 'default', e.target.value)}
                                />
                            }

                            {param.type === "NUMBER" &&
                                <input
                                    className={styleInputWithoutRounded + " font-medium w-1/4"}
                                    type="number"
                                    value={param.default}
                                    onChange={(e) => updateParameter(param.key, 'default', e.target.value)}
                                />
                            }

                            {param.type === "DATE" &&
                                <div style={{display: 'flex', alignItems: 'center'}} className="font-medium w-1/4">
                                    <input className={styleInputWithoutRounded + " w-[100%]"}
                                           type="date"
                                           value={param.default === true ? "" : param.default || ""}
                                           onChange={(e) => updateParameter(param.key, 'default', e.target.value || "")}
                                           style={{
                                               paddingRight: '40%',
                                           }}
                                    />
                                    <span className="text-xs" style={{
                                        marginLeft: '-70px',
                                        cursor: 'pointer',
                                    }}>
                                        Текущая
                                    </span>
                                    <input className={styleInputWithoutRounded}
                                           type="checkbox"
                                           checked={param.default === true}
                                           onChange={(e) => updateParameter(param.key, 'default', e.target.checked || "")}
                                           style={{
                                               marginLeft: '5px',
                                               cursor: 'pointer',
                                           }}
                                    />

                                </div>
                            }

                            {param.type === "BOOLEAN" &&
                                <div className=" w-1/4 text-center border border-slate-400">
                                    <input
                                        className="h-full w-[16px] cursor-pointer"
                                        type="checkbox"
                                        checked={param.default}
                                        onChange={(e) => updateParameter(param.key, 'default', e.target.checked)}
                                    />
                                </div>
                            }

                        </div>
                    ))}
                </div>

                <div className="flex flex-row justify-end mt-4">
                    <div className="flex flex-row w-full justify-between items-center bg-white my-2 ">
                        <div>
                            {!isValid &&
                                <span className="text-sm font-medium text-red-600">Некорректный SQL!</span>
                            }
                        </div>
                        <button
                            onClick={onClose}
                            className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}