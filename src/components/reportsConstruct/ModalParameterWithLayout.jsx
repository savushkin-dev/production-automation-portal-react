import React, {useEffect, useState} from "react";
import RGL, {ReactGridLayout} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import {getCompactor} from "react-grid-layout/core";

const myCompactor = getCompactor(null, false, true);

export function ModalParameterWithLayout({parameters, reportName, layout, onSubmit, onClose}) {
    const [values, setValues] = useState({});
    const [layoutLocal, setLayoutLocal] = useState([]);
    const [textBlocks, setTextBlocks] = useState({});

    useEffect(()=>{
        console.log(layoutLocal)
    }, [layoutLocal])

    // Инициализация layout и значений
    useEffect(() => {
        console.log("Параметры пришли:", parameters);
        console.log("Layout пришел:", layout);

        // Инициализируем значения параметров
        const initialValues = {};
        parameters.forEach(param => {
            initialValues[param.key] = param.default !== undefined ? param.default : '';
        });
        setValues(initialValues);

        // Обрабатываем layout если он есть
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
                // Конвертируем из формата с key в формат с i
                const convertedLayout = layoutArray.map(item => ({
                    i: item.key || item.i,
                    x: item.x,
                    y: item.y,
                    w: item.w || 3,
                    h: item.h || 3,
                    minW: item.minW,
                    minH: item.minH
                }));

                setLayoutLocal(convertedLayout);

                // Восстанавливаем текстовые блоки
                const newTextBlocks = {};
                layoutArray.forEach(item => {
                    if (item.isTextBlock && item.text) {
                        const itemId = item.key || item.i;
                        newTextBlocks[itemId] = item.text;
                    }
                });
                setTextBlocks(newTextBlocks);
            } else {
                // Если layout пустой, создаем из параметров
                // createDefaultLayout();
            }
        } else {
            // Если нет layout, создаем из параметров
            // createDefaultLayout();
        }
    }, [parameters, layout]);

    // Создание layout по умолчанию из параметров
    const createDefaultLayout = () => {
        const defaultLayout = parameters.map((param, index) => ({
            i: param.key,
            x: index * 3 % 21,
            y: Math.floor(index * 5 / 35) * 5,
            w: 3,
            h: 5,
            minW: 2,
            minH: 1
        }));
        setLayoutLocal(defaultLayout);
    };

    // Обработчик изменения значений
    const handleChange = (key, value) => {
        setValues(prev => ({...prev, [key]: value}));
    };

    // Отправка формы
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
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />

            <div className="min-w-2xl p-5 z-30 rounded bg-white absolute top-20 left-1/2 -translate-x-1/2 px-8 max-w-7xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-medium text-start">Параметры отчета: {reportName}</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {parameters.length === 0 ? (
                    <div className="text-center py-8">
                        <h4 className="text-lg text-gray-600">Отчет не содержит параметров</h4>
                    </div>
                ) : layoutLocal.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">Загрузка параметров...</div>
                    </div>
                ) : (
                    <div className="bg-gray-50 h-[700px] rounded-xl border p-4 mb-6">
                        <ReactGridLayout
                            className="layout"
                            layout={layoutLocal}
                            gridConfig = { {  cols : 22 ,  rowHeight : 20  } }
                            dragConfig={{enabled: false, bounded: false}}
                            resizeConfig={{enabled: false}}
                            dropConfig={{enabled: true}}
                            width={1200}
                            margin={[10, 10]}
                            draggableHandle=".drag-handle"
                            compactor={myCompactor}
                            preventCollision={true}
                            useCSSTransforms={true}
                        >
                            {layoutLocal.map(item => (renderGridItem(item)))}
                        </ReactGridLayout>
                    </div>
                )}

                <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-gray-600">
                        Параметров: {parameters.length}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded text-sm font-medium shadow-sm border border-gray-300 hover:bg-gray-100"
                        >
                            Закрыть
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Сформировать отчет
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}