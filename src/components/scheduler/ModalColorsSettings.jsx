import React, { useState, useEffect } from 'react'
import { DEFAULT_COLORS, DEFAULT_WIDTHS, STORAGE_KEYS } from "./utils/colorsUtils";

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
                className="fixed bg-black/50 top-0 right-0 left-0 bottom-0"
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
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded border border-gray-300"
                                        style={{ backgroundColor: leftBorderColor }}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Цвет левой границы
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Для элементов очистки с задержкой (cleaningDelay &lt; 0)
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="color"
                                    value={leftBorderColor}
                                    onChange={(e) => setLeftBorderColor(e.target.value)}
                                    className="w-12 h-10 cursor-pointer rounded border border-gray-300"
                                />
                            </div>
                            <div className="flex items-center justify-between ml-11">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Толщина границы (px)
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Рекомендуемые значения: 2-5px
                                    </p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={leftBorderWidth}
                                    onChange={(e) => setLeftBorderWidth(e.target.value)}
                                    className="w-20 h-10 px-2 rounded border border-gray-300 text-center"
                                />
                            </div>
                        </div>

                        <hr className="my-3"/>

                        {/* Нижняя граница (выбранная дата) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded border border-gray-300"
                                        style={{ backgroundColor: bottomBorderColor }}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Цвет нижней границы
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Для элементов с выбранной датой (dti совпадает с selectDate)
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="color"
                                    value={bottomBorderColor}
                                    onChange={(e) => setBottomBorderColor(e.target.value)}
                                    className="w-12 h-10 cursor-pointer rounded border border-gray-300"
                                />
                            </div>
                            <div className="flex items-center justify-between ml-11">
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
                                    className="w-20 h-10 px-2 rounded border border-gray-300 text-center"
                                />
                            </div>
                        </div>

                        {/* Предпросмотр */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 mb-2">Предпросмотр:</p>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-20 h-8 border border-gray-400"
                                        style={{
                                            borderLeftColor: leftBorderColor,
                                            borderLeftWidth: `${leftBorderWidth}px`
                                        }}
                                    />
                                    <span className="text-xs">Задержка</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-20 h-8 border border-gray-400"
                                        style={{
                                            borderBottomColor: bottomBorderColor,
                                            borderBottomWidth: `${bottomBorderWidth}px`
                                        }}
                                    />
                                    <span className="text-xs">Выбранная дата</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row justify-end gap-2 mt-4">
                        <button
                            onClick={handleReset}
                            className="min-w-[70px] px-2 h-8 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-100"
                        >
                            Сбросить
                        </button>
                        <button
                            onClick={onClose}
                            className="min-w-[70px] px-2 h-8 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            className="min-w-[70px] px-2 h-8 rounded text-xs font-medium shadow-sm bg-blue-500 text-white hover:bg-blue-600 border-none"
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}