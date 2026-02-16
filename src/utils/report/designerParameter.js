import {styleInput, styleLabelInput} from "../../data/styles";
import React from "react";


export const COLS = 120;
export const ROW_HEIGHT = 10;
export const ITEM_WIDTH = 18; // ширина элемента
export const ITEM_HEIGHT = 6; // ширина элемента

export const createDefaultLayout = (parameters) => {
    return parameters.map((param, index) => {
        const itemsPerRow = Math.floor(COLS / ITEM_WIDTH);
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        return {
            i: param.key,
            x: col * ITEM_WIDTH,
            y: row * ITEM_HEIGHT,
            w: ITEM_WIDTH,
            h: ITEM_HEIGHT,
            minW: 3,
            minH: 3
        };
    });
};

export const renderField = (param, values, handleChange) => {
    switch (param.type) {
        case "TEXT":
            return (
                <div key={param.key} className="col-span-2 rounded-lg p-2 flex flex-col">
                    <label className={styleLabelInput}>{param.name}</label>
                    <input
                        className={styleInput}
                        type="text"
                        value={values[param.key] || param.defaultValue || ''}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            );
        case "NUMBER":
            return (
                <div key={param.key} className=" rounded-lg p-2 flex flex-col">
                    <label className={styleLabelInput}>{param.name}</label>
                    <input
                        className={styleInput}
                        type="number"
                        value={values[param.key] || param.defaultValue || ''}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            )
        case "DATE":
            return (
                <div key={param.key} className="col-span-2 rounded-lg p-2 flex flex-col">
                    <label className={styleLabelInput}>{param.name}</label>
                    <input
                        className={styleInput}
                        type="date"
                        value={values[param.key] || ''}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            )
        case "BOOLEAN":
            return (
                <div key={param.key} className=" rounded-lg p-2 flex flex-col ">
                    <label className={styleLabelInput}>{param.name}</label>
                    <input
                        className={"hover:border-blue-800 bg-blue-800 hover:bg-blue-800 outline-blue-800 h-[18px] my-1 w-[30px] ml-2"}
                        type="checkbox"
                        checked={values[param.key] || param.defaultValue === false}
                        onChange={(e) => handleChange(param.key, e.target.checked)}
                    />
                </div>
            )
        default:
            return (
                <div className="text-gray-500 text-sm">
                    Неизвестный тип параметра: {param.type}
                </div>
            );
    }
};