import React, { useState } from 'react'
import {CustomStyle} from "../../data/styleForSelect";
import Select from "react-select";
import {styleInput, styleInputWithoutRounded} from "../../data/styles";

export function ModalVersionSettings({ onClose, onSaveVersion, onLoadVersion, versionsList = [] }) {
    const [mode, setMode] = useState('save');
    const [versionName, setVersionName] = useState('');
    const [selectedVersion, setSelectedVersion] = useState(null); // ← null вместо {}

    const demoVersions = [
        { value: 'План на апрель 2026 (v1)', label: 'План на апрель 2026 (v1)' },
        { value: 'Версия от 20.04.2026', label: 'Версия от 20.04.2026' },
    ];

    const actualVersionsList = versionsList.length > 0 ? versionsList : demoVersions;

    const handleSave = () => {
        if (versionName.trim()) {
            onSaveVersion?.(versionName);
            onClose();
        }
    };

    const handleLoad = () => {
        if (selectedVersion?.value) {  // ← проверка наличия value
            onLoadVersion?.(selectedVersion.value);
            onClose();
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-100 pointer-events-none" style={{zIndex: 100}}>
                <div className="w-[520px] bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200">

                    {/* Header с градиентом */}
                    <div className="relative px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                        <div className="pr-8">
                            <h2 className="text-xl font-bold text-slate-800">Управление версиями планов</h2>
                            <p className="text-sm text-slate-500 mt-1">Сохраните текущий план или загрузите ранее сохранённый</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Toggle Switch стиль */}
                    <div className="px-6 pt-6 pb-3">
                        <div className="bg-slate-100 rounded-xl p-1 flex">
                            <button
                                onClick={() => setMode('save')}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    mode === 'save'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Сохранить
                                </span>
                            </button>
                            <button
                                onClick={() => setMode('load')}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    mode === 'load'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Загрузить
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        {mode === 'save' ? (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">
                                    Название версии для сохранения
                                </label>
                                <input className={styleInput + " font-medium mr-0 w-full"}
                                       value={versionName}
                                       onChange={(e) => setVersionName(e.target.value)}
                                       placeholder="Например: План v4"
                                       // autoFocus
                                />
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    Сохраните текущую версию плана с уникальным названием
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">
                                    Выберите версию для загрузки
                                </label>
                                <div className="relative">
                                    <Select
                                        className="text-sm font-medium"
                                        placeholder={"Выберите версию плана"}
                                        value={selectedVersion}
                                        onChange={(option) => setSelectedVersion(option)}
                                        styles={CustomStyle}
                                        options={actualVersionsList}
                                        isClearable={true}
                                        isSearchable={false}
                                        noOptionsMessage={() => "Нет сохраненных версий"}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    Выберите версию для работы с соответствующим планом
                                </p>
                                {actualVersionsList.length === 0 && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                        Нет сохранённых версий
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={mode === 'save' ? handleSave : handleLoad}
                            disabled={mode === 'save' ? !versionName.trim() : !selectedVersion?.value}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-sm ${
                                (mode === 'save' ? !versionName.trim() : !selectedVersion?.value)
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 hover:shadow-md active:scale-[0.98]'
                            }`}
                        >
                            {mode === 'save' ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Сохранить
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Загрузить
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}