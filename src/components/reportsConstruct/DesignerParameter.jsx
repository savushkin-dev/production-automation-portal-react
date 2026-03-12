import React, {useState, useRef, useEffect} from 'react';
import {ReactGridLayout, useContainerWidth} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {getCompactor} from "react-grid-layout/core";
import {
    COLS,
    createDefaultLayout,
    renderField,
    ROW_HEIGHT
} from "../../utils/report/designerParameter";
import {ModalNotify} from "../modal/ModalNotify";

const myCompactor = getCompactor(null, false, true);

export function DesignerParameter({parameters, layout, setLayout, onClose}) {

    const {width, containerRef, mounted, measureWidth} = useContainerWidth({
        measureBeforeMount: false,  // Установить true для SSR
        initialWidth: 1200  // Ширина до первого измерения
    });

    const [layoutLocal, setLayoutLocal] = useState([]);

    const [textBlockCounter, setTextBlockCounter] = useState(0);
    const [textBlocks, setTextBlocks] = useState({});
    const [newTextBlockContent, setNewTextBlockContent] = useState('');

    // Ссылки для хранения типов элементов
    const textBlocksRef = useRef(new Set());

    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);

    const [initialLayout, setInitialLayout] = useState(null);

    useEffect(() => {
        if (layout) {
            if (typeof layout === 'string') {
                try {
                    const parsedLayout = JSON.parse(layout);
                    if (Array.isArray(parsedLayout)) {
                        setLayoutLocal(parsedLayout);
                        setInitialLayout(parsedLayout); // Сохраняем исходный layout

                        // Восстанавливаем текстовые блоки
                        const newTextBlocks = {};
                        const newTextBlocksRef = new Set();

                        parsedLayout.forEach(item => {
                            if (item.isTextBlock && item.text) {
                                newTextBlocksRef.add(item.i);
                                newTextBlocks[item.i] = item.text;
                            }
                        });

                        textBlocksRef.current = newTextBlocksRef;
                        setTextBlocks(newTextBlocks);
                    }
                } catch (error) {
                    console.error('Ошибка парсинга layout:', error);
                }
            } else if (Array.isArray(layout) && layout.length > 0) {
                setLayoutLocal(layout);
                setInitialLayout(layout);

                const newTextBlocks = {};
                const newTextBlocksRef = new Set();

                layout.forEach(item => {
                    if (item.isTextBlock && item.text) {
                        newTextBlocksRef.add(item.i);
                        newTextBlocks[item.i] = item.text;
                    }
                });

                textBlocksRef.current = newTextBlocksRef;
                setTextBlocks(newTextBlocks);
            }
        } else if (parameters && parameters.length > 0) {
            const defaultLayout = createDefaultLayout(parameters);
            setLayoutLocal(defaultLayout);
            setInitialLayout(defaultLayout); // Сохраняем исходный layout

            const initialValues = {};
            parameters.forEach(param => {
                initialValues[param.key] = param.default !== undefined ? param.default : '';
            });
            setValues(initialValues);
        } else {
            setLayoutLocal([]);
            setInitialLayout([]);
            setValues({});
        }
    }, [parameters, layout]);

    const [values, setValues] = useState(() => {
        const initialValues = {};
        if (parameters && parameters.length > 0) {
            parameters.forEach(param => {
                initialValues[param.key] = param.default !== undefined ? param.default : '';
            });
        }
        return initialValues;
    });

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
        setNewTextBlockContent('');
    };

    const removeTextBlock = (blockId) => {
        textBlocksRef.current.delete(blockId);
        setLayoutLocal(prev => prev.filter(item => item.i !== blockId));

        if (textBlocks[blockId]) {
            setTextBlocks(prev => {
                const newTexts = {...prev};
                delete newTexts[blockId];
                return newTexts;
            });
        }
    };

    const removeAllTextBlocks = () => {
        const textBlockIds = Array.from(textBlocksRef.current);
        setLayoutLocal(prev => prev.filter(item => !textBlockIds.includes(item.i)));
        textBlocksRef.current.clear();
        setTextBlocks({});
    };

    const isTextBlock = (itemId) => {
        return textBlocksRef.current.has(itemId);
    };

    const handleChange = (key, value) => {
        setValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

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
        setMsg("Изменения успешно применены.")
        setIsModalNotify(true);
    };

    // Обновленная функция сброса
    const resetLayoutToInitial = () => {
        if (initialLayout) {
            setLayoutLocal(initialLayout);

            const newTextBlocks = {};
            const newTextBlocksRef = new Set();

            initialLayout.forEach(item => {
                if (item.isTextBlock && item.text) {
                    newTextBlocksRef.add(item.i);
                    newTextBlocks[item.i] = item.text;
                }
            });

            textBlocksRef.current = newTextBlocksRef;
            setTextBlocks(newTextBlocks);

        } else if (parameters && parameters.length > 0) {
            const defaultLayout = createDefaultLayout(parameters);
            setLayoutLocal(defaultLayout);

            textBlocksRef.current.clear();
            setTextBlocks({});
        }
    };

    const moveAllUp = () => {
        if (layoutLocal.length === 0) return;

        const minY = Math.min(...layoutLocal.map(item => item.y));

        if (minY === 0) {
            setMsg("Элементы уже в самом верху");
            setIsModalNotify(true);
            return;
        }

        const newLayout = layoutLocal.map(item => ({
            ...item,
            y: item.y - 1
        }));

        setLayoutLocal(newLayout);
    };

    const moveAllDown = () => {
        if (layoutLocal.length === 0) return;

        const newLayout = layoutLocal.map(item => ({
            ...item,
            y: item.y + 1
        }));

        setLayoutLocal(newLayout);
    };

    const renderGridItem = (item) => {
        const textBlock = isTextBlock(item.i);

        if (textBlock) {
            const text = textBlocks[item.i] || '';

            return (
                <div key={item.i} className=" font-bold text-gray-800">
                    {text || 'Пустой текстовый блок'}
                    <i onClick={() => removeTextBlock(item.i)} title="Удалить текстовый блок"
                       className="p-2 fa-solid fa-xmark text-red-500 cursor-pointer"></i>
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
            <div key={item.i}
                 className="bg-white rounded-lg shadow border border-blue-200 hover:shadow-md transition-shadow">
                <div className="">
                    {renderField(param, values, handleChange)}
                </div>
            </div>
        );
    };

    const textBlockCount = layoutLocal.filter(item => isTextBlock(item.i)).length;

    const isEmptyParameters = !parameters || parameters.length === 0;

    if (isEmptyParameters) {
        return (
            <div className="flex flex-col items-center pb-44 justify-center h-[1000px] text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-medium mb-2">Нет элементов для отображения</h3>
                <p className="text-center max-w-md">
                    Отчет не загружен или не содержит параметров.
                </p>

                <button onClick={onClose}
                        className="min-w-[50px] mt-3 text-sm h-9 font-medium px-3 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                    Вернуться к созданию отчета
                </button>
            </div>
        )
    }

    return (
        <div className="">

            <div className="flex flex-row py-3 px-8 border-b-2 mb-4">
                <div className="flex justify-between w-2/6 text-2xl font-medium items-center text-center">
                    <span className="text-xl font-bold text-gray-800">Дизайнер параметров отчета</span>
                </div>

                <div className="flex flex-row justify-end w-4/6">
                    <button onClick={saveLayout}
                            className="min-w-[50px] text-sm h-7 font-medium px-3 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                        Применить разметку
                    </button>
                    <button
                        onClick={onClose}
                        className="min-w-[50px] px-3 mx-2 h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                        Закрыть
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 w-3/4">
                            <div className="w-[4px] h-12 bg-blue-600 rounded-full flex-shrink-0"></div>
                            <div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Перетаскивайте
                                    блоки удерживая правую кнопку мыши, чтобы изменить их положение.
                                    Изменяйте размер, потянув за правый нижний угол. Добавляйте текстовые блоки, они
                                    помогут
                                    сгруппировать параметры или добавить пояснения.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full ">
                            <span
                                className="text-sm font-medium text-blue-700 w-auto">{parameters.length} параметров</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex flex-row justify-between ">
                        <div className="flex flex-col w-2/3">

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M4 6h16M4 12h16M4 18h7"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-700">Текстовые блоки</h3>
                                </div>
                            </div>

                            <div className="flex flex-row items-start gap-4">
                                <div className="relative flex-1">
                                        <textarea
                                            value={newTextBlockContent}
                                            onChange={(e) => setNewTextBlockContent(e.target.value)}
                                            placeholder="Введите текст для нового блока..."
                                            className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                                            rows="1"
                                        />
                                    <div className="absolute right-3 bottom-2.5">
                                        <span
                                            className="text-xs text-gray-400">{newTextBlockContent.length} симв.</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={addTextBlock}
                                        disabled={!newTextBlockContent.trim()}
                                        className={`px-5 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-green-100 transition-all flex items-center gap-2 whitespace-nowrap ${
                                            !newTextBlockContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                        Добавить блок
                                    </button>

                                    <button
                                        onClick={removeAllTextBlocks}
                                        disabled={textBlockCount === 0}
                                        className="px-5 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                        title="Удалить все текстовые блоки"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                        Удалить все
                                        {textBlockCount > 0 && (
                                            <span
                                                        className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                                                {textBlockCount}
                                            </span>
                                        )}
                                    </button>

                                    <div className="h-8 w-px bg-gray-200 gap-2 mr-4"></div>

                                </div>
                            </div>

                        </div>

                        <div className="flex flex-col w-1/3">

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                        </svg>
                                    </div>
                                    <span
                                        className="text-sm font-medium text-gray-700">Управление положением элементов</span>
                                </div>
                            </div>


                            <div className="flex items-center gap-4">
                                <button
                                    onClick={resetLayoutToInitial}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 whitespace-nowrap"
                                    title="Сбросить к исходному состоянию"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Сбросить
                                </button>
                                <button
                                    onClick={moveAllUp}
                                    disabled={layoutLocal.length === 0}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    title="Переместить все элементы вверх"
                                >
                                    <i className="fa-solid fa-arrow-up"></i>
                                    <span>Все вверх</span>
                                </button>
                                <button
                                    onClick={moveAllDown}
                                    disabled={layoutLocal.length === 0}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    title="Переместить все элементы вниз"
                                >
                                    <i className="fa-solid fa-arrow-down"></i>
                                    <span>Все вниз</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <div className="bg-gray-50 rounded-xl border p-2 min-h-[1000px] w-[1200px] mx-auto relative mb-5 mt-5">
                {isEmptyParameters ? (
                    <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-medium mb-2">Нет элементов для отображения</h3>
                        <p className="text-center max-w-md">
                            Отчет не загружен или не содержит параметров.
                        </p>

                        <button onClick={onClose}
                                className="min-w-[50px] mt-3 text-sm h-9 font-medium px-3 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                            Вернуться к созданию отчета
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

            {isModalNotify &&
                <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}

        </div>
    );
}