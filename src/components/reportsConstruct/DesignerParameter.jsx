import React, {useState, useRef, useEffect} from 'react';
import RGL, {ReactGridLayout, useContainerWidth} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {getCompactor} from "react-grid-layout/core";

const myCompactor = getCompactor(null, false, true);

export function DesignerParameter({parameters, layout, setLayout, onClose}) {

    const  { width , containerRef , mounted , measureWidth }  =  useContainerWidth ( {
        measureBeforeMount : false ,  // Установить true для SSR
        initialWidth : 1600  // Ширина до первого измерения
    } ) ;

    // layoutLocal теперь создается динамически из параметров
    const [layoutLocal, setLayoutLocal] = useState([]);

    useEffect(() => {
        console.log("Параметры пришли:", parameters);
        console.log("Layout пришел:", layout);
        console.log("Тип layout:", typeof layout);

        if (layout) {
            // Проверяем, является ли layout строкой
            if (typeof layout === 'string') {
                try {
                    const parsedLayout = JSON.parse(layout);
                    if (Array.isArray(parsedLayout)) {
                        setLayoutLocal(parsedLayout);

                        // Восстанавливаем текстовые блоки
                        const newTextBlocks = {};
                        const newTextBlocksRef = new Set();

                        parsedLayout.forEach(item => {
                            if (item.isTextBlock && item.text) {
                                newTextBlocksRef.add(item.key);
                                newTextBlocks[item.key] = item.text;
                            }
                        });

                        textBlocksRef.current = newTextBlocksRef;
                        setTextBlocks(newTextBlocks);
                    }
                } catch (error) {
                    console.error('Ошибка парсинга layout:', error);
                }
            }
            // Если layout уже массив
            else if (Array.isArray(layout) && layout.length > 0) {
                setLayoutLocal(layout);

                // Восстанавливаем текстовые блоки
                const newTextBlocks = {};
                const newTextBlocksRef = new Set();

                layout.forEach(item => {
                    if (item.isTextBlock && item.text) {
                        newTextBlocksRef.add(item.key);
                        newTextBlocks[item.key] = item.text;
                    }
                });

                textBlocksRef.current = newTextBlocksRef;
                setTextBlocks(newTextBlocks);
            }
        }
        // Остальной код создания из параметров...
        else if (parameters && parameters.length > 0) {
            // Если layout нет - создаем из параметров
            const initialLayoutLocal = parameters.map((param, index) => ({
                i: param.key, // Используем key из параметров
                x: index * 3 % 21, // Распределяем по сетке
                y: Math.floor(index * 5 / 35) * 5,
                w: 3,
                h: 5,
                minW: 2,
                minH: 1
            }));

            setLayoutLocal(initialLayoutLocal);

            // Инициализируем значения параметров
            const initialValues = {};
            parameters.forEach(param => {
                initialValues[param.key] = param.default !== undefined ? param.default : '';
            });
            setValues(initialValues);
        } else {
            // Если нет ни layout ни parameters
            setLayoutLocal([]);
            setValues({});
        }
    }, [parameters, layout]);



    // useEffect(()=>{
    //     console.log(layoutLocal)
    // }, [layoutLocal])

    const [textBlockCounter, setTextBlockCounter] = useState(0);

    // Значения параметров
    const [values, setValues] = useState(() => {
        const initialValues = {};
        if (parameters && parameters.length > 0) {
            parameters.forEach(param => {
                initialValues[param.key] = param.default !== undefined ? param.default : '';
            });
        }
        return initialValues;
    });

    // useEffect(()=>{
    //     console.log("Значения параметров:", values)
    // }, [values])

    // Текст для текстовых блоков
    const [textBlocks, setTextBlocks] = useState({});

    // Ссылки для хранения типов элементов
    const textBlocksRef = useRef(new Set());

    // ДОБАВЛЕНИЕ ТЕКСТОВОГО БЛОКА
    const addTextBlock = () => {
        const newTextBlockId = `text-${Date.now()}-${textBlockCounter}`;

        let maxY = 0;
        layoutLocal.forEach(item => {
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
        setLayoutLocal(prev => [...prev, newTextBlock]);
        setTextBlockCounter(prev => prev + 1);
        console.log('Текстовый блок добавлен:', newTextBlockId);
    };

    // УДАЛЕНИЕ ТЕКСТОВОГО БЛОКА
    const removeTextBlock = (blockId) => {
        console.log('Удаляем текстовый блок:', blockId);
        textBlocksRef.current.delete(blockId);
        setLayoutLocal(prev => prev.filter(item => item.i !== blockId));

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
        setLayoutLocal(prev => prev.filter(item => !textBlockIds.includes(item.i)));
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
        const layoutLocalToSave = layoutLocal.map(item => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: item.minW,
            minH: item.minH,
            isTextBlock: isTextBlock(item.i),
            text: textBlocks[item.i] || ''
        }));

        setLayout(layoutLocalToSave)
    };

    // СБРОС - возвращаем исходный layoutLocal из параметров
    const resetLayoutLocal = () => {
        if (parameters && parameters.length > 0) {
            const initiallayoutLocal = parameters.map((param, index) => ({
                i: param.key,
                x: index * 3 % 12,
                y: Math.floor(index * 3 / 12) * 3,
                w: 3,
                h: 3,
                minW: 2,
                minH: 1
            }));

            setLayoutLocal(initiallayoutLocal);
            textBlocksRef.current.clear();
            setTextBlocks({});
            setTextBlockCounter(0);
        }
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
        // Ищем параметр по key (а не по статическим именам)
        const param = parameters?.find(p => p.key === item.i);

        if (!param) {
            // Если параметр не найден, возможно это старый элемент из кэша
            return (
                <div key={item.i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-700">Параметр не найден: {item.i}</div>
                    <button
                        onClick={() => {
                            // Удаляем несуществующий параметр
                            setLayoutLocal(prev => prev.filter(layoutLocalItem => layoutLocalItem.i !== item.i));
                        }}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                        Удалить
                    </button>
                </div>
            );
        }

        const value = values[param.key] !== undefined ? values[param.key] : '';

        const renderField = () => {
            switch (param.type) {
                case 'DATE':
                    return (
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value || ''}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                        />
                    );
                case 'TEXT':
                    return (
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value || ''}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                            placeholder="Введите значение..."
                        />
                    );
                case 'NUMBER':
                    return (
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value || 0}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                        />
                    );
                case 'BOOLEAN':
                    return (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                checked={value || false}
                                onChange={(e) => handleChange(param.key, e.target.checked)}
                            />
                            <span>{value ? 'Включено' : 'Выключено'}</span>
                        </label>
                    );
                case 'SELECT':
                    return (
                        <select
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={value || ''}
                            onChange={(e) => handleChange(param.key, e.target.value)}
                        >
                            {param.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    );
                default:
                    return (
                        <div className="text-gray-500 text-sm">
                            Неизвестный тип параметра: {param.type}
                        </div>
                    );
            }
        };

        return (
            <div key={item.i} className="bg-white rounded-lg shadow border border-blue-200 hover:shadow-md transition-shadow">
                {/*<div className="drag-handle bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2 border-b border-blue-300 cursor-move flex justify-between items-center rounded-t-lg">*/}
                {/*    <div className="flex items-center gap-2">*/}
                {/*        <span className="text-blue-600 font-bold">⋮⋮</span>*/}
                {/*        <span className="text-sm font-bold text-blue-800">*/}
                {/*            {param.name}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*    <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded">*/}
                {/*        {param.type}*/}
                {/*    </div>*/}
                {/*</div>*/}

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

    const textBlockCount = layoutLocal.filter(item => isTextBlock(item.i)).length;
    const parameterCount = layoutLocal.filter(item => !isTextBlock(item.i)).length;

    // Если параметры еще не загружены
    if (!parameters || parameters.length === 0) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <div className="mb-6 p-4 bg-white rounded-xl shadow border">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Загрузка параметров...</h2>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                    >
                        Закрыть
                    </button>
                </div>
                <div className="bg-gray-50 rounded-xl border p-8 text-center">
                    <div className="text-gray-500">Параметры не загружены</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 mx-auto bg-red-100">
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow border">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Дизайнер параметров отчета</h2>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Загружено параметров: {parameters.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
                    >
                        ✕ Закрыть
                    </button>
                    <button
                        onClick={saveLayout}
                        className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
                    >
                        Применить
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">


                    <button
                        onClick={resetLayoutLocal}
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
                            <span>Параметры: {parameterCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Текстовые блоки: {textBlockCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Всего: {layoutLocal.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* СЕТКА */}
            <div className="bg-gray-50 rounded-xl border p-2 min-h-[1000px] relative">
                {layoutLocal.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-xl font-medium mb-2">Нет элементов для отображения</h3>
                        <p className="text-center max-w-md">
                            Начните с добавления параметров или текстовых блоков.
                        </p>
                        <button
                            onClick={resetLayoutLocal}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Создать начальный макет
                        </button>
                    </div>
                ) : (
                    <ReactGridLayout
                        className="layout"
                        layout={layoutLocal}
                        gridConfig = { {  cols : 22 ,  rowHeight : 20  } }
                        dragConfig={{enabled: true, bounded: false}}
                        resizeConfig={{enabled: true}}
                        dropConfig={{enabled: true }}
                        width={width}
                        margin={[10, 10]}
                        onLayoutChange={(newLayout) => {
                            // console.log('layoutLocal changed:', newLayout);
                            setLayoutLocal(newLayout);
                        }}
                        draggableHandle=".drag-handle"

                        compactor={myCompactor}
                        autoSize={true}
                        isBounded={false}
                        useCSSTransforms={true}
                    >
                        {layoutLocal.map(item => renderGridItem(item))}
                    </ReactGridLayout>
                )}
            </div>
        </div>
    );
}