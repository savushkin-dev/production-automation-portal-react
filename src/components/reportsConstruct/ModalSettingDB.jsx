import {styleInput, styleLabelInput} from "../../data/styles";
import React, {useEffect, useState} from "react";
import {CustomStyle} from "../../data/styleForSelect";
import Select from "react-select";
import {GrayButton} from "./buttons/GrayButton";
import {WhiteButton} from "./buttons/WhiteButton";

export function ModalSettingDB({ onChangeField, onClose, url, username, password, driverClassName}) {


    let options = [
        {value: "org.postgresql.Driver", label: "PostgreSQL"},
        {value: "com.microsoft.sqlserver.jdbc.SQLServerDriver", label: "SQL Server"},
        // {value: "My SQL", label: "My SQL"}
    ]

    const [selectValue, setSelectValue] = useState(options[0]);

    const handleChangeSelect = (event) => {
        if (event != null) {
            setSelectValue(event);
            onChangeField('driverClassName', event.value)
        } else {
            setSelectValue(options[1]);
            onChangeField('driverClassName', options[1].value)
        }
    };

    const setValueSelect = (driverOld) => {
        let x = options.find(x => x.value === driverOld)
        setSelectValue(x);
    }

    useEffect(() => {
        setValueSelect(driverClassName);
    },[])

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30 rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8"
            >
                <h1 className="text-2xl font-medium text-start mb-6">Настройка источника данных</h1>
                <div className="flex flex-col">
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>URL</span>
                        <input
                            className={styleInput + "w-80"}
                            value={url}
                            onChange={(e) => onChangeField('url', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>Username</span>
                        <input
                            className={styleInput + "w-80"}
                            value={username}
                            onChange={(e) => onChangeField('username', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>Password</span>
                        <input
                            className={styleInput + "w-80"}
                            type="password"
                            value={password}
                            onChange={(e) => onChangeField('password', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center">
                        <span className={styleLabelInput + "w-20 mr-2"}>Database</span>
                        <Select className="text-sm font-medium w-80"
                                placeholder={"Все статусы"}
                                value={selectValue}
                                onChange={handleChangeSelect}
                                styles={CustomStyle }
                                options={options}
                                isClearable={false} isSearchable={false}/>
                    </div>

                    <div className="flex flex-row justify-end mt-4">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <WhiteButton onClick={onClose} text={"Закрыть"}/>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}