import React, {useEffect, useState} from 'react'
import {CustomStyle} from "../../data/styleForSelect";
import Select from "react-select";
import {styleInput} from "../../data/styles";
import SchedulerService from "../../services/ScheduleService";

export function ModalVersionSettings({ date, onClose, onInit, onFetchPlan, setModalError, setErrorMsg, setPlanVersion}) {
    const [mode, setMode] = useState('save');
    const [versionName, setVersionName] = useState('');
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [versionList, setVersionList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleSave = async () => {
        await saveVersion(date, versionName.trim())
    };

    const handleLoad = async () => {
        let success;
        if(selectedVersion.value === "#main_plan#") {
            setIsLoading(true)
            success = await onInit(date)
            setIsLoading(false)
        } else {
            success = await initVersion(date, selectedVersion.value);
        }

        if (success && selectedVersion?.value) {
            setPlanVersion(selectedVersion.label); // Обновляем название версии при успехе
        }
    };

    useEffect(()=>{
        fetchVersionList();
    },[])

    async function fetchVersionList() {
        try {
            const response = await SchedulerService.getVersionList(date)

            setVersionList([
                { value: '#main_plan#', label: 'Основной план' },
                ...response.data.map(v => ({ value: v, label: v }))
            ]);
        } catch (e) {
            setErrorMsg("Не удалось получить список версий плана: " + e.response.data.message)
            setModalError(true);
        }
    }

    async function saveVersion(date, versionName) {
        try {
            setIsLoading(true);
            await SchedulerService.saveVersion(date, versionName)
            setNotification({ message: 'Версия успешно сохранена!', type: 'success' });
            setTimeout(() => {setNotification({ message: '', type: '' })}, 3000);
        } catch (e) {
            setErrorMsg("Не удалось сохранить план: " + e.response.data.message)
            setModalError(true);
        } finally {
            setIsLoading(false);
            await fetchVersionList();
        }
    }

    async function initVersion(date, versionName) {
        try {
            setIsLoading(true);
            await SchedulerService.initVersion(date, versionName)
            setNotification({ message: 'Версия успешно загружена!', type: 'success' });
            setTimeout(() => {setNotification({ message: '', type: '' })}, 3000);
            return true;
        } catch (e) {
            setErrorMsg("Не удалось загрузить план: " + e.response.data.message)
            setModalError(true);
            return false;
        } finally {
            await onFetchPlan();
            setIsLoading(false);
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{zIndex: 99}}
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-100 pointer-events-none" style={{zIndex: 100}}>
                <div className="w-[520px] bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200">

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

                    <div className="px-6 pb-6">
                        {mode === 'save' ? (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">
                                    Название версии для сохранения
                                </label>
                                <input className={styleInput + " font-medium mr-0 w-full"}
                                       value={versionName}
                                       onChange={(e) => setVersionName(e.target.value)}
                                       placeholder="Пример: План v4"
                                       // autoFocus
                                />
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    Сохраните текущую версию плана или перезапишите существующую
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
                                        options={versionList}
                                        isClearable={true}
                                        isSearchable={false}
                                        noOptionsMessage={() => "Нет сохраненных версий"}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    Выберите версию для работы с соответствующим планом
                                </p>
                                {versionList.length === 1 && (
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

                    <div className="flex justify-between  px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <div>
                            {/* Уведомление */}
                            {notification.message && (
                                <div className={` rounded-lg text-sm ${
                                    notification.type === 'success'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}>
                                    <span className="flex items-center gap-2 my-2 ">
                                        {notification.type === 'success' ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {notification.message}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
                            >
                                Закрыть
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

                                    {isLoading ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                    )}
                                        Сохранить
                                </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                    {isLoading ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                    )}
                                        Загрузить
                                </span>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}