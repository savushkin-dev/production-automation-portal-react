import React, { useState, useEffect } from "react";
import { ModalNotify } from "../modal/ModalNotify";

export function GlobalVars({ onClose }) {
    const [variables, setVariables] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ key: '', value: '', description: '' });
    const [keyError, setKeyError] = useState('');

    // Генерация простого ID
    const generateId = () => {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    };

    // Загрузка демо-данных
    useEffect(() => {
        setVariables([
            { id: generateId(), key: 'companyName', value: 'ООО "Ромашка"', description: 'Название компании' },
            { id: generateId(), key: 'currentYear', value: '2026', description: 'Текущий год' },
            { id: generateId(), key: 'currency', value: '₽', description: 'Валюта отчетов' },
            { id: generateId(), key: 'directorName', value: 'Иванов И.И.', description: 'ФИО директора' },
        ]);
    }, []);

    // Фильтрация переменных по поиску
    const filteredVars = variables.filter(v =>
        v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Проверка уникальности ключа
    const isKeyUnique = (key, excludeId = null) => {
        return !variables.some(v =>
            v.id !== excludeId && v.key.toLowerCase() === key.trim().toLowerCase()
        );
    };

    // Обработчик изменения ключа с валидацией
    const handleKeyChange = (e) => {
        const newKey = e.target.value;
        setEditForm({...editForm, key: newKey});

        if (!newKey.trim()) {
            setKeyError('Ключ не может быть пустым');
        } else if (!isKeyUnique(newKey, editingId)) {
            setKeyError('Переменная с таким ключом уже существует');
        } else {
            setKeyError('');
        }
    };

    // Добавление новой переменной
    const addVariable = () => {
        const newVar = {
            id: generateId(),
            key: '',
            value: '',
            description: '',
            isNew: true
        };
        setVariables([newVar, ...variables]);
        setEditingId(newVar.id);
        setEditForm({ key: '', value: '', description: '' });
        setKeyError('');
    };

    // Начало редактирования
    const startEditing = (variable) => {
        setEditingId(variable.id);
        setEditForm({
            key: variable.key,
            value: variable.value,
            description: variable.description || ''
        });
        setKeyError('');
    };

    // Сохранение редактирования
    const saveEditing = () => {
        if (!editForm.key.trim()) {
            setModalMsg("Ключ переменной не может быть пустым");
            setIsModalNotify(true);
            return;
        }

        if (!isKeyUnique(editForm.key, editingId)) {
            setModalMsg("Переменная с таким ключом уже существует");
            setIsModalNotify(true);
            return;
        }

        setVariables(variables.map(v =>
            v.id === editingId
                ? {
                    ...v,
                    key: editForm.key.trim(),
                    value: editForm.value,
                    description: editForm.description,
                    isNew: false
                }
                : v
        ));
        setEditingId(null);
        setEditForm({ key: '', value: '', description: '' });
        setKeyError('');
    };

    // Отмена редактирования
    const cancelEditing = () => {
        if (editingId) {
            // Если это была новая запись - удаляем её
            const variable = variables.find(v => v.id === editingId);
            if (variable?.isNew) {
                setVariables(variables.filter(v => v.id !== editingId));
            }
        }
        setEditingId(null);
        setEditForm({ key: '', value: '', description: '' });
        setKeyError('');
    };

    // Удаление переменной
    const deleteVariable = (id) => {
        setVariables(variables.filter(v => v.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setEditForm({ key: '', value: '', description: '' });
            setKeyError('');
        }
    };

    // Сохранение всех изменений
    const saveAllChanges = () => {
        // Проверяем, нет ли незавершенного редактирования
        if (editingId) {
            setModalMsg("Завершите редактирование текущей переменной");
            setIsModalNotify(true);
            return;
        }

        // Проверяем, что все ключи заполнены
        const emptyKeys = variables.filter(v => !v.key.trim());
        if (emptyKeys.length > 0) {
            setModalMsg("У всех переменных должны быть заполнены ключи");
            setIsModalNotify(true);
            return;
        }

        // Проверяем уникальность ключей
        const keys = variables.map(v => v.key.toLowerCase());
        const hasDuplicates = keys.some((key, index) => keys.indexOf(key) !== index);

        if (hasDuplicates) {
            setModalMsg("Обнаружены дубликаты ключей переменных");
            setIsModalNotify(true);
            return;
        }

        setModalMsg("Глобальные переменные успешно сохранены");
        setIsModalNotify(true);

        // Здесь можно добавить сохранение в localStorage или передачу в родительский компонент
        console.log('Сохраненные переменные:', variables);
    };

    // Рендер строки таблицы в режиме просмотра
    const renderViewRow = (variable) => (
        <div key={variable.id} className="flex flex-row py-2 border-b border-gray-100 hover:bg-gray-50 group">
            <div className="w-[5%] flex items-center justify-center">
                <span className="text-gray-400 pl-3">•</span>
            </div>
            <div className="w-[25%] px-2 font-medium text-gray-700 truncate" title={variable.key}>
                {variable.key}
            </div>
            <div className="w-[30%] px-2 text-gray-600 truncate" title={variable.value}>
                {variable.value}
            </div>
            <div className="w-[30%] px-2 text-gray-500 text-sm truncate" title={variable.description}>
                {variable.description || '—'}
            </div>
            <div className="w-[10%] px-2 flex items-center justify-center gap-8 transition-opacity">
                <button
                    onClick={() => startEditing(variable)}
                    className="text-gray-500 hover:text-gray-800"
                    title="Редактировать"
                >
                    <i className="text-lg fa-regular fa-pen-to-square"></i>
                </button>
                <button
                    onClick={() => deleteVariable(variable.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Удалить"
                >
                    <i className="text-lg fa-regular fa-trash-can"></i>
                </button>
            </div>
        </div>
    );

    // Рендер строки таблицы в режиме редактирования
    const renderEditRow = () => (
        <div key="edit-row" className="flex flex-row py-2 bg-gray-100 rounded border border-gray-400 mb-2">
            <div className="w-[5%] flex items-center justify-center">
                <span className="text-gray-600">
                    <i className="fa-solid fa-pencil"></i>
                </span>
            </div>
            <div className="w-[25%] px-1">
                <div>
                    <input
                        type="text"
                        value={editForm.key}
                        onChange={handleKeyChange}
                        placeholder="Ключ переменной"
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                            keyError
                                ? 'border-red-300 focus:ring-red-200'
                                : 'border-gray-400 focus:ring-blue-800'
                        }`}
                        autoFocus
                    />
                    {keyError && (
                        <div className="text-xs text-red-600 mt-1 px-1">{keyError}</div>
                    )}
                </div>
            </div>
            <div className="w-[30%] px-1">
                <input
                    type="text"
                    value={editForm.value}
                    onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                    placeholder="Значение"
                    className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
            </div>
            <div className="w-[30%] px-1">
                <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Описание (необязательно)"
                    className="w-full px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
            </div>
            <div className="w-[10%] px-1 flex items-center justify-center gap-2">
                <button
                    onClick={saveEditing}
                    disabled={!!keyError || !editForm.key.trim()}
                    className={`text-green-600 hover:text-green-800 disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Сохранить"
                >
                    <i className="fa-regular fa-floppy-disk"></i>
                </button>
                <button
                    onClick={cancelEditing}
                    className="text-gray-600 hover:text-gray-800"
                    title="Отмена"
                >
                    <i className="fa-regular fa-circle-xmark"></i>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Шапка */}
            <div className="flex flex-row py-3 px-8 border-b-2 bg-white shadow-sm">
                <div className="flex justify-between w-2/6 text-2xl font-medium items-center text-center">
                    <span className="gjs-pn-btn font-medium gjs-two-color">Глобальные переменные</span>
                </div>

                <div className="flex flex-row justify-end w-4/6 gap-2">
                    <button
                        onClick={saveAllChanges}
                        className="min-w-[50px] px-3 h-7 rounded text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 flex items-center gap-2"
                    >
                        Сохранить переменные
                    </button>
                    <button
                        onClick={onClose}
                        className="min-w-[50px] px-3 mx-2 h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200"
                    >
                        Закрыть
                    </button>
                </div>
            </div>

            {/* Основной контент */}
            <div style={{ height: 'calc(100vh - 150px)' }}>
                <div className="h-full flex flex-col">
                    {/* Информационный блок */}
                    <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-4 py-4">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-[4px] h-12 bg-blue-600 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Глобальные переменные доступны для использования в скрипте отчета. Используйте синтаксис
                                        <code className="mx-2 px-2 py-1 bg-gray-100 rounded text-blue-600">{'getGlobalParam().ключ'}</code>
                                        для подстановки значений в качестве текстовых строк.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full ml-auto">
                                    <span className="text-sm font-medium text-blue-700">
                                        {variables.length} переменных
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Панель управления */}
                        <div className="px-6 pt-4  border-gray-100 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Поиск по ключу, значению или описанию..."
                                            className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all"
                                        />
                                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                                    </div>
                                    <button
                                        onClick={addVariable}
                                        className="px-4 py-2 bg-blue-800 from-gray-600 to-gray-500 text-white text-sm font-medium rounded-lg hover:from-gray-700 hover:to-gray-600 focus:ring-4 focus:ring-green-100 transition-all flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                        Добавить переменную
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Таблица переменных */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-lg flex-1 overflow-hidden mx-6">
                        {/* Заголовки таблицы */}
                        <div className="flex flex-row py-2 px-2 border border-b-2 border-gray-200">
                            <div className="w-[5%] flex items-center justify-center">
                                <span className="text-md font-medium text-gray-500">#</span>
                            </div>
                            <div className="w-[25%] px-2">
                                <span className="text-md font-medium text-gray-500 tracking-wider">Ключ</span>
                            </div>
                            <div className="w-[30%] px-2">
                                <span className="text-md font-medium text-gray-500 tracking-wider">Значение</span>
                            </div>
                            <div className="w-[30%] px-2">
                                <span className="text-md font-medium text-gray-500 tracking-wider">Описание</span>
                            </div>
                            <div className="w-[10%] px-2 text-center">
                                <span className="text-md font-medium  text-gray-500 tracking-wider">Действия</span>
                            </div>
                        </div>

                        <div>
                            {/* Строка редактирования всегда первой, если есть editingId */}
                            {editingId && renderEditRow()}
                        </div>
                        {/* Строки таблицы */}
                        <div className="overflow-y-scroll" style={{ maxHeight: 'calc(100vh - 450px)' }}>


                            {/* Остальные строки */}
                            {filteredVars
                                .filter(v => v.id !== editingId)
                                .map(variable => renderViewRow(variable))}

                            {/* Пустое состояние */}
                            {filteredVars.length === 0 && !editingId && (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <div className="text-4xl mb-4">📋</div>
                                    <h3 className="text-lg font-medium mb-2">Переменные не найдены</h3>
                                    <p className="text-center max-w-md text-sm">
                                        {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Добавьте первую глобальную переменную'}
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={addVariable}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Добавить переменную
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/*/!* Подсказки по использованию *!/*/}
                    {/*<div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4 mx-6">*/}
                    {/*    <div className="flex items-start gap-3">*/}
                    {/*        <i className="fa-solid fa-circle-info text-blue-600 mt-0.5"></i>*/}
                    {/*        <div>*/}
                    {/*            <h4 className="text-sm font-medium text-blue-800 mb-1">Как использовать глобальные переменные:</h4>*/}
                    {/*            <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">*/}
                    {/*                <div>*/}
                    {/*                    <span className="font-medium">В тексте отчета:</span>*/}
                    {/*                    <code className="ml-2 px-2 py-0.5 bg-white rounded">{'{{global.companyName}}'}</code>*/}
                    {/*                </div>*/}
                    {/*                <div>*/}
                    {/*                    <span className="font-medium">В SQL запросе:</span>*/}
                    {/*                    <code className="ml-2 px-2 py-0.5 bg-white rounded">:global.currentYear</code>*/}
                    {/*                </div>*/}
                    {/*                <div>*/}
                    {/*                    <span className="font-medium">В параметрах:</span>*/}
                    {/*                    <code className="ml-2 px-2 py-0.5 bg-white rounded">defaultValue: global.currency</code>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Модальное окно уведомлений */}
            {isModalNotify && (
                <ModalNotify
                    title="Глобальные переменные"
                    message={modalMsg}
                    onClose={() => setIsModalNotify(false)}
                />
            )}
        </div>
    );
}