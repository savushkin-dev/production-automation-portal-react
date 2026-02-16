import React, {useState, useRef, useEffect} from 'react';
import {ReactGridLayout, useContainerWidth} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {getCompactor} from "react-grid-layout/core";
import {styleInput, styleLabelInput} from "../../data/styles";
import {
    COLS,
    createDefaultLayout,
    ITEM_HEIGHT,
    ITEM_WIDTH,
    renderField,
    ROW_HEIGHT
} from "../../utils/report/designerParameter";

const myCompactor = getCompactor(null, false, true);

export function DesignerParameter({parameters, layout, setLayout, onClose}) {

    const { width , containerRef , mounted , measureWidth }  =  useContainerWidth ( {
        measureBeforeMount : false ,  // Установить true для SSR
        initialWidth : 1200  // Ширина до первого измерения
    } ) ;


    // layoutLocal теперь создается динамически из параметров
    const [layoutLocal, setLayoutLocal] = useState([]);

    useEffect(() => {
        // console.log("Параметры пришли:", parameters);
        // console.log("Layout пришел:", layout);
        // console.log("Тип layout:", typeof layout);

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
            setLayoutLocal(createDefaultLayout(parameters));

            // Инициализируем значения параметров
            const initialValues = {};
            parameters.forEach(param => {
                initialValues[param.key] = param.default !== undefined ? param.default : '';
            });
            setValues(initialValues);
        } else {
            setLayoutLocal([]);
            setValues({});
        }
    }, [parameters, layout]);

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

    // Текст для текстовых блоков
    const [textBlocks, setTextBlocks] = useState({});

    // Текст для нового текстового блока
    const [newTextBlockContent, setNewTextBlockContent] = useState('Текстовый блок');

    // Ссылки для хранения типов элементов
    const textBlocksRef = useRef(new Set());

    // ДОБАВЛЕНИЕ ТЕКСТОВОГО БЛОКА
    const addTextBlock = () => {
        if (!newTextBlockContent.trim()) {
            alert('Введите текст для блока');
            return;
        }

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
            w: 16,
            h: 3,
            minW: 2,
            minH: 2
        };

        textBlocksRef.current.add(newTextBlockId);
        setTextBlocks(prev => ({
            ...prev,
            [newTextBlockId]: newTextBlockContent
        }));
        setLayoutLocal(prev => [...prev, newTextBlock]);
        setTextBlockCounter(prev => prev + 1);
        setNewTextBlockContent(''); // Очищаем поле ввода после добавления
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
            const initialLayoutLocal = parameters.map((param, index) => ({
                i: param.key,
                x: index * 3 % 12,
                y: Math.floor(index * 3 / 12) * 3,
                w: 3,
                h: 3,
                minW: 1,
                minH: 1
            }));

            setLayoutLocal(initialLayoutLocal);
            textBlocksRef.current.clear();
            setTextBlocks({});
            setTextBlockCounter(0);
        }
    };

    // РЕНДЕР ЭЛЕМЕНТОВ
    const renderGridItem = (item) => {
        const textBlock = isTextBlock(item.i);

        // ТЕКСТОВЫЙ БЛОК - теперь это просто div с текстом
        if (textBlock) {
            const text = textBlocks[item.i] || '';

            return (
                <div key={item.i} className=" font-bold text-gray-800">
                    {text || 'Пустой текстовый блок'}
                    <i onClick={() => removeTextBlock(item.i)} className="p-2 fa-solid fa-xmark text-red-500"></i>
                </div>
            );
        }

        // ОБЫЧНЫЙ ПАРАМЕТР
        const param = parameters?.find(p => p.key === item.i);

        if (!param) {
            return (
                <div key={item.i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-700">Параметр не найден: {item.i}</div>
                    <button
                        onClick={() => {
                            setLayoutLocal(prev => prev.filter(layoutLocalItem => layoutLocalItem.i !== item.i));
                        }}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                        Удалить
                    </button>
                </div>
            );
        }

        return (
            <div key={item.i} className="bg-white rounded-lg shadow border border-blue-200 hover:shadow-md transition-shadow">
                <div className="">
                    {renderField(param, values, handleChange)}
                </div>
            </div>
        );
    };

    const textBlockCount = layoutLocal.filter(item => isTextBlock(item.i)).length;
    const parameterCount = layoutLocal.filter(item => !isTextBlock(item.i)).length;

    const isEmptyParameters = !parameters || parameters.length === 0;

    return (
        <div className="">

            <div className="flex flex-row py-3 px-8 border-b-2 mb-4">
                <div className="flex justify-between w-2/6 text-2xl font-medium items-center text-center">
                    <span className="text-xl font-bold text-gray-800">Дизайнер параметров отчета</span>
                </div>

                <div className="flex flex-row justify-end w-4/6">
                    <button
                        onClick={onClose}
                        className="min-w-[50px] px-3 mx-2 h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                        Закрыть
                    </button>
                    <button onClick={saveLayout}
                            className="min-w-[50px] text-sm h-7 font-medium px-3 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                        Применить разметку
                    </button>
                </div>
            </div>

            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="m-4 p-4 bg-white rounded-xl shadow border">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Загружено параметров: {parameters.length}
                        </span>
                    </div>
                </div>

                {/* НОВАЯ СЕКЦИЯ ДЛЯ ДОБАВЛЕНИЯ ТЕКСТОВОГО БЛОКА */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Добавление текстового блока</h3>
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            <textarea
                                value={newTextBlockContent}
                                onChange={(e) => setNewTextBlockContent(e.target.value)}
                                placeholder="Введите текст для нового блока..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-y min-h-[80px]"
                                rows="3"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Введите текст, который будет отображаться в блоке
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={addTextBlock}
                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium whitespace-nowrap"
                            >
                                📝 Добавить блок
                            </button>
                            <button
                                onClick={removeAllTextBlocks}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={textBlockCount === 0}
                            >
                                🗑️ Удалить все ({textBlockCount})
                            </button>
                        </div>
                    </div>
                </div>

                {/* КНОПКА СБРОСА */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={resetLayoutLocal}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                    >
                        🔄 Сбросить к исходному
                    </button>
                </div>

                {/* СТАТИСТИКА */}
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
            <div className="bg-gray-50 rounded-xl border p-2 min-h-[1000px] w-[1200px] mx-auto relative">
                {isEmptyParameters ? (
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
                        gridConfig={{
                            cols: COLS,
                            rowHeight: ROW_HEIGHT,
                            margin: [5, 5],
                            containerPadding: [10, 10],
                            maxRows: Infinity
                        }}
                        dragConfig={{enabled: true, bounded: false}}
                        resizeConfig={{enabled: true}}
                        dropConfig={{enabled: true}}
                        width={width}
                        onLayoutChange={(newLayout) => {
                            console.log(newLayout)
                            setLayoutLocal(newLayout);
                        }}
                        draggableHandle=".drag-handle"
                        compactor={myCompactor}
                        autoSize={false}
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