import React, {useRef, useState, useEffect} from "react";
import {Editor, loader} from "@monaco-editor/react";
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {styleInputWithoutRounded} from "../../data/styles";
import Select from "react-select";
import {CustomStyleWithoutRounded} from "../../data/styleForSelect";
import { v4 as uuidv4 } from 'uuid';

export function JavaEditor({script, parameters, setScript, onClose, setParameters, layout, setLayout}) {

    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(600);

    useEffect(() => {
        if (parameters?.length > 0 && !Array.isArray(layout)) {
            const newLayout = parameters.map((param, index) => ({
                i: param.id,
                x: 0,
                y: index,
                w: 12,
                h: 1,
                static: false,
                isResizable: false
            }));
            setLayout(newLayout);
        }
    }, [parameters]);

    // Измеряем ширину контейнера
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout)
    };

    const updateParameter = (id, field, value) => {
        if (field === "type") {
            setParameters(parameters.map(p =>
                p.id === id ? {...p, [field]: value.value} : p
            ));
            return;
        }

        setParameters(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addParameter = () => {
        const newParam = {
            id: uuidv4(),
            name: '',
            key: '',
            type: 'TEXT',
            default: ''
        };

        setParameters([...parameters, newParam]);

        setLayout(prev => {
            const currentLayout = Array.isArray(prev) ? prev : [];
            return [
                ...currentLayout,
                {
                    i: newParam.id,
                    x: 0,
                    y: currentLayout.length,
                    w: 12,
                    h: 1,
                    static: false,
                    isResizable: false
                }
            ];
        });
    };

    const addDataChildParameter = () => {
        const existingChildParams = parameters.filter(param => param.key?.startsWith('main-child'));
        const nextNumber = existingChildParams.length + 1;

        const newKey = nextNumber === 1 ? 'main-child' : `main-child-${nextNumber}`;
        const newName = nextNumber === 1 ? 'Дополнительный бэнд' : `Дополнительный бэнд ${nextNumber}`;

        const newParam = {
            id: uuidv4(),
            name: newName,
            key: newKey,
            type: 'BOOLEAN',
            default: true
        };

        setParameters([...parameters, newParam]);

        setLayout(prev => {
            const currentLayout = Array.isArray(prev) ? prev : [];
            return [
                ...currentLayout,
                {
                    i: newParam.id,
                    x: 0,
                    y: currentLayout.length,
                    w: 12,
                    h: 1,
                    static: false,
                    isResizable: false
                }
            ];
        });
    };

    const removeLastParameter = () => {
        if (parameters.length === 0) return;
        const lastParam = parameters[parameters.length - 1];
        removeParamById(lastParam.id);
    };

    const removeParamById = (id) => {
        setParameters(prevParameters =>
            prevParameters.filter(param => param.id !== id)
        );
        setLayout(prev => {
            const currentLayout = Array.isArray(prev) ? prev : [];
            return currentLayout.filter(item => item.i !== id);
        });
    };

    const options = [
        { value: 'TEXT', label: 'Текст' },
        { value: 'NUMBER', label: 'Число' },
        { value: 'DATE', label: 'Дата' },
        { value: 'BOOLEAN', label: 'Да/Нет' },
    ];

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    loader.init().then(monaco => {
        monaco.editor.defineTheme('my-theme', {
            base: 'vs',
            colors: { 'editor.background': '#ffffff' },
            rules: [{ token: 'keyword', foreground: '#e88c1e' }]
        });
    });

    const importFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.java';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (e) => setScript(reader.result);
            reader.onerror = () => console.error('Ошибка чтения файла');
        };
        input.click();
    };

    return (
        <div className="bg-blue-6002 mb-8">
            <div className="flex flex-col">
                <div className="flex flex-row py-3 px-8">
                    <div className="flex justify-between w-3/5 text-2xl font-medium items-center text-center">
                        <span>Редактор скрипта</span>
                        <button onClick={importFile}
                                className="px-2 h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Импортировать файл
                        </button>
                    </div>
                    <div className="flex flex-row justify-end w-2/5">
                        <button onClick={onClose}
                                className="px-2 h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Конструктор
                        </button>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div className="border-y-2 w-3/5">
                        <Editor
                            onMount={handleEditorDidMount}
                            height="85vh"
                            language="java"
                            theme="vs"
                            value={script}
                            onChange={(value) => setScript(value)}
                            options={{
                                fontSize: 14,
                                lineNumbers: 'on',
                                minimap: {enabled: false},
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>

                    <div className="flex flex-col w-2/5">
                        <div className="flex-row px-6 h-full">

                            <div className="flex items-center gap-4 ">
                                <div className="w-[4px] h-16 bg-blue-600 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Добавляйте параметры для использования в скрипте.
                                        Эти параметры будут доступны для заполнения пользователю, просматривающему
                                        отчет.
                                        Порядок параметров можно изменить, удерживая кнопку
                                        <code className="mx-2 px-2 py-1 bg-gray-100 rounded text-blue-600">{'⋮⋮'}</code>
                                         и перетаскивая в нужное место.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex text-2xl text-nowrap font-medium text-start mt-2 mb-3">
                                    Параметры
                                    <div className="flex ml-2 items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full ">
                                        <span
                                            className="text-sm font-medium text-blue-700 w-auto">{parameters.length}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-end">
                                    <button onClick={addParameter}
                                            className="h-7 text-nowrap px-2 text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">
                                        Добавить параметр
                                    </button>
                                    <button onClick={removeLastParameter}
                                            className="ml-4 h-7 text-nowrap px-2 text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">
                                        Удалить параметр
                                    </button>
                                </div>
                            </div>

                            <button onClick={addDataChildParameter}
                                    className="h-7 w-full text-nowrap px-2 text-sm text-white rounded shadow-inner bg-gray-600 mb-2 hover:bg-gray-500">
                                Добавить выбор отображения дополнительного бэнда при формировании отчета
                            </button>

                            <div className="flex flex-row mb-1">
                                <span className="text-sm text-center font-medium w-[5%]"><i
                                    className="fa-solid fa-arrows-up-down-left-right"></i></span>
                                <span className="text-sm text-center font-medium w-[25%]">Название</span>
                                <span className="text-sm text-center font-medium w-[19%]">Параметр</span>
                                <span className="text-sm text-center font-medium w-[16%] pr-5">Тип</span>
                                <span className="text-sm text-center font-medium w-[30%]">Знач. по умолчанию</span>
                                <span className="text-sm text-center font-medium w-[5%]"></span>
                            </div>

                            <div
                                ref={containerRef}
                                className="overflow-x-hidden overflow-y-scroll"
                                style={{position: 'relative', maxHeight: 'calc(100vh - 300px)'}}
                            >
                                {parameters.length > 0 ? (
                                    <RGL
                                        layout={layout || []}
                                        gridConfig={{
                                            cols: 1,
                                            rowHeight: 28,
                                            margin: [0, 0],
                                            containerPadding: [0, 0],
                                        }}
                                        width={containerWidth}
                                        onLayoutChange={handleLayoutChange}
                                        isResizable={false}
                                        isDraggable={true}
                                        draggableHandle=".drag-handle"
                                        useCSSTransforms={true}
                                        compactType="vertical"
                                        preventCollision={false}
                                    >
                                        {parameters.map((param) => {
                                            const isChildParameter = param.key?.startsWith('main-child');

                                            return (
                                                <div key={param.id}>
                                                    <div className="flex flex-row py-0 drag-handle mr-3"
                                                         style={{cursor: 'grab'}}>
                                                        {/* Ручка для перетаскивания */}
                                                        <div className="w-[5%] flex items-center justify-center">
                                                            <span
                                                                className="text-gray-400 hover:text-gray-600 select-none">⋮⋮</span>
                                                        </div>

                                                        {/* Название */}
                                                        <input
                                                            className={styleInputWithoutRounded + " font-medium mr-0 w-[25%]"}
                                                            value={param.name || ''}
                                                            onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                                                            placeholder="Название параметра"
                                                        />

                                                        {/* Ключ */}
                                                        <input
                                                            className={styleInputWithoutRounded + " font-medium mr-0 w-[19%]"}
                                                            value={param.key || ''}
                                                            onChange={(e) => updateParameter(param.id, 'key', e.target.value)}
                                                            placeholder="Параметр"
                                                            disabled={isChildParameter}
                                                        />

                                                        {/* Тип */}
                                                        <Select
                                                            className="text-sm font-medium w-[16%] mr-0"
                                                            placeholder="Тип параметра"
                                                            value={{
                                                                value: param.type,
                                                                label: options.find(option => option.value === param.type)?.label || null
                                                            }}
                                                            onChange={(e) => updateParameter(param.id, 'type', e)}
                                                            styles={CustomStyleWithoutRounded}
                                                            options={options}
                                                            menuPortalTarget={document.body}
                                                            isClearable={false}
                                                            isSearchable={false}
                                                            isDisabled={isChildParameter}
                                                        />

                                                        {/* Значение по умолчанию в зависимости от типа */}
                                                        {param.type === "TEXT" && (
                                                            <input
                                                                className={styleInputWithoutRounded + " font-medium w-[30%]"}
                                                                type="text"
                                                                value={param.default || ''}
                                                                onChange={(e) => updateParameter(param.id, 'default', e.target.value)}
                                                            />
                                                        )}

                                                        {param.type === "NUMBER" && (
                                                            <input
                                                                className={styleInputWithoutRounded + " font-medium w-[30%]"}
                                                                type="number"
                                                                value={param.default !== undefined ? param.default : ''}
                                                                onChange={(e) => updateParameter(param.id, 'default', e.target.value)}
                                                            />
                                                        )}

                                                        {param.type === "DATE" && (
                                                            <div style={{display: 'flex', alignItems: 'center'}}
                                                                 className="font-medium w-[30%]">
                                                                <input
                                                                    className={styleInputWithoutRounded + " w-[100%]"}
                                                                    type="date"
                                                                    value={param.default === true ? "" : param.default || ""}
                                                                    onChange={(e) => updateParameter(param.id, 'default', e.target.value || "")}
                                                                    style={{paddingRight: '45%'}}
                                                                />
                                                                <span className="text-xs" style={{
                                                                    marginLeft: '-70px',
                                                                    cursor: 'pointer',
                                                                }}>
                                                                    Текущая
                                                                </span>
                                                                <input
                                                                    className={styleInputWithoutRounded}
                                                                    type="checkbox"
                                                                    checked={param.default === true}
                                                                    onChange={(e) => updateParameter(param.id, 'default', e.target.checked)}
                                                                    style={{
                                                                        marginLeft: '5px',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {param.type === "BOOLEAN" && (
                                                            <div
                                                                className="w-[30%] text-center border border-slate-400 bg-white">
                                                                <input
                                                                    className="h-full w-[16px] cursor-pointer"
                                                                    type="checkbox"
                                                                    checked={param.default || false}
                                                                    onChange={(e) => updateParameter(param.id, 'default', e.target.checked)}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Кнопка удаления */}
                                                        <div
                                                            className="w-[5%] text-center border border-slate-400 bg-white">
                                                            <i className="fa-regular fa-trash-can text-red-600 hover:scale-125 cursor-pointer"
                                                               onClick={() => removeParamById(param.id)}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </RGL>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        Нет параметров.
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}