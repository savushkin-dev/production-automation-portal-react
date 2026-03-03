import React, {forwardRef, useEffect, useRef, useState} from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./../reportsConstruct/ReportEditor.css";

import plugin from 'grapesjs-blocks-basic';


import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

import jsPDF from "jspdf";
import grapesjs from "grapesjs";

import grapesjspresetwebpage from 'grapesjs-preset-webpage/dist/index.js';

import ru from 'grapesjs/locale/ru';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Dropdown from "../dropdown/Dropdown";
import {ModalInput} from "../modal/ModalInput";
import ReportService from "../../services/ReportService";
import {ModalNotify} from "../modal/ModalNotify";
import {ModalSelect} from "../modal/ModalSelect";
import {ModalSettingDB} from "./ModalSettingDB";
import {ModalSQL} from "./ModalSQL";
import Loading from "../loading/Loading";
import {decryptData, encryptData} from "../../utils/Сrypto";
import {JavaEditor} from "../javaEditor/JavaEditor";
import {ViewReport} from "./ViewReport";
import {DesignerParameter} from "./DesignerParameter";
import {ModalParameterWithLayout} from "./ModalParameterWithLayout";
import DropdownObj from "../dropdown/DropdownObj";
import {GlobalVars} from "./GlobalVars";
import {ModalErrorScriptCompile} from "./ModalErrorScriptCompile";


// Добавляем шрифт Roboto в виртуальную файловую систему pdfmake
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ReportEditor = forwardRef(({htmlProps, cssProps, onCloseReport}, ref) => {

        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);

        const [zoom, setZoom] = useState(100);
        const [editorView, setEditorView] = useState(null);

        const editorRef = useRef(null);

        const [pages, setPages] = useState([
            {id: 1, content: "", styles: ""}
        ]);
        const [currentPage, setCurrentPage] = useState(1); // Активная страница

        const [dataBandsOpt, setDataBandsOpt] = useState(["main","main-child"])
        const [dataBandsOptDropDown, setDataDropDown] = useState([
            { label: 'Основной бэнд', value: 'main' },
            { label: 'Дополнительный бэнд', value: 'main-child' },
        ])

        const [isViewMode, setIsViewMode] = useState(false);
        const [isModalParameter, setIsModalParameter] = useState(false);
        const [isModalSaveReport, setIsModalSaveReport] = useState(false);
        const [isModalNotify, setIsModalNotif] = useState(false);
        const [isModalError, setIsModalError] = useState(false);
        const [isModalErrorScript, setIsModalErrorScript] = useState(false);
        const [isModalDownloadReport, setIsModalDownloadReport] = useState(false);
        const [isModalSettingDB, setIsModalSettingDB] = useState(false);
        const [isModalSQL, setIsModalSQL] = useState(false);
        const [isJavaEditor, setIsJavaEditor] = useState(false);
        const [isDesignerParameter, setIsDesignerParameter] = useState(false);
        const [isGlobalVars, setIsGlobalVars] = useState(false);
        const [modalMsg, setModalMsg] = useState('');

        const [isSqlMode, setIsSqlMode] = useState(false);
        const [script, setScript] = useState("");

        const [optReportsName, setOptReportsName] = useState([]);

        const [reportName, setReportName] = useState("");
        const [reportCategory, setReportCategory] = useState("");
        const [parameters, setParameters] = useState([]);
        const [layoutParam, setLayoutParam] = useState("");
        const [layoutParamSettings, setLayoutParamSettings] = useState("");
        const [settingDB, setSettingDB] = useState({
            url: '',
            username: '',
            password: '',
            driverClassName: '',
        });
        const [sql, setSql] = useState("");
        const [isValidSql, setIsValidSql] = useState(true);

        const [usedBands, setUsedBands] = useState({
            reportTitle: false,
            headerPage: false,
            footerPage: false,
            reportSummary: false,
        });

        const [dataParam, setDataParam] = useState([]);
        const [data, setData] = useState([]);
        const [html, setHtml] = useState("");
        const [css, setCss] = useState("");

        const [isBookOrientation, setIsBookOrientation] = useState(true);
        const widthPage = isBookOrientation ? "794" : "1123";


        pdfMake.addVirtualFileSystem(pdfFonts);

        useEffect(() => {
            // Инициализация GrapesJS
            const editor = grapesjs.init({
                container: editorRef.current,
                telemetry: false,
                fromElement: true,
                height: 1200 + "px",
                width: 'auto',
                default_locale: 'ru',
                i18n: {
                    locale: 'ru',
                    detectLocale: true,
                    localeFallback: 'ru',
                    messages: {ru},
                },
                dragMode: 'absolute',  //https://github.com/GrapesJS/grapesjs/issues/1936 почитать, полезные вещи
                selectorManager: {componentFirst: true},
                storageManager: false, // Отключаем сохранение

                plugins: [grapesjspresetwebpage, plugin],

                blockManager: {
                    blocks: []
                },
                style: [],
                canvas: {},
                // Очищаем список устройств
                deviceManager: {
                    devices: [], // Полностью убираем все предустановленные размеры
                },
            });


            setTimeout(() => {

                const canvasElement = editor.Canvas.getElement()

                // Устанавливаем размеры канваса (формат A4)
                if (isBookOrientation) {
                    canvasElement.style.width = '794px';
                    canvasElement.style.height = '1123px';
                    canvasElement.style.marginLeft = '15%';
                    editor.Canvas.getBody().style.width = '794px';
                    editor.Canvas.getBody().style.height = '1123px';
                } else {
                    canvasElement.style.width = '1123px';
                    canvasElement.style.height = '794px';
                    canvasElement.style.padding = '20px'
                    editor.Canvas.getBody().style.width = '1123px';
                    editor.Canvas.getBody().style.height = '794px';
                    editor.Canvas.getBody().style.margin = '20px';

                }

                canvasElement.style.backgroundColor = '#949494';
                canvasElement.style.border = '5px';
                canvasElement.style.overflow = 'hidden';

                editor.Canvas.getBody().style.backgroundColor = '#9a9a9a';
                editor.Canvas.getBody().style.backgroundColor = '#ffffff';
                editor.Canvas.getBody().style.overflow = 'hidden';
            }, 200);

            editor.setComponents(pages[0].content);


            // Добавляем стили для блоков
            editor.Css.addRules(`
                .report-page {
                  width: 297mm;
                  height: 210mm;
                  padding: 20mm;
                  border: 1px solid #000;
                  margin-bottom: 20px;
                  background: #fff;
               
                  display: flex;
                  flex-direction: column;
                }
                .band {
                  width: 100%;
                  padding: 10px;
                  border: 1px dashed #000;
                  margin-bottom: 10px;
                  background: #f0f0f0;
                  min-height: 50px;
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start;
                  position: relative;
                }
                .band-content {
                  flex-grow: 1;
                }
        
                /* Стили для визуальной индикации */
                .droppable-hover {
                  border: 2px solid #00ff00 !important; /* Зеленая рамка при наведении */
                  background-color: rgba(0, 255, 0, 0.2);
                }
              `);

            // Добавляем блоки для перетаскивания
            const blocks = [
                {
                    id: "text-block",
                    label: '<i class=\"fa-solid fa-font\"></i>Текстовое поле',
                    content: '<div class="band-content" style="word-wrap: break-word; font-size: 14px; z-index:100">Введите текст...</div>',
                    category: "Текст",
                    draggable: true,
                    droppable: false,
                    //Нужно разрешить перемещать только в элементы котиорые являются бэндами!
                },
            ];

            blocks.forEach((block) => editor.BlockManager.add(block.id, block));


            //удаляем базовые блоки
            editor.BlockManager.remove('quote')
            editor.BlockManager.remove('link-block')
            editor.BlockManager.remove('text-basic')
            editor.BlockManager.remove('column1')
            editor.BlockManager.remove('column2')
            editor.BlockManager.remove('column3')
            editor.BlockManager.remove('column3-7')
            editor.BlockManager.remove('text')
            editor.BlockManager.remove('link')
            editor.BlockManager.remove('video')
            editor.BlockManager.remove('map')


            // Переименовываем категории у базового блока изобюражения
            editor.BlockManager.getAll().forEach(block => {
                if (block.getCategoryLabel() === 'Basic') {
                    block.set('category', 'Графика');
                    block.set('label', 'Изображение');
                }
            });


            editor.on('component:add', component => {
                const parent = component.parent();

                if (parent && parent.getStyle()['position'] === 'relative') {
                    const style = component.getStyle();
                    style.position = 'absolute';
                    style.top = style.top || '0px';
                    style.left = style.left || '0px';
                    component.setStyle(style);
                }
            });


            //для того чтобы сдвигать описание футера страницы при изменении высоты
            editor.on('component:styleUpdate:height', (component) => {
                if (component.getId() === 'pageFooter') {
                    const newHeight = parseInt(component.getStyle()['height']);
                    const targetComponent = editor.getWrapper().find('#lablePageFooter')[0];
                    if (targetComponent) {
                        targetComponent.addStyle({
                            'bottom': `${newHeight}px`,
                        });
                    }
                }
            });


            //событие при перетаскивании с панели компонентов
            editor.on('block:drag:stop', (block) => {
                setTimeout(() => {
                    moveComponentToTarget(block, true);
                }, 0);
            });

            //событие при перетаскивании компонентов
            editor.on('component:drag:end', model => {
                const el = model.target.view?.el;
                const ready = el instanceof Element && typeof el.getBoundingClientRect === 'function';

                if (ready) {
                    moveComponentToTarget(model, false);
                } else {
                    model.once('view:render', () => {
                        moveComponentToTarget(model, false);
                    });
                }
            });

            function moveComponentToTarget(param, isTarget) {
                let model;
                if (isTarget) {
                    model = param;
                } else {
                    model = param.target;
                }

                const modelEl = model.view?.el;
                if (!(modelEl instanceof Element)) {
                    console.warn('Нет DOM-элемента у перетаскиваемого компонента');
                    return;
                }

                const parentEl = modelEl.parentElement;
                const parentRect = parentEl.getBoundingClientRect();
                const modelRect = modelEl.getBoundingClientRect();

                const initialTop = modelRect.top - parentRect.top;
                // console.log("initialTop " + initialTop)

                const modelRectBefore = modelEl.getBoundingClientRect();

                const x = modelRectBefore.left + modelRectBefore.width / 2;
                const y = modelRectBefore.top + modelRectBefore.height / 2;

                // console.log("modelRectBefore.top " + modelRectBefore.top)

                const target = findTargetComponentAtPoint(editor.DomComponents.getComponents(), x, y, modelEl);


                if (target && target !== param.parent) {
                    const targetEl = target.view?.el;

                    if (targetEl) {
                        const modelTopBefore = modelRectBefore.top;
                        const modelLeftBefore = modelRectBefore.left;

                        if ((targetEl.getAttribute('data-band') === 'true') || (targetEl.getAttribute('band') === 'true')
                            || (targetEl.getAttribute('data-band-child') === 'true')) {
                            // Вставляем модель внутрь нового родителя
                            target.append(model);

                            //Компенсация отступа сверху при перетаскивании
                            requestAnimationFrame(() => {
                                const modelElAfter = model.view?.el;
                                if (!modelElAfter) return;

                                const modelRectAfter = modelElAfter.getBoundingClientRect();
                                const modelTopAfter = modelRectAfter.top;
                                const modelLeftAfter = modelRectAfter.left;

                                // Вычисляем разницу между старым и новым положением
                                const deltaY = modelTopBefore - (modelTopAfter);
                                const deltaX = modelLeftBefore - (modelLeftAfter);

                                // // Применяем компенсацию через CSS-трансформацию (менее затратно, чем top/left)
                                // model.target.addStyle({
                                //     transform: `translate(${deltaX}px, ${deltaY}px)`,
                                // });

                                // console.log("modelTopBefore: " + modelTopBefore)
                                // console.log("modelTopAfter: " + modelTopAfter)
                                // console.log("deltaY: " + deltaY)
                                model.addStyle({
                                    // position: 'relative',
                                    // top: `${deltaY}px`
                                    top: `20%`
                                });

                                // Через 1 кадр убираем компенсацию (после завершения анимации)
                                requestAnimationFrame(() => {
                                    model.addStyle({
                                        transform: 'none',
                                    });
                                });

                                // console.log(`Компенсировано смещение: X=${deltaX}px, Y=${deltaY}px`);
                            });
                        }
                    }
                }
            }


            function findTargetComponentAtPoint(components, x, y, ignoreEl) {
                let target = null;
                let topmostZIndex = -1;

                components.each(comp => {
                    if (!comp.view || !comp.view.el) return;
                    const el = comp.view.el;

                    if (el === ignoreEl || !(el instanceof HTMLElement)) return;

                    // Пропускаем невидимые элементы
                    if (el.style.display === 'none' || el.style.visibility === 'hidden' || el.style.opacity === '0') {
                        return;
                    }

                    try {
                        const rect = el.getBoundingClientRect();
                        const computedStyle = window.getComputedStyle(el);
                        const zIndex = parseInt(computedStyle.zIndex) || 0;

                        const isInside = x >= rect.left && x <= rect.right &&
                            y >= rect.top && y <= rect.bottom;

                        if (isInside && (el.hasAttribute('data-band') || el.hasAttribute('band') ||
                            el.hasAttribute('data-band-child'))) {

                            // Выбираем элемент с наибольшим z-index
                            if (zIndex > topmostZIndex) {
                                topmostZIndex = zIndex;
                                target = comp;
                            }
                        } else if (comp.components && !target) {
                            const nestedTarget = findTargetComponentAtPoint(comp.components(), x, y, ignoreEl);
                            if (nestedTarget) {
                                const nestedZIndex = parseInt(window.getComputedStyle(nestedTarget.view.el).zIndex) || 0;
                                if (nestedZIndex > topmostZIndex) {
                                    topmostZIndex = nestedZIndex;
                                    target = nestedTarget;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Ошибка проверки элемента:', e);
                    }
                });

                return target;
            }


            //парно удялем бэнд и его описание
            editor.on('component:remove', (component) => {

                if (component.attributes?.band === 'true' ||
                    component.getAttributes?.()?.band === 'true' || component.attributes?.['data-band'] === 'true' || component.getAttributes?.()?.['data-band'] === 'true'
                    || component.attributes?.['data-band-child'] === 'true' || component.getAttributes?.()?.['data-band-child'] === 'true') {
                    const parent = component.parent();
                    if (parent) {
                        // Ищем description-band в том же родителе
                        const description = parent.components().models.find(
                            c => c.attributes?.['description-band'] !== undefined || c.getAttributes?.()?.['description-band'] !== undefined
                        );
                        if (description) {
                            parent.remove();
                        }
                    }
                    defineBands(editor.getHtml())
                }

                if (component.attributes?.['description-band'] !== undefined ||
                    component.getAttributes?.()?.['description-band'] !== undefined) {
                    const parent = component.parent();
                    if (parent) {
                        const bandContent = parent.components().models.find(
                            c => c.attributes?.band === 'true' || c.getAttributes?.()?.band === 'true'
                        );
                        if (bandContent) {
                            parent.remove();
                        }
                    }
                    defineBands(editor.getHtml())
                }
            });

            // Событие начала перетаскивания компонента
            editor.on("component:drag:start", (model) => {
                // console.log("Началось перетаскивание компонента:", model);
                // Убираем индикаторы с возможных контейнеров
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });
            });

            // Обработчик события перемещения компонента
            editor.on("component:drag:stop", (model) => {
                // console.log("Перетаскивание завершено:", model);
                // Убираем индикатор с контейнера
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });

                // Проверяем, куда был вставлен компонент
                const parent = model.getParent();
                if (parent && parent.get("droppable")) {
                    parent.append(model); // Вставляем элемент внутрь родителя
                }
            });

            // Визуальная индикация, что контейнер может принимать компоненты
            editor.on("component:drag:stop", (model) => {
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });
            });


            editor.Panels.getButton('options', 'sw-visibility').set('active', true);

            // Добавляем кнопки для экспорта
            editor.Panels.addButton('options', [
                {
                    id: 'zoom-',
                    className: 'fa fa-magnifying-glass-minus',
                    command: () => changeZoom(-10),
                    attributes: {title: 'Уменьшить масштаб'},
                }, {
                    id: 'zoom+',
                    className: 'fa fa-magnifying-glass-plus',
                    command: () => changeZoom(10),
                    attributes: {title: 'Увеличить масштаб'},
                },
            ]);

            // Тип для заблокированного бэнда
            editor.Components.addType('locked-band', {
                model: {
                    defaults: {
                        draggable: false,
                        droppable: true,
                        copyable: false,
                        removable: true,
                        attributes: {
                            'data-locked-band': 'true'
                        },
                    },
                    isDraggable() {
                        return false;
                    }
                },
                view: {
                    onRender() {
                        // this.el.style.pointerEvents = 'none';
                    }
                }
            });

            addBlocks(editor);

            const restrictDragToCanvas = (component) => {
                const el = component.view?.el;
                if (!el) return;

                const canvas = editor.Canvas.getBody();
                const canvasWidth = canvas.offsetWidth;
                const canvasHeight = canvas.offsetHeight;

                const style = window.getComputedStyle(el);
                let newLeft = parseInt(style.left, 10) || 0;
                let newTop = parseInt(style.top, 10) || 0;


                const elementWidth = el.offsetWidth;
                const elementHeight = el.offsetHeight;


                if (newLeft < 0) newLeft = 0;
                if (newTop < 0) newTop = 0;
                if (newLeft + elementWidth > canvasWidth) newLeft = canvasWidth - elementWidth;
                if (newTop + elementHeight > canvasHeight) newTop = canvasHeight - elementHeight;

                component.addStyle({left: `${newLeft}px`, top: `${newTop}px`});
            };

            editor.on("component:drag:end", (event => {
                restrictDragToCanvas(event.target);
            }));

            // console.log(editor.Panels.getPanel('options'))

            editor.Panels.removeButton('options', 'preview');
            editor.Panels.removeButton('options', 'gjs-open-import-webpage');

            setEditorView(editor);

            document.querySelector('.gjs-pn-devices-c').querySelector('.gjs-pn-buttons').innerHTML = "" // удаляем дефолтный div с девайсами

            setEditorView(editor);

            setIsLoading(false);
        }, []);

        const orientationOpt = ["Книжная", "Альбомная"]


        useEffect(() => {
            if (editorView) {
                const panel = editorView.Panels.getButton('devices-c', 'currentPage');
                if (panel) {
                    panel.set('label', `${currentPage} / ${pages.length}`);
                }
            }
        }, [pages, currentPage]);


        const saveCurrentPage = async (editor) => {
            if (!editor) {
                return;
            }

            const html = editor.getHtml();
            const css = editor.getCss();

            return new Promise((resolve) => {
                setPages((prevPages) => {
                    const updatedPages = prevPages.map((page) => page.id === currentPage ? {
                        ...page,
                        content: html,
                        styles: css
                    } : page);
                    resolve(updatedPages);  // После обновления страницы вызываем resolve
                    return updatedPages;
                });

            });
        };


        const exportJSON = async () => {
            saveCurrentPage(editorView).then((updatedPages) => {
                let css = cleanCSS(updatedPages[0].styles)
                let result = {
                    dbUrl: settingDB.url,
                    dbUsername: settingDB.username,
                    dbPassword: settingDB.password,
                    dbDriver: settingDB.driverClassName,
                    sql,
                    reportName: reportName,
                    reportCategory: reportCategory,
                    content: updatedPages[0].content,
                    styles: css,
                    parameters: parameters,
                    sqlMode: isSqlMode,
                    script: script,
                    dataBands: JSON.stringify(dataBandsOpt),
                    bookOrientation: isBookOrientation,
                    layoutParamSettings: layoutParamSettings,
                    layoutParam: layoutParam
                }

                try {
                    const json = JSON.stringify(result, null, 2);
                    const blob = new Blob([json], {type: "application/json"});
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = reportName + ".json";
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {

                    }, 1000);
                    document.body.removeChild(link);
                } catch (error) {
                    console.error("Ошибка при сохранении и экспорте:", error);
                    setModalMsg("Ошибка при экспорте отчета! Попробуйте еще раз.")
                    showModalNotif();
                }
            })
        };


        const importJSON = () => {

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".json";
            fileInput.style.display = "none";

            fileInput.addEventListener("change", (event) => {

                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                setPages([{id: 1, content: "", styles: ""}])
                try {
                    reader.onload = (e) => {
                        const importedPages = JSON.parse(e.target.result);
                        // setPages(importedPages);
                        setCurrentPage(importedPages[0]?.id || 1);

                        setSettingDB({
                            url: importedPages.dbUrl,
                            username: importedPages.dbUsername,
                            password: importedPages.dbPassword,
                            driverClassName: importedPages.dbDriver
                        });
                        setSql(importedPages.sql);
                        setReportName(importedPages.reportName);
                        setReportCategory(importedPages.reportCategory)
                        editorView.setComponents(importedPages.content);
                        editorView.setStyle(importedPages.styles);
                        setParameters(importedPages.parameters);
                        setIsSqlMode(importedPages.sqlMode);
                        setScript(importedPages.script)
                        setDataBandsOpt(JSON.parse(importedPages.dataBands))
                        setIsBookOrientation(importedPages.bookOrientation);
                        setLayoutParam(importedPages.layoutParam);
                        setLayoutParamSettings(importedPages.layoutParamSettings);
                        defineBands(importedPages.content);
                    };
                } catch (error) {
                    console.error(error)
                    setModalMsg("Ошибка иморта отчета! Попробуйте еще раз.")
                    showModalNotif();
                }

                reader.readAsText(file);
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);

        };

        const updateCanvasZoom = (newZoom) => {
            if (!editorView) return;
            const frame = editorView.Canvas.getElement();
            if (frame) {
                const scaleValue = newZoom / 100; // Преобразуем проценты в scale
                frame.style.transform = `scale(${scaleValue})`;
                frame.style.transformOrigin = "0 0"; // Фиксируем точку начала
            }
        };

        const changeZoom = (value) => {
            setZoom((prevZoom) => {
                return Math.min(Math.max(prevZoom + value, 50), 120);
            });
        };


        useEffect(() => {
            if (editorView) updateCanvasZoom(zoom);
        }, [zoom]);


        function addBlocks(editor) {

            editor.BlockManager.add("h1", {
                label: "<i class=\"fa-solid fa-heading\"></i>1 Заголовок h1",
                content: "<div style='padding:0; font-size:2em; font-weight:bold; z-index:100 '>Заголовок h1</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h2", {
                label: "<i class=\"fa-solid fa-heading\"></i>2 Заголовок h2",
                content: "<div style='padding:0; font-size:1.5em; font-weight:bold; z-index:100 '>Заголовок h2</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h3", {
                label: "<i class=\"fa-solid fa-heading\"></i>3 Заголовок h3",
                content: "<div style='padding:0; font-size:1.17em; font-weight:bold; z-index:100 '>Заголовок h3</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h4", {
                label: "<i class=\"fa-solid fa-heading\"></i>4 Заголовок h4",
                content: "<div style='padding:0; font-size:1em; font-weight:bold; z-index:100 '>Заголовок h4</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h5", {
                label: "<i class=\"fa-solid fa-heading\"></i>5 Заголовок h5",
                content: "<div style='padding:0; font-size:0.83em; font-weight:bold; z-index:100 '>Заголовок h5</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h6", {
                label: "<i class=\"fa-solid fa-heading\"></i>6 Заголовок h6",
                content: "<div style='padding:0; font-size:0.67em; font-weight:bold; z-index:100 '>Заголовок h6</div>",
                category: "Заголовки",
            });

            editor.Blocks.add('line-block', {
                label: '<i class="fa-solid fa-window-minimize"></i> Горизонтальная линия',
                content: {
                    type: 'line',
                    tagName: 'div',
                    attributes: {class: 'line-block'},
                    style: {
                        'width': '100%',
                        'height': '2px',
                        'background-color': '#000',
                        'z-index': '100',
                        'margin': '0',
                    }
                },
                category: "Линии",
            });

            editor.Blocks.add('vertical-line-block', {
                label: '<i class="fa-solid fa-window-minimize fa-rotate-90"></i> Вертикальная линия',
                content: {
                    type: 'line',
                    tagName: 'div',
                    attributes: {class: 'vertical-line-block'},
                    style: {
                        'width': '2px',
                        'height': '100px',
                        'background-color': '#000',
                        'z-index': '99',
                        'margin': '0',
                        'display': 'inline-block',
                    }
                },
                category: "Линии",
            });
        }

        function addDataBand(tableName) {
            //Ограничение на один бэнд с данными пока что
            if (editorView.getHtml().includes("data-band=\"true\"")) {
                return;
            }

            editorView.Components.addType('data-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: true,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                              <div description-band="true" style="
                                   background: #f8b159;
                                   color: #434343;
                                   padding: 2px 8px;
                                   font-weight: bolder;
                                   font-size: 14px;
                                   pointer-events: none;
                              ">Главные данные</div>
                              <div data-band="true" id="${tableName}" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; background: #f6f6f6; position: relative; border: 0px dashed #f4f4f4; padding: 0px 0px 0px 0px; overflow: visible;">
                                 <p data-field="true"  style="position: absolute; top: 60px; left: 20px; margin: 0px">Укажите поле из запроса в двойных скобках: {{field_1}}</p>
                              </div>
                          `,
                        // script: function () {
                        //     this.querySelector('.data-band-field').addEventListener('click', function () {
                        //         alert('Будущее окно выбора поля из БД');
                        //     });
                        //     this.querySelector('.data-band-table').addEventListener('click', function () {
                        //         alert('Будущее окно выбора таблицы из БД');
                        //     });
                        // },
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary && usedBands.footerPage) {
                components.add('<div data-gjs-type="data-band-block"></div>', {at: components.length - 2});
            } else if (usedBands.reportSummary) {
                components.add('<div data-gjs-type="data-band-block"></div>', {at: components.length - 1});
            } else {
                components.add('<div data-gjs-type="data-band-block"></div>');
            }
        }

        function addChildDataBand(childName) {

            editorView.Components.addType('data-child-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: true,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                          <div description-band="true" style="
                               background: #cdcdcd;
                               color: #434343;
                               padding: 2px 8px;
                               font-weight: bold;
                               font-size: 14px;
                               pointer-events: none;
                          ">Второстепенные данные</div>
                          <div data-band-child="true" id="${childName}" data-gjs-type="locked-band" draggable="false" style="height: 100px; width: ${widthPage}px; background: #f6f6f6; position: relative; border: 0px dashed #f4f4f4; padding: 0px 0px 0px 0px; overflow: visible;">
                             <p data-field="true"  style="position: absolute; top: 60px; left: 20px; margin: 0px; z-index: 9999">Дочерний бэнд: {{field_1}}</p>
                          </div>
                       `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary && usedBands.footerPage) {
                components.add('<div data-gjs-type="data-child-band-block"></div>', {at: components.length - 2});
            } else if (usedBands.reportSummary) {
                components.add('<div data-gjs-type="data-child-band-block"></div>', {at: components.length - 1});
            } else {
                components.add('<div data-gjs-type="data-child-band-block"></div>');
            }
        }

        function addPageHeaderBand() {
            editorView.Components.addType('pageHeader-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: false,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                            <div description-band="true" style="
                               background: #cdcdcd;
                               color: #434343;
                               padding: 2px 8px;
                               font-weight: bold;
                               font-size: 14px;
                               pointer-events: none;
                          ">Заголовок страницы</div>
                            <div band="true" id="pageHeader" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; background: #fbfbfb; position: relative;
                              border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                               <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; z-index: 9999">Заголовок страницы</h2>
                            </div>
                          `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.headerPage === false) {
                if (usedBands.reportTitle) {
                    components.add('<div data-gjs-type="pageHeader-band-block"></div>', {at: 1}); // Добавляем вторым элементом
                } else {
                    components.add('<div data-gjs-type="pageHeader-band-block"></div>', {at: 0}); // Добавляем первым элементом
                }
                setUsedBands(prevState => ({...prevState, headerPage: true}))
            }
        }

        function addReportTitleBand() {
            editorView.Components.addType('reportTitle-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: false,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                            <div description-band="true" style="
                                   background: #cdcdcd;
                                   color: #434343;
                                   padding: 2px 8px;
                                   font-weight: bold;
                                   font-size: 14px;
                                   pointer-events: none;
                            ">Заголовок отчета</div>
                            <div band="true" id="reportTitle" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; background: #fbfbfb; position: relative; border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                               <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; z-index: 9999">Заголовок отчета</h2>
                            </div>
                               `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportTitle === false) {
                components.add('<div data-gjs-type="reportTitle-band-block"></div>', {at: 0}); // Добавляем первым элементом
                setUsedBands(prevState => ({...prevState, reportTitle: true}))
            }
        }

        function addPageFooterBand() {
            editorView.Components.addType('pageFooter-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: false,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                             <div description-band="true" id="lablePageFooter" style="
                                   background: #cdcdcd;
                                   color: #434343;
                                   padding: 2px 8px;
                                   font-weight: bold;
                                   font-size: 14px;
                                   pointer-events: none;
                                   position: absolute;
                                   bottom: 100px;
                                   width: ${widthPage}px;
                            ">Подвал страницы</div>
                             <div band="true" id="pageFooter" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; position: absolute; bottom: 0;
                              background: #fbfbfb;  border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                               <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; width: 250px; z-index: 9999">Подвал страницы</h2>
                            </div>
                            `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.footerPage === false) {
                components.add('<div data-gjs-type="pageFooter-band-block"></div>', {at: components.length});
                setUsedBands(prevState => ({...prevState, footerPage: true}))
            }
        }

        function addReportSummaryBand() {
            editorView.Components.addType('reportSummary-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        copyable: false,
                        removable: false,
                        attributes: {
                            'band-parent': 'true',
                        },
                        components: `
                            <div description-band="true" style="
                                   background: #cdcdcd;
                                   color: #434343;
                                   padding: 2px 8px;
                                   font-weight: bold;
                                   font-size: 14px;
                                   pointer-events: none;
                            ">Подвал отчета</div>
                            <div band="true" id="reportSummary" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; background: #fbfbfb; position: relative; border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                               <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; z-index: 9999">Подвал отчета</h2>
                            </div> `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary === false) {
                components.add('<div data-gjs-type="reportSummary-band-block"></div>', {at: components.length});
                setUsedBands(prevState => ({...prevState, reportSummary: true}))
            }
        }


        async function fetchReportData(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, content, styles, parameters, script, isSqlMode) {
            try {
                setIsLoading(true);
                const response = await ReportService.getDataForReport(reportName, reportCategory, encryptData(dbUrl), encryptData(dbUsername),
                    encryptData(dbPassword), dbDriver, encryptData(sql), content, styles, parameters, encryptData(script), isSqlMode);
                return response.data;
            } catch (e) {
                setError("Ошибка получения данных отчета: " + e.response.data.message)
                setIsModalErrorScript(true);
                setIsLoading(false);
            }
        }

        useEffect(() => {
            if (editorView) {
                editorView.UndoManager.clear(); // Полностью очищаем историю undo/redo
            }
        }, [pages])


        async function clickEnterPreviewMode(parameters) {
            setIsModalParameter(true);
        }

        async function enterPreviewMode(params) {
            params = ReportService.addDefaultParameters(params, parameters);
            let startTime = performance.now();
            setIsModalParameter(false);
            const data = await fetchReportData("", "", settingDB.url, settingDB.username,
                settingDB.password, settingDB.driverClassName, sql, "", "", params, script, isSqlMode)
            if (!data) {
                return
            }
            setDataParam(params)
            setData(data)
            setHtml(editorView.getHtml())
            setCss(editorView.getCss())

            setIsJavaEditor(false)
            setIsViewMode(true)

            setTimeout(() => {
                setIsLoading(false)

                let endTime = performance.now();
                const seconds = (endTime - startTime) / 1000; // Преобразуем миллисекунды в секунды
                // console.log("Рендер + данные: " + seconds.toFixed(3))
            }, 1300)

        }


        function defineBands(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            doc.getElementById('pageHeader') ? setUsedBands(prevState => ({
                ...prevState,
                headerPage: true
            })) : setUsedBands(prevState => ({...prevState, headerPage: false}))
            doc.getElementById('reportTitle') ? setUsedBands(prevState => ({
                ...prevState,
                reportTitle: true
            })) : setUsedBands(prevState => ({...prevState, reportTitle: false}))
            doc.getElementById('reportSummary') ? setUsedBands(prevState => ({
                ...prevState,
                reportSummary: true
            })) : setUsedBands(prevState => ({...prevState, reportSummary: false}))
            doc.getElementById('pageFooter') ? setUsedBands(prevState => ({
                ...prevState,
                footerPage: true
            })) : setUsedBands(prevState => ({...prevState, footerPage: false}))
        }

        const handleSelectTableBand = (option) => {
            if (option.endsWith("-child")) {
                addChildDataBand(option)
            } else {
                addDataBand(option);
            }
        };

        function showModalSaveReport() {
            setIsModalSaveReport(!isModalSaveReport)
        }

        function showModalNotif() {
            setIsModalNotif(!isModalNotify)
        }

        function showModalSettingDB() {
            setIsModalSettingDB(!isModalSettingDB)
        }

        function showModalSQL() {
            setIsModalSQL(!isModalSQL)
        }

        function showModalDownloadReport() {
            setIsModalDownloadReport(!isModalDownloadReport)
        }

        function cleanCSS(css) { //Для того чтобы убрать дубликаты стилей body и *
            const globalRules = {
                '*': new Set(),
                'body': new Set()
            };
            let otherRules = [];
            const rules = css.split('}');
            rules.forEach(rule => {
                const cleanedRule = rule.trim();
                if (!cleanedRule) return;
                const [selectorPart, ...propsParts] = cleanedRule.split('{');
                const selector = selectorPart.trim();
                const props = propsParts.join('{').trim();

                if (selector === '*' || selector === 'body') {
                    // Разбиваем свойства на отдельные декларации
                    props.split(';').forEach(prop => {
                        const cleanedProp = prop.trim();
                        if (cleanedProp) {
                            globalRules[selector].add(cleanedProp);
                        }
                    });
                } else {
                    // Сохраняем все другие правила
                    if (selector && props) {
                        otherRules.push(`${selector} { ${props} }`);
                    }
                }
            });
            const uniqueGlobalRules = [
                `* { ${Array.from(globalRules['*']).join('; ')} }`,
                `body { ${Array.from(globalRules['body']).join('; ')} }`
            ].filter(rule => !rule.endsWith('{ }')); // Удаляем пустые правила
            return [...uniqueGlobalRules, ...otherRules].join('\n');
        }

        async function saveReport(reportName) {
            showModalSaveReport();

            saveCurrentPage(editorView).then(async (updatedPages) => {
                let css = cleanCSS(updatedPages[0].styles)
                try {
                    await ReportService.createReportTemplate(reportName, reportCategory,
                        encryptData(settingDB.url), encryptData(settingDB.username), encryptData(settingDB.password), settingDB.driverClassName, encryptData(sql),
                        parameters,
                        updatedPages[0].content, css,
                        encryptData(script), isSqlMode, dataBandsOpt, isBookOrientation, layoutParamSettings, layoutParam);
                    setModalMsg("Документ успешно отправлен!");

                } catch (error) {
                    setModalMsg("Ошибка сохранения отчета на сервер! Попробуйте еще раз.")
                } finally {
                    showModalNotif();
                }
            })
        }

        async function downloadReport(reportName) {
            try {
                const response = await ReportService.getReportTemplateByReportName(reportName);
                editorView.setComponents(response.data.content);
                editorView.setStyle(response.data.styles);
                setReportName(response.data.reportName);
                setReportCategory(response.data.reportCategory)
                setSettingDB({
                    url: decryptData(response.data.dbUrl),
                    username: decryptData(response.data.dbUsername),
                    password: decryptData(response.data.dbPassword),
                    driverClassName: response.data.dbDriver
                });
                setSql(decryptData(response.data.sql));
                setParameters(JSON.parse(response.data.parameters));
                setScript(decryptData(response.data.script));
                setIsSqlMode(response.data.sqlMode);
                defineBands(response.data.content);
                setDataBandsOpt(JSON.parse(response.data.dataBands));
                setIsBookOrientation(response.data.bookOrientation);
                setLayoutParam(JSON.parse(response.data.layoutParams));
                setLayoutParamSettings(JSON.parse(response.data.layoutSettingsParams));
            } catch (error) {
                console.error(error)
                setModalMsg("Ошибка загрузки отчета с сервера! Попробуйте еще раз.")
                showModalNotif();
            } finally {
                showModalDownloadReport();
            }
        }

        useEffect(() => { //вызываем блокировку перемещения бэндов и других настроек при добавлении бэндов
            lockAllBandParents()
            lockAllBand()
        }, [usedBands])

        function lockAllBandParents() {
            const bandParents = editorView?.DomComponents?.getWrapper()?.find('[band-parent="true"]');
            if (!bandParents) return;
            bandParents.forEach(element => {
                element.set({
                    draggable: false,    // Запрещаем перетаскивание
                    resizable: false,    // Запрещаем изменение размера
                    highlightable: true,
                    copyable: false,
                    removable: true,
                    // Запрещаем изменение конкретных свойств позиционирования
                    unstylable: ['position', 'top', 'left', 'right', 'bottom', 'transform', 'margin', 'padding', 'display', 'float'],
                    // Фиксируем атрибуты
                    attributes: { //Если указывать то оно заменяет все старые атрибуты!!!
                        'data-locked-band': 'true',
                        'data-gjs-type': 'locked-band',
                        'data-position-locked': 'true',
                        'band-parent': 'true' // Сохраняем оригинальный атрибут
                    },
                    // Блокируем взаимодействие
                    // style: {
                    //     'pointer-events': 'none'
                    // }
                });
            });
        }

        function lockAllBand() {
            const bandParents = editorView?.DomComponents?.getWrapper()?.find('[band="true"], [data-band="true"], [data-band-child="true"]');
            if (!bandParents) return;
            bandParents.forEach(element => {
                element.set({
                    draggable: false,
                    resizable: false,
                    highlightable: true,
                    copyable: false,
                    removable: true,
                    // Запрещаем изменение конкретных свойств позиционирования
                    unstylable: ['position', 'top', 'left', 'right', 'bottom', 'transform', 'margin', 'padding', 'display', 'float'],
                });
            });
        }


        async function downloadReportsName() {
            try {
                const response = await ReportService.getReportsName();
                setOptReportsName(ReportService.convertReportsNameToSelectOpt(response.data));
                showModalDownloadReport();
            } catch (error) {
                setModalMsg("Ошибка загрузки доступных отчетов! Попробуйте позже.")
                showModalNotif();
            }
        }

        const handleChangeSettingDB = (field, value) => {
            setSettingDB((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        const extractTablesAndCheckSQL = () => {
            const tableRegex = /(?:FROM|JOIN|UPDATE|INTO)\s+([\w.]+)(?:\s|$|;|\))/gi;
            const foundTables = new Set();

            try {
                sql.split(';').forEach(query => {
                    let match;
                    while ((match = tableRegex.exec(query)) !== null) {
                        const tableName = match[1]
                            .replace(/["'`]/g, '') // Удаляем кавычки
                            .split(/\s+/)[0]; // Удаляем алиасы

                        if (tableName) {
                            foundTables.add(tableName);
                            foundTables.add(tableName + "-child");
                        }
                    }
                });
                // setDataBandsOpt(Array.from(foundTables).sort());
                setIsValidSql(true);
            } catch (e) {
                setDataBandsOpt([]);
            }
        };


        useEffect(() => {
            if (isSqlMode) {
                extractTablesAndCheckSQL();
            }
        }, [sql]);


        const selectScriptMethod = () => {
            setIsSqlMode(false);
        }

        const selectSQLMethod = () => {
            setIsSqlMode(true);
        }

        function handleSelectOrientation(option) {
            switch (option) {
                case "Книжная": {
                    setIsBookOrientation(true);
                    break;
                }
                case "Альбомная": {
                    setIsBookOrientation(false);
                    break;
                }
            }
        }

        useEffect(() => {
            const canvasElement = editorView?.Canvas?.getElement()
            if (canvasElement) {
                if (isBookOrientation) {
                    canvasElement.style.width = '794px';
                    canvasElement.style.height = '1123px';
                    editorView.Canvas.getBody().style.width = '794px';
                    editorView.Canvas.getBody().style.height = '1123px';
                    canvasElement.style.marginLeft = '15%';
                } else {
                    canvasElement.style.width = '1123px';
                    canvasElement.style.height = '794px';
                    editorView.Canvas.getBody().style.width = '1123px';
                    editorView.Canvas.getBody().style.height = '794px';
                    canvasElement.style.marginLeft = '5%';
                }
            }
        }, [isBookOrientation])


        return (
            <div>
                {isLoading && <Loading/>}


                {!isViewMode && isJavaEditor && <JavaEditor onClose={() => setIsJavaEditor(false)} parameters={parameters}
                                                            setParameters={setParameters} setScript={(e) => setScript(e)}
                                                            script={script} layout={layoutParamSettings} setLayout={setLayoutParamSettings}
                />}

                {!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars &&

                    <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                        <div className="flex justify-start text-center ml-2 w-1/3">
                            <span className="gjs-pn-btn font-medium">Конструктор отчетов</span>
                            <span className="gjs-pn-btn">
                                <i className="fa-solid fa-pencil"></i>
                            </span>
                            <button onClick={clickEnterPreviewMode}>Просмотр</button>
                        </div>

                        <div className="flex justify-end text-center mr-2 w-1/3">
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={exportJSON}
                                  title="Экспорт шаблона JSON">
                            <i className="fa fa-upload"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={importJSON}
                                  title="Импорт шаблона JSON">
                            <i className="fa fa-download"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={showModalSaveReport}
                                  title="Сохранить шаблон на сервер">
                            <i className="fa-solid fa-sd-card"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                                downloadReportsName();
                            }}
                                  title="Загрузить шаблон с сервера">
                           <i className="fa-solid fa-cloud-arrow-down"></i></span>
                        </div>
                    </div>}

                {!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars &&
                    <div
                        className="pl-2 gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands ">
                        <div className="flex flex-row gap-x-2">
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addReportTitleBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportTitle.png" className="icon-band" alt="Report title"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Заголовок отчета</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addPageHeaderBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageHeader.png" className="icon-band" alt="Page header"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Заголовок страницы</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addReportSummaryBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportSummary.png" className="icon-band" alt="Report Summary"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Подвал отчета</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addPageFooterBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageFooter.png" className="icon-band" alt="Page footer"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Подвал страницы</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <img src="/icons/DataBand.png" className="icon-band" alt="Data band" draggable="false"/>
                                <DropdownObj options={dataBandsOptDropDown} onSelect={handleSelectTableBand} label={"Бэнды"}/>
                            </div>
                            <div className=" hover:bg-gray-200 flex flex-col justify-center justify-items-center">

                                <span className=" hover:bg-gray-200 flex justify-center ">
                                    <i className="fa-regular fa-copy pt-1"></i>
                                </span>
                                <Dropdown options={orientationOpt} onSelect={handleSelectOrientation}
                                          label={"Ориентация"}/>
                            </div>
                        </div>
                        <div className="flex flex-row gap-x-2 pr-2">

                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <button onClick={() => setIsGlobalVars(true)}
                                        className="flex flex-col justify-between justify-items-center">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                            <i className="fa-solid fa-earth-americas pt-1"></i>
                                        </span>
                                    <span className="text-xs font-medium px-1">Глобальные переменные</span>
                                </button>
                            </div>

                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <button onClick={() => setIsDesignerParameter(true)}
                                        className="flex flex-col justify-between justify-items-center">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                            <i className="fa-solid fa-arrows-up-down-left-right pt-1"></i>
                                        </span>
                                    <span className="text-xs font-medium px-1">Дизайнер параметров</span>
                                </button>
                            </div>

                            {isSqlMode && <>
                                <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                    <button onClick={showModalSettingDB}
                                            className="flex flex-col justify-between justify-items-center">
                                <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                        <i className="fa-lg fa-solid fa-server pt-3"></i>
                                </span>
                                        <span className="text-xs font-medium px-1">Конфигурация БД</span>
                                    </button>
                                </div>
                                <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                    <button onClick={showModalSQL}
                                            className="flex flex-col justify-between justify-items-center">
                                <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                        <i className="fa-lg fa-solid fa-database pt-3"></i>
                                </span>
                                        <span className="text-xs font-medium px-1">SQL запрос</span>
                                    </button>
                                </div>
                            </>}

                            {!isSqlMode && <>
                                <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                    <button onClick={() => setIsJavaEditor(true)}
                                            className="flex flex-col justify-between justify-items-center">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                                <i className="fa-lg fa-solid fa-keyboard pt-3"></i>
                                        </span>
                                        <span className="text-xs font-medium px-1">Java редактор</span>
                                    </button>
                                </div>
                            </>}
                        </div>
                        <div className="flex flex-row gap-x-2 pr-3 py-3">
                            <div className="flex flex-row  ">
                                <button onClick={selectSQLMethod}
                                        className={isSqlMode ? "w-16 rounded-l-xl text-xs text-white font-medium shadow-inner bg-blue-800 hover:bg-blue-700" : "w-16 rounded-l-xl text-xs font-medium shadow-inner border border-slate-400 hover:bg-gray-200"}
                                >SQL
                                </button>
                                <button onClick={selectScriptMethod}
                                        className={isSqlMode ? "w-16 rounded-r-xl text-xs font-medium shadow-inner border border-slate-400 hover:bg-gray-200" : "w-16 rounded-r-xl text-xs text-white font-medium shadow-inner bg-blue-800 hover:bg-blue-700"}
                                >Скрипт
                                </button>
                            </div>
                        </div>
                    </div>}

                <div className={!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars ? 'block' : 'hidden'}>
                    <div id="editor" ref={editorRef}/>
                </div>


                {!isViewMode && isModalSaveReport &&
                    <ModalInput title={"Сохранение отчета на сервер"} message={"modalMsg"} onClose={showModalSaveReport}
                                onAgreement={saveReport} name={reportName}
                                onChangeName={(e) => setReportName(e.target.value)}
                                category={reportCategory} onChangeCategory={(e) => setReportCategory(e.target.value)}
                    />
                }

                {!isViewMode && isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={modalMsg} onClose={showModalNotif}/>}

                {!isViewMode && isModalError &&
                    <ModalNotify title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}

                {!isViewMode && isModalErrorScript &&
                    <ModalErrorScriptCompile title={"Ошибка получения данных для отчета"} message={error} onClose={() => setIsModalErrorScript(false)}/>}

                {!isViewMode && isModalDownloadReport &&
                    <ModalSelect title={"Загрузка отчета с сервера"} message={"modalMsg"}
                                 onClose={showModalDownloadReport}
                                 onAgreement={downloadReport} options={optReportsName}/>
                }

                {!isViewMode && isModalSettingDB &&
                    <ModalSettingDB url={settingDB.url} username={settingDB.username}
                                    password={settingDB.password} driverClassName={settingDB.driverClassName}
                                    onChangeField={handleChangeSettingDB}
                                    onClose={showModalSettingDB}/>
                }

                {!isViewMode && isModalSQL &&
                    <ModalSQL value={sql} isValid={isValidSql} parameters={parameters} setParameters={setParameters}
                              onChange={(e) => setSql(e.target.value)}
                              onClose={showModalSQL}/>
                }

                {!isViewMode && isModalParameter && <ModalParameterWithLayout parameters={parameters || []}
                                                                              layout={layoutParam}
                                                                    onSubmit={enterPreviewMode}
                                                                    onClose={() => {
                                                                        setIsModalParameter(false)
                                                                    }}
                />}

                {!isViewMode && isDesignerParameter &&
                    <DesignerParameter parameters={parameters || []} layout={layoutParam} setLayout={setLayoutParam}
                                       onClose={()=>setIsDesignerParameter(false)}/>
                }

                {!isViewMode && isGlobalVars &&
                    <GlobalVars onClose={()=>setIsGlobalVars(false)}/>
                }


                {isViewMode &&
                    <div className={isLoading ? "hidden" : ""}>
                        <ViewReport data={data} html={html} css={css} dataParam={dataParam}
                                    isBookOrientation={isBookOrientation}
                                    onClose={() => {
                                        setIsViewMode(false)
                                    }}
                        />
                    </div>
                }


            </div>
        );
    })
;

export default ReportEditor;
