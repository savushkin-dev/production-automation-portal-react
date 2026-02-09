// TestGrid.jsx - с ПОЛНОСТЬЮ СВОБОДНЫМ ПЕРЕМЕЩЕНИЕМ
import React, { useState, useEffect } from 'react';
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidthProvider } from "react-grid-layout/legacy";

const ResponsiveGridLayout = WidthProvider(RGL);

export function TestGrid() {
    // Параметры (такие же как в TestGridResult)
    const parameters = [
        {
            key: 'DateStart',
            name: 'Дата начала',
            type: 'DATE',
            default: '2024-01-01'
        },
        {
            key: 'DateEnd',
            name: 'Дата конца',
            type: 'DATE',
            default: '2024-12-31'
        },
        {
            key: 'Department',
            name: 'Отдел',
            type: 'TEXT',
            default: ''
        },
        {
            key: 'Employee',
            name: 'Сотрудник',
            type: 'TEXT',
            default: ''
        },
        {
            key: 'ShowDetails',
            name: 'Показать детали',
            type: 'BOOLEAN',
            default: false
        },
        {
            key: 'MinAmount',
            name: 'Минимальная сумма',
            type: 'NUMBER',
            default: 0
        },
        {
            key: 'MaxAmount',
            name: 'Максимальная сумма',
            type: 'NUMBER',
            default: 1000000
        },
        {
            key: 'ReportType',
            name: 'Тип отчета',
            type: 'SELECT',
            options: ['Ежедневный', 'Еженедельный', 'Ежемесячный'],
            default: 'Ежедневный'
        }
    ];

    const [layout, setLayout] = useState([]);
    const [textBlocks, setTextBlocks] = useState({});
    const [values, setValues] = useState(() => {
        const initialValues = {};
        parameters.forEach(param => {
            initialValues[param.key] = param.default;
        });
        return initialValues;
    });

    // Загрузка сохраненного layout
    useEffect(() => {
        const savedLayout = localStorage.getItem('report_layout_free');
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);

                // Разделяем элементы на параметры и текстовые блоки
                const newLayout = [];
                const newTextBlocks = {};

                parsedLayout.forEach(item => {
                    // Добавляем в layout
                    newLayout.push({
                        i: item.key,
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h,
                        minW: item.isGap || item.isTextBlock ? 1 : 2,
                        minH: 1
                    });

                    // Сохраняем текст если это текстовый блок
                    if (item.isTextBlock && item.text) {
                        newTextBlocks[item.key] = item.text;
                    }
                });

                setLayout(newLayout);
                setTextBlocks(newTextBlocks);
                console.log('Layout загружен:', parsedLayout);
            } catch (error) {
                console.error('Ошибка загрузки layout:', error);
            }
        }
    }, []);

    // Обработчик изменения значений параметров (только для отображения)
    const handleChange = (key, value) => {
        setValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Рендер элементов (ТОЛЬКО ДЛЯ ОТОБРАЖЕНИЯ)
    const renderGridItem = (item) => {
        // Проверяем, является ли элемент текстовым блоком
        const isTextBlock = textBlocks[item.i] !== undefined;

        // ТЕКСТОВЫЙ БЛОК
        if (isTextBlock) {
            const text = textBlocks[item.i] || '';

            return (
                <div key={item.i} className="">

                    <div className="p-4">
                        <div className="whitespace-pre-wrap text-gray-700">
                            {text}
                        </div>
                    </div>
                </div>
            );
        }

        // Проверяем, является ли элемент параметром
        const param = parameters.find(p => p.key === item.i);

        // ПУСТОЙ БЛОК (GAP) или неизвестный элемент
        if (!param) {
            return (
                <div key={item.i} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400">


                    <div className="p-4 flex flex-col items-center justify-center">
                        <div className="text-gray-500 text-center">
                            <div className="text-xl mb-1">⏸️</div>
                            <div className="text-xs">Пустое место</div>
                        </div>
                    </div>
                </div>
            );
        }

        // ОБЫЧНЫЙ ПАРАМЕТР
        const value = values[param.key];

        const renderField = () => {
            switch (param.type) {
                case 'DATE':
                    return (
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                            disabled={false} // Разрешаем изменение значений
                        />
                    );
                case 'TEXT':
                    return (
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                            placeholder="Введите значение..."
                            disabled={false}
                        />
                    );
                case 'NUMBER':
                    return (
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                            disabled={false}
                        />
                    );
                case 'BOOLEAN':
                    return (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                checked={value}
                                onChange={(e) => handleChange(param.key, e.target.checked)}
                                disabled={false}
                            />
                            <span>{value ? 'Включено' : 'Выключено'}</span>
                        </label>
                    );
                case 'SELECT':
                    return (
                        <select
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                            disabled={false}
                        >
                            {param.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    );
                default:
                    return null;
            }
        };

        return (
            <div key={item.i} className="bg-white rounded-lg   border-blue-200">


                <div className="p-4">
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {param.name}
                        </label>
                        {renderField()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* ЗАГОЛОВОК */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow border">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Отображение отчета</h2>
                <p className="text-gray-600">
                    Это режим отображения. Все элементы расставлены согласно сохраненному макету.
                    Вы можете изменять значения параметров, но не перемещать элементы.
                </p>
                <div className="mt-4 text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Параметры отчета</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded"></div>
                            <span>Пустые блоки</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Текстовые блоки</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* СЕТКА (ТОЛЬКО ДЛЯ ОТОБРАЖЕНИЯ) */}
            <div className=" rounded-xl border p-2 min-h-[800px] relative">
                {layout.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-xl font-medium mb-2">Нет сохраненного макета</h3>
                        <p className="text-center max-w-md">
                            Сначала создайте и сохраните макет в редакторе (TestGridResult),
                            затем обновите эту страницу.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Обновить страницу
                        </button>
                    </div>
                ) : (
                    <ResponsiveGridLayout
                        className="layout"
                        layout={layout}
                        gridConfig={{ cols: 20, rowHeight: 20 }}
                        dragConfig={{enabled: false}}
                        resizeConfig={{enabled: false}}
                        dropConfig={{enabled: true}}
                        width={1200}
                        margin={[10, 10]}
                        draggableHandle=".drag-handle"
                        isDraggable={false} // Запрещаем перемещение
                        isResizable={false} // Запрещаем изменение размера
                        compactType={null}
                        preventCollision={true}
                        autoSize={false}
                        isBounded={false}
                        useCSSTransforms={true}


                    >
                        {layout.map(item => renderGridItem(item))}
                    </ResponsiveGridLayout>
                )}
            </div>

            {/* ИНФОРМАЦИЯ О СЕТКЕ */}
            {layout.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">📊 Статистика</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Всего элементов:</span>
                                    <span className="font-medium">{layout.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Параметров:</span>
                                    <span className="font-medium">{layout.filter(item => parameters.find(p => p.key === item.i)).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Текстовых блоков:</span>
                                    <span className="font-medium">{Object.keys(textBlocks).length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">⚙️ Управление</h4>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    Вы можете изменять значения параметров, но не их положение.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Обновить данные
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">📝 Информация</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• Макет загружен из localStorage</p>
                                <p>• Изменения параметров не сохраняются</p>
                                <p>• Для редактирования макета перейдите в редактор</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}