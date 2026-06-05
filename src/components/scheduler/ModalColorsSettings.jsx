import React, { useState, useEffect } from 'react'
import { DEFAULT_COLORS, DEFAULT_WIDTHS, STORAGE_KEYS } from "./utils/colorsUtils";
import {GrayButton} from "./buttons/GrayButton";
import {BlueButton} from "./buttons/BlueButton";

export function ModalColorsSettings({ onClose, onSave }) {
    const [leftBorderColor, setLeftBorderColor] = useState(DEFAULT_COLORS.leftBorder)
    const [bottomBorderColor, setBottomBorderColor] = useState(DEFAULT_COLORS.bottomBorder)
    const [leftBorderWidth, setLeftBorderWidth] = useState(DEFAULT_WIDTHS.leftBorder)
    const [bottomBorderWidth, setBottomBorderWidth] = useState(DEFAULT_WIDTHS.bottomBorder)

    // Загрузка сохраненных значений при открытии
    useEffect(() => {
        const savedLeftColor = localStorage.getItem(STORAGE_KEYS.LEFT_BORDER_COLOR)
        const savedBottomColor = localStorage.getItem(STORAGE_KEYS.BOTTOM_BORDER_COLOR)
        const savedLeftWidth = localStorage.getItem(STORAGE_KEYS.LEFT_BORDER_WIDTH)
        const savedBottomWidth = localStorage.getItem(STORAGE_KEYS.BOTTOM_BORDER_WIDTH)

        if (savedLeftColor) setLeftBorderColor(savedLeftColor)
        if (savedBottomColor) setBottomBorderColor(savedBottomColor)
        if (savedLeftWidth) setLeftBorderWidth(savedLeftWidth)
        if (savedBottomWidth) setBottomBorderWidth(savedBottomWidth)
    }, [])

    // Сохранение настроек
    const handleSave = () => {
        localStorage.setItem(STORAGE_KEYS.LEFT_BORDER_COLOR, leftBorderColor)
        localStorage.setItem(STORAGE_KEYS.BOTTOM_BORDER_COLOR, bottomBorderColor)
        localStorage.setItem(STORAGE_KEYS.LEFT_BORDER_WIDTH, leftBorderWidth)
        localStorage.setItem(STORAGE_KEYS.BOTTOM_BORDER_WIDTH, bottomBorderWidth)

        if (onSave) {
            onSave();
        }
        onClose();
    }

    // Сброс к стандартным значениям
    const handleReset = () => {
        setLeftBorderColor(DEFAULT_COLORS.leftBorder)
        setBottomBorderColor(DEFAULT_COLORS.bottomBorder)
        setLeftBorderWidth(DEFAULT_WIDTHS.leftBorder)
        setBottomBorderWidth(DEFAULT_WIDTHS.bottomBorder)
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ zIndex: 99 }}
                onClick={onClose}
            />
            <div
                className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                style={{ zIndex: 100 }}
            >
                <div className="w-auto min-w-[550px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Настройки цветов планировщика</h1>
                    <hr className="mb-4"/>

                    <div className="my-3 space-y-4">
                        {/* Левая граница (мойка) */}
                        <div className="">
                            <span className="text-sm font-medium text-gray-700">Индикатор мойки длительность которой короче плана</span>
                            <div className="flex flex-row ">
                                <div className="w-1/3 flex items-center pl-8">
                                    {/* Элемент предпросмотра левой границы */}
                                    <div
                                        className="w-16 h-8 border border-gray-400 bg-white"
                                        style={{
                                            borderLeftColor: leftBorderColor,
                                            borderLeftWidth: `${leftBorderWidth}px`
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-2/3 gap-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Цвет левой границы
                                            </label>
                                        </div>
                                        <input
                                            type="color"
                                            value={leftBorderColor}
                                            onChange={(e) => setLeftBorderColor(e.target.value)}
                                            className="w-14 h-8 cursor-pointer rounded border border-gray-300"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Толщина границы (px)
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Рекомендуемые значения: 1-4px
                                            </p>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={leftBorderWidth}
                                            onChange={(e) => setLeftBorderWidth(e.target.value)}
                                            className="w-14 h-8 px-2 rounded border border-gray-300 text-center"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <hr className="my-3"/>

                        {/* Нижняя граница (выбранная дата) */}
                        <div className="">
                            <span
                                className="text-sm font-medium text-gray-700">Индикатор заявки на выбранную дату</span>
                            <div className="flex flex-row">
                                <div className="w-1/3 flex items-center pl-8">
                                    {/* Элемент предпросмотра нижней границы */}
                                    <div
                                        className="w-16 h-8 border border-gray-400 bg-white"
                                        style={{
                                            borderBottomColor: bottomBorderColor,
                                            borderBottomWidth: `${bottomBorderWidth}px`
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col w-2/3 gap-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Цвет нижней границы
                                            </label>
                                        </div>
                                        <input
                                            type="color"
                                            value={bottomBorderColor}
                                            onChange={(e) => setBottomBorderColor(e.target.value)}
                                            className="w-14 h-8 cursor-pointer rounded border border-gray-300"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Толщина границы (px)
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Рекомендуемые значения: 1-4px
                                            </p>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={bottomBorderWidth}
                                            onChange={(e) => setBottomBorderWidth(e.target.value)}
                                            className="w-14 h-8 px-2 rounded border border-gray-300 text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <hr className=""/>

                    <div className="flex flex-row justify-end gap-2 mt-4">
                        <GrayButton text={"Сбросить"} onClick={handleReset}/>
                        <GrayButton text={"Отмена"} onClick={onClose} className={""}/>
                        <BlueButton text={"Сохранить"} onClick={handleSave} className={""}/>
                    </div>
                </div>
            </div>
        </>
    )
}