import React, {useEffect, useState} from "react";
import RGL, {ReactGridLayout, useContainerWidth} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import {getCompactor} from "react-grid-layout/core";
import {
    COLS,
    createDefaultLayout,
    renderField,
    ROW_HEIGHT
} from "../../utils/report/designerParameter";

const myCompactor = getCompactor(null, false, true);

export function ModalParameterWithLayout({parameters, reportName, layout, onSubmit, onClose}) {
    const [values, setValues] = useState({});
    const [layoutLocal, setLayoutLocal] = useState([]);
    const [textBlocks, setTextBlocks] = useState({});

    const { width , containerRef , mounted , measureWidth }  =  useContainerWidth ( {
        measureBeforeMount : false ,  // Установить true для SSR
        initialWidth : 1200  // Ширина до первого измерения
    } ) ;

    useEffect(() => {
        const initialValues = {};
        parameters.forEach(param => {
            initialValues[param.key] = param.default !== undefined ? param.default : '';
        });
        setValues(initialValues);

        if (layout) {
            let layoutArray;

            if (typeof layout === 'string') {
                try {
                    layoutArray = JSON.parse(layout);
                } catch (error) {
                    console.error('Ошибка парсинга layout:', error);
                    layoutArray = [];
                }
            } else {
                layoutArray = layout;
            }

            if (Array.isArray(layoutArray) && layoutArray.length > 0) {
                const convertedLayout = layoutArray.map(item => ({
                    i: item.i || item.key,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                    minW: item.minW,
                    minH: item.minH
                }));

                setLayoutLocal(convertedLayout);

                // Восстанавливаем текстовые блоки
                const newTextBlocks = {};
                layoutArray.forEach(item => {
                    if (item.isTextBlock && item.text) {
                        const itemId = item.i || item.key;
                        newTextBlocks[itemId] = item.text;
                    }
                });
                setTextBlocks(newTextBlocks);
            } else {
                setLayoutLocal(createDefaultLayout(parameters));
            }
        } else {
            setLayoutLocal(createDefaultLayout(parameters));
        }
    }, [parameters, layout]);

    useEffect(() => {
        for (let i = 0; i < parameters.length; i++) {
            if(parameters[i].default !== null){
                setValues(prev=> ({...prev, [parameters[i].key]: parameters[i].default}))
            } else if(parameters[i].type === "BOOLEAN") {
                handleChange(parameters[i].key, false);
            }
        }
    }, []);

    useEffect(() => {
        const initialValues = {};
        parameters
            .filter(param => param.type === "DATE")
            .forEach(param => {
                initialValues[param.key] = param.default === true
                    ? new Date().toISOString().split('T')[0]
                    : param.default || '';
            });
        setValues(prevState => ({...prevState,...initialValues}));
    }, []);

    const handleChange = (key, value) => {
        setValues(prev => ({...prev, [key]: value}));
    };

    const handleSubmit = () => {
        onSubmit(identifyNonDefault(values, parameters));
    };

    // Выбор параметров, отличающихся от дефолтных
    function identifyNonDefault(params, paramDefinitions) {
        const defaultsMap = {};
        const typesMap = {};

        paramDefinitions.forEach(def => {
            defaultsMap[def.key] = def.default;
            typesMap[def.key] = def.type;
        });

        const filteredParams = {};

        for (const [key, value] of Object.entries(params)) {
            if (defaultsMap.hasOwnProperty(key)) {
                const defaultValue = defaultsMap[key];
                const type = typesMap[key];

                let shouldInclude = false;

                switch (type) {
                    case 'BOOLEAN':
                        const currentBool = value === true || value === 'true' || value === '1';
                        const defaultBool = defaultValue === true || defaultValue === 'true' || defaultValue === '1';
                        shouldInclude = currentBool !== defaultBool;
                        break;

                    case 'NUMBER':
                        const currentNum = typeof value === 'string' ? parseFloat(value) : value;
                        const defaultNum = typeof defaultValue === 'string' ? parseFloat(defaultValue) : defaultValue;
                        shouldInclude = currentNum !== defaultNum;
                        break;

                    case 'DATE':
                        shouldInclude = String(value) !== String(defaultValue);
                        break;

                    default:
                        shouldInclude = String(value) !== String(defaultValue);
                }

                if (shouldInclude) {
                    filteredParams[key] = value;
                }
            } else {
                filteredParams[key] = value;
            }
        }
        return filteredParams;
    }

    const renderGridItem = (item) => {
        const isTextBlock = textBlocks[item.i] !== undefined;

        if (isTextBlock) {
            return (
                <div key={item.i} className="font-bold text-gray-800">
                    {textBlocks[item.i] || 'Пустой текстовый блок'}
                </div>
            );
        }

        // ОБЫЧНЫЙ ПАРАМЕТР
        const param = parameters?.find(p => p.key === item.i);

        if (!param) {
            // Если параметр не найден, возможно это старый элемент из кэша
            return (
                <div key={item.i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-700">Параметр не найден: {item.i}</div>
                </div>
            );
        }

        return (
            <div key={item.i} className="bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="">
                    {renderField(param, values, handleChange)}
                </div>
            </div>
        );
    };

    const calculateGridWidth = () => {
        if (layoutLocal.length === 0) return 600;
        const maxRight = Math.max(...layoutLocal.map(item => item.x + item.w));
        // Переводим в пиксели (1 колонка = 10px)
        let widthInPixels = maxRight * 10;
        widthInPixels = Math.min(widthInPixels, 1200) + 80;
        return widthInPixels < 500? 500 : widthInPixels;
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />

            <div className="p-5 z-30 rounded bg-white fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-8 max-h-[80vh] overflow-y-auto" style={{ width: calculateGridWidth() }}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium text-start">Параметры отчета</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[60vh]">
                    {parameters.length === 0 ? (
                        <div className="text-center py-8">
                            <h4 className="text-gray-600">Отчет не содержит параметров</h4>
                        </div>
                    ) : layoutLocal.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">Загрузка параметров...</div>
                        </div>
                    ) : (
                        <div className="">
                            <ReactGridLayout
                                className="layout"
                                layout={layoutLocal}
                                gridConfig={{
                                    cols: COLS,
                                    rowHeight: ROW_HEIGHT,
                                    margin: [5,5],
                                    containerPadding: [10,10],
                                    maxRows: Infinity
                                }}
                                dragConfig={{enabled: false, bounded: false}}
                                resizeConfig={{enabled: false}}
                                dropConfig={{enabled: true}}
                                width={width}
                                draggableHandle=".drag-handle"
                                compactor={myCompactor}
                                preventCollision={true}
                                useCSSTransforms={true}
                            >
                                {layoutLocal.map(item => renderGridItem(item))}
                            </ReactGridLayout>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-gray-600">
                        Параметров: {parameters.length}
                    </div>
                    <div className="flex flex-row justify-end items-center bg-white my-2">
                        <button
                            onClick={onClose}
                            className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Закрыть
                        </button>
                        <button onClick={handleSubmit}
                                className="min-w-[50px] text-xs h-7 font-medium px-2 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                            Сформировать отчет
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}