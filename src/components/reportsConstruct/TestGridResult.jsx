// TestGrid.jsx
import React, {useState, useRef, useEffect} from 'react';
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidthProvider } from "react-grid-layout/legacy";
import {
    verticalCompactor,  // По умолчанию: сжимает элементы вверх
    horizontalCompactor,  // Сжимает элементы влево
    noCompactor,  // Без сжатия (свободное позиционирование)
    getCompactor  // Фабрика: getCompactor('vertical', allowOverlap, preventCollision)
} from "react-grid-layout/core";

const ResponsiveGridLayout = WidthProvider(RGL);

export function TestGridResult() {
    // Параметры
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

    const [layout, setLayout] = useState([
        { i: 'DateStart', x: 0, y: 10, w: 3, h: 3, minW: 2, minH: 1 },
        { i: 'DateEnd', x: 4, y: 10, w: 3, h: 3, minW: 2, minH: 1 },
        { i: 'Department', x: 0, y: 5, w: 4, h: 3, minW: 2, minH: 1 },
        { i: 'Employee', x: 0, y: 8, w: 4, h: 3, minW: 2, minH: 1 },
        { i: 'MinAmount', x: 7, y: 2, w: 3, h: 2, minW: 2, minH: 1 },
        { i: 'MaxAmount', x: 9, y: 5, w: 3, h: 2, minW: 2, minH: 1 },
        { i: 'ShowDetails', x: 8, y: 12, w: 2, h: 2, minW: 1, minH: 1 },
        { i: 'ReportType', x: 5, y: 14, w: 4, h: 2, minW: 2, minH: 1 },
    ]);

    const [textBlockCounter, setTextBlockCounter] = useState(0);
    const [values, setValues] = useState(() => {
        const initialValues = {};
        parameters.forEach(param => {
            initialValues[param.key] = param.default;
        });
        return initialValues;
    });

    useEffect(()=>{
        console.log(values)
    }, [values])

    // Текст для текстовых блоков
    const [textBlocks, setTextBlocks] = useState({});

    // Ссылки для хранения типов элементов
    const textBlocksRef = useRef(new Set());

    // ДОБАВЛЕНИЕ ТЕКСТОВОГО БЛОКА
    const addTextBlock = () => {
        const newTextBlockId = `text-${Date.now()}-${textBlockCounter}`;

        let maxY = 0;
        layout.forEach(item => {
            if (item.y + item.h > maxY) {
                maxY = item.y + item.h;
            }
        });

        const newTextBlock = {
            i: newTextBlockId,
            x: 0,
            y: maxY + 1,
            w: 4,
            h: 3,
            minW: 2,
            minH: 2
        };

        textBlocksRef.current.add(newTextBlockId);
        setTextBlocks(prev => ({
            ...prev,
            [newTextBlockId]: 'Текст по умолчанию'
        }));
        setLayout(prev => [...prev, newTextBlock]);
        setTextBlockCounter(prev => prev + 1);
        console.log('Текстовый блок добавлен:', newTextBlockId);
    };

    // УДАЛЕНИЕ ТЕКСТОВОГО БЛОКА
    const removeTextBlock = (blockId) => {
        console.log('Удаляем текстовый блок:', blockId);
        textBlocksRef.current.delete(blockId);
        setLayout(prev => prev.filter(item => item.i !== blockId));

        // Удаляем текст
        if (textBlocks[blockId]) {
            setTextBlocks(prev => {
                const newTexts = { ...prev };
                delete newTexts[blockId];
                return newTexts;
            });
        }
    };

    // УДАЛЕНИЕ ВСЕХ ТЕКСТОВЫХ БЛОКОВ
    const removeAllTextBlocks = () => {
        console.log('Удаляем все текстовые блоки');
        const textBlockIds = Array.from(textBlocksRef.current);
        setLayout(prev => prev.filter(item => !textBlockIds.includes(item.i)));
        textBlocksRef.current.clear();
        setTextBlocks({});
    };

    // ИЗМЕНЕНИЕ ТЕКСТА В ТЕКСТОВОМ БЛОКЕ
    const handleTextChange = (blockId, text) => {
        setTextBlocks(prev => ({
            ...prev,
            [blockId]: text
        }));
    };

    // Проверка является ли элемент текстовым блоком
    const isTextBlock = (itemId) => {
        return textBlocksRef.current.has(itemId);
    };

    // ОБРАБОТЧИК ИЗМЕНЕНИЙ ПАРАМЕТРОВ
    const handleChange = (key, value) => {
        setValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // СОХРАНЕНИЕ
    const saveLayout = () => {
        const layoutToSave = layout.map(item => ({
            key: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            isTextBlock: isTextBlock(item.i),
            text: textBlocks[item.i] || ''
        }));

        localStorage.setItem('report_layout_free', JSON.stringify(layoutToSave));
        alert('Макет сохранен!');
    };

    // СБРОС
    const resetLayout = () => {
        setLayout([
            { i: 'DateStart', x: 0, y: 10, w: 3, h: 3, minW: 2, minH: 1 },
            { i: 'DateEnd', x: 4, y: 10, w: 3, h: 3, minW: 2, minH: 1 },
            { i: 'Department', x: 0, y: 5, w: 4, h: 3, minW: 2, minH: 1 },
            { i: 'Employee', x: 0, y: 8, w: 4, h: 3, minW: 2, minH: 1 },
            { i: 'MinAmount', x: 7, y: 2, w: 3, h: 2, minW: 2, minH: 1 },
            { i: 'MaxAmount', x: 9, y: 5, w: 3, h: 2, minW: 2, minH: 1 },
            { i: 'ShowDetails', x: 8, y: 12, w: 2, h: 2, minW: 1, minH: 1 },
            { i: 'ReportType', x: 5, y: 14, w: 4, h: 2, minW: 2, minH: 1 },
        ]);
        textBlocksRef.current.clear();
        setTextBlocks({});
        setTextBlockCounter(0);
    };

    // РЕНДЕР ЭЛЕМЕНТОВ
    const renderGridItem = (item) => {
        const textBlock = isTextBlock(item.i);

        // ТЕКСТОВЫЙ БЛОК
        if (textBlock) {
            const text = textBlocks[item.i] || '';

            return (
                <div key={item.i} className="relative group bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow border-2 border-green-300">
                    <div className="drag-handle bg-gradient-to-r from-green-200 to-green-300 px-3 py-2 border-b border-green-400 flex justify-between items-center rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">T</span>
                            <span className="text-sm font-bold text-green-800">
                                Текстовый блок
                            </span>
                        </div>
                        <div className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                            ТЕКСТ
                        </div>
                    </div>

                    <div className="p-4 h-[calc(100%-45px)] flex flex-col">
                        <textarea
                            value={text}
                            onChange={(e) => handleTextChange(item.i, e.target.value)}
                            className="w-full h-full p-3 border border-green-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none bg-white/80"
                            placeholder="Введите текст здесь..."
                            rows="4"
                        />

                        <button
                            onClick={() => removeTextBlock(item.i)}
                            className="mt-3 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors shadow self-end"
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            );
        }

        // ОБЫЧНЫЙ ПАРАМЕТР
        const param = parameters.find(p => p.key === item.i);
        if (!param) return null;

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
                        />
                    );
                case 'NUMBER':
                    return (
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value}
                            onChange={(e) => handleChange(param.key, e.target.value)}
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
            <div key={item.i} className="bg-white rounded-lg shadow border border-blue-200 hover:shadow-md transition-shadow">
                <div className="drag-handle bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2 border-b border-blue-300 cursor-move flex justify-between items-center rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold">⋮⋮</span>
                        <span className="text-sm font-bold text-blue-800">
                            {param.name}
                        </span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        {param.type}
                    </div>
                </div>

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

    const textBlockCount = layout.filter(item => isTextBlock(item.i)).length;

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow border">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Управление макетом</h2>

                <div className="flex flex-wrap gap-3 mb-4">
                    <button
                        onClick={saveLayout}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                    >
                        💾 Сохранить макет
                    </button>

                    <button
                        onClick={resetLayout}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                    >
                        🔄 Сбросить к исходному
                    </button>

                    <button
                        onClick={addTextBlock}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                    >
                        📝 Добавить текстовый блок
                    </button>

                    <button
                        onClick={removeAllTextBlocks}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={textBlockCount === 0}
                    >
                        🗑️ Удалить все текстовые блоки ({textBlockCount})
                    </button>
                </div>

                <div className="text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Параметры: {layout.length - textBlockCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Текстовые блоки: {textBlockCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Всего: {layout.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* СЕТКА */}
            <div className="bg-gray-50 rounded-xl border p-2 min-h-[1000px] relative">
                <ResponsiveGridLayout
                    className="layout"
                    layout={layout}
                    gridConfig = { {  cols : 20 ,  rowHeight : 20  } }
                    width={1200}
                    margin={[10, 10]}
                    onLayoutChange={(newLayout) => {
                        console.log('Layout changed:', newLayout);
                        setLayout(newLayout);
                    }}
                    draggableHandle=".drag-handle"
                    isDraggable={true}
                    isResizable={true}

                    // НАСТРОЙКА КОМПАКТОРА:
                    compactor={noCompactor} // или verticalCompactor, horizontalCompactor

                    preventCollision={true}
                    autoSize={false}
                    isBounded={false}
                    useCSSTransforms={true}
                >
                    {layout.map(item => renderGridItem(item))}
                </ResponsiveGridLayout>
            </div>
        </div>
    );
}