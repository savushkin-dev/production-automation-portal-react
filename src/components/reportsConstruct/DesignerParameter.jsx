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

    const { width , containerRef , mounted , measureWidth }  =  useContainerWidth ( {
        measureBeforeMount : false ,  // Установить true для SSR
        initialWidth : 1200  // Ширина до первого измерения
    } ) ;

    const [layoutLocal, setLayoutLocal] = useState([]);

    const [textBlockCounter, setTextBlockCounter] = useState(0);
    const [textBlocks, setTextBlocks] = useState({});
    const [newTextBlockContent, setNewTextBlockContent] = useState('');

    // Ссылки для хранения типов элементов
    const textBlocksRef = useRef(new Set());

    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);


    useEffect(() => {
        if (layout) {
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
            }
            else if (Array.isArray(layout) && layout.length > 0) {
                setLayoutLocal(layout);

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
        }
        else if (parameters && parameters.length > 0) {
            setLayoutLocal(createDefaultLayout(parameters));

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

        // Удаляем текст
        if (textBlocks[blockId]) {
            setTextBlocks(prev => {
                const newTexts = { ...prev };
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

    const resetLayoutLocal = () => {
        setLayoutLocal(createDefaultLayout(parameters));
    };

    const renderGridItem = (item) => {
        const textBlock = isTextBlock(item.i);

        if (textBlock) {
            const text = textBlocks[item.i] || '';

            return (
                <div key={item.i} className=" font-bold text-gray-800">
                    {text || 'Пустой текстовый блок'}
                    <i onClick={() => removeTextBlock(item.i)} title="Удалить текстовый блок" className="p-2 fa-solid fa-xmark text-red-500 cursor-pointer"></i>
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

    const isEmptyParameters = !parameters || parameters.length === 0;

    if(isEmptyParameters){
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

            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 w-3/4">
                            <div className="w-[4px] h-12 bg-blue-600 rounded-full flex-shrink-0"></div>
                            <div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Перетаскивайте
                                    блоки удерживая правую кнопку мыши, чтобы изменить их положение.
                                    Изменяйте размер, потянув за правый нижний угол. Добавляйте текстовые блоки, они помогут
                                    сгруппировать параметры или добавить пояснения.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full ">
                            <span className="text-sm font-medium text-blue-700 w-auto">{parameters.length} параметров</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Добавить текстовый блок</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={newTextBlockContent}
                                onChange={(e) => setNewTextBlockContent(e.target.value)}
                                placeholder="Введите текст для нового блока..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-green-300 focus:ring-4 focus:ring-green-50 transition-all duration-200 resize-none"
                                rows="3"
                            />
                            <div className="absolute right-3 bottom-3">
                                <span className="text-xs text-gray-400">{newTextBlockContent.length} симв.</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={addTextBlock}
                                disabled={!newTextBlockContent.trim()}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-green-600 focus:ring-4 focus:ring-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 4v16m8-8H4"/>
                                </svg>
                                Добавить блок
                            </button>

                            <button
                                onClick={removeAllTextBlocks}
                                disabled={textBlockCount === 0}
                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title="Удалить все текстовые блоки"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                {textBlockCount > 0 && <span
                                    className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{textBlockCount}</span>}
                            </button>
                            <button
                                onClick={resetLayoutLocal}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-purple-100 transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Сбросить
                            </button>
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