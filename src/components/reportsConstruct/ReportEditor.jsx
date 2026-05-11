import React, {forwardRef, useEffect, useRef, useState} from 'react';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./../reportsConstruct/ReportEditor.css";

import plugin from 'grapesjs-blocks-basic';
import grapesjs from "grapesjs";
import grapesjspresetwebpage from 'grapesjs-preset-webpage/dist/index.js';

import chartjsPlugin from 'grapesjs-chartjs-plugin'; // 👈 ДОБАВЬТЕ ЭТУ СТРОКУ
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

import yaml from "js-yaml";
import {GlobalVars} from "./GlobalVars";
import {ModalErrorScriptCompile} from "./ModalErrorScriptCompile";
import {defaultScript} from "../../data/report";


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

        const [dataBandsOpt, setDataBandsOpt] = useState(["main", "main-child"])
        const [dataBandsOptDropDown, setDataDropDown] = useState([
            {label: 'Основной бэнд', value: 'main'},
            {label: 'Дополнительный бэнд', value: 'main-child'},
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
        const [script, setScript] = useState(defaultScript);

        const [optReportsName, setOptReportsName] = useState([]);

        const [reportName, setReportName] = useState("report");
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

        const CANVAS_PADDING_HORIZONTAL = 100;
        const CANVAS_PADDING_VERTICAL = 30;


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
                dragMode: 'absolute',
                selectorManager: {componentFirst: true},
                storageManager: false, // Отключаем сохранение
                plugins: [grapesjspresetwebpage, plugin, chartjsPlugin],
                pluginsOpts: {
                    [chartjsPlugin]: {
                        // Выбираем только нужные типы графиков
                        blocks: ['chartjs-bar', 'chartjs-pie', 'chartjs-line', 'chartjs-doughnut', 'chartjs-polarArea',
                            'chartjs-radar', 'chartjs-bubble', 'chartjs-scatter'],

                        // Настройка категории
                        category: {
                            id: 'chartjs',
                            label: 'Графики'
                        },

                        // Chart.js опции
                        chartjsOptions: {
                            maintainAspectRatio: false,
                            responsive: true
                        }
                    }
                },
                blockManager: {
                    blocks: []
                },
                style: ` `,
                canvas: {},
                deviceManager: {
                    devices: [], // Очищаем список устройств
                },
            });

            // === НАСТРОЙКА ГРАФИКОВ ===

            editor.on('load', () => {
                const names = {
                    'chartjs-bar': 'Столбчатая диаграмма',
                    'chartjs-line': 'Линейный график',
                    'chartjs-pie': 'Круговая диаграмма',
                    'chartjs-doughnut': 'Кольцевая диаграмма',
                    'chartjs-polarArea': 'Полярная диаграмма',
                    'chartjs-radar': 'Радарная диаграмма',
                    'chartjs-bubble': 'Пузырьковая диаграмма',
                    'chartjs-scatter': 'Точечная диаграмма',
                };
                editor.BlockManager.getAll().forEach(b => {
                    if (names[b.get('id')]) {
                        b.set('label', `${names[b.get('id')]}`);
                        b.set('category', 'Графики');
                    }
                });
                editor.BlockManager.render();
            });

            const DI = {
                'cjs-chart-labels': 'Подписи данных',
                'cjs-chart-title': 'Заголовок графика',
                'cjs-chart-subtitle': 'Подзаголовок',
                'cjs-chart-width': 'Ширина графика',
                'cjs-chart-height': 'Высота графика',
                'cjs-add-dataset': 'Добавить набор данных',
                'dataset-label': 'Название набора',
                'dataset-data': 'Данные набора',
                'add-background-color': 'Добавить цвет фона',
                'add-border-color': 'Добавить цвет границы',
                'dataset-border-width': 'Толщина границы',
                'remove-dataset': 'Удалить набор',
                'dataset-background-color': 'Цвет фона',
                'dataset-border-color': 'Цвет границы',
                'dataset-custom-fill': 'Заливка',
                'dataset-custom-tension': 'Натяжение',
            };

            function t(key, num) {
                return num ? `${DI[key]} ${num}` : DI[key];
            }

            function fixCategoryLabels(editor) {
                // Исправляем заголовки категорий (они находятся вне компонента)
                setTimeout(() => {
                    const traitCategories = document.querySelectorAll('.gjs-trait-category .gjs-title');
                    traitCategories.forEach(category => {
                        const titleText = category.innerText || category.textContent;
                        // Проверяем, содержит ли заголовок "#X undefined"
                        if (titleText && titleText.includes('undefined')) {
                            const match = titleText.match(/#(\d+)/);
                            if (match) {
                                const num = match[1];
                                // Заменяем на правильный текст
                                if (titleText.includes('add-background-color') || titleText.includes('add-border-color')) {
                                    // Это категория цвета
                                    const newText = `Цветовые настройки #${num}`;
                                    if (category.childNodes.length > 1) {
                                        // Сохраняем иконку, меняем только текст
                                        const icon = category.querySelector('.gjs-caret-icon');
                                        if (icon && icon.nextSibling) {
                                            icon.nextSibling.textContent = ` Цветовые настройки #${num}`;
                                        } else {
                                            category.childNodes[category.childNodes.length - 1].textContent = ` Цветовые настройки #${num}`;
                                        }
                                    } else {
                                        category.textContent = newText;
                                        // Восстанавливаем иконку
                                        const icon = document.createElement('i');
                                        icon.className = 'gjs-caret-icon fa fa-caret-down';
                                        category.prepend(icon);
                                    }
                                }
                            }
                        }
                    });
                }, 100);
            }

            function fix(c) {
                if (!c || c.get?.('type') !== 'chartjs') return;

                (c.get('traits') || []).forEach(tr => {
                    const n = tr.get('name');
                    if (!n) return;
                    const num = n.match(/(\d+)$/)?.[1] || '';
                    let l = '';

                    if (DI[n]) l = t(n);
                    else if (n.startsWith('cjs-dataset-label-')) l = t('dataset-label', num);
                    else if (n.startsWith('cjs-dataset-data-')) l = t('dataset-data', num);
                    else if (n.startsWith('cjs-add-background-color-')) l = t('add-background-color', num);
                    else if (n.startsWith('cjs-add-border-color-')) l = t('add-border-color', num);
                    else if (n.startsWith('cjs-dataset-border-width-')) l = t('dataset-border-width', num);
                    else if (n.startsWith('cjs-remove-dataset-')) l = t('remove-dataset', num);
                    else if (n.startsWith('cjs-dataset-background-color-')) l = t('dataset-background-color', num);
                    else if (n.startsWith('cjs-dataset-border-color-')) l = t('dataset-border-color', num);
                    else if (n.startsWith('cjs-dataset-custom-fill-')) l = t('dataset-custom-fill', num);
                    else if (n.startsWith('cjs-dataset-custom-tension-')) l = t('dataset-custom-tension', num);

                    if (l) {
                        tr.set('label', l);
                        tr.set('text', l);
                        // Для button типа текст берется из value!
                        if (n.includes('add-') || n.includes('remove-')) {
                            tr.set('value', l);
                        }
                    }
                });

                // Дополнительно исправляем кнопки в DOM после обновления traits
                setTimeout(() => {
                    fixButtonsAndLabelsInDOM();
                }, 50);
            }

            function fixButtonsAndLabelsInDOM() {
                // Исправляем кнопки "Удалить набор"
                const removeButtons = document.querySelectorAll('.gjs-trt-trait--button button');
                removeButtons.forEach(btn => {
                    if (btn.textContent === 'undefined' || btn.textContent === 'undefined undefined') {
                        const parentTrait = btn.closest('.gjs-trt-trait__wrp');
                        if (parentTrait) {
                            const className = parentTrait.className;
                            const match = className.match(/cjs-remove-dataset-(\d+)/);
                            if (match) {
                                const num = match[1];
                                btn.textContent = `Удалить набор ${num}`;
                            } else {
                                btn.textContent = 'Удалить набор';
                            }
                        }
                    }
                });

                // Исправляем title у кнопок цветов
                const colorButtons = document.querySelectorAll('.cjs-button');
                colorButtons.forEach(btn => {
                    if (btn.title === 'undefined') {
                        const wrapper = btn.closest('[data-cjs-wrapper]');
                        if (wrapper) {
                            const isRemoveBtn = btn.hasAttribute('data-cjs-remove-color');
                            const id = wrapper.id;
                            const match = id ? id.match(/-(\d+)$/) : null;
                            const num = match ? match[1] : '';

                            if (isRemoveBtn) {
                                btn.title = num ? `Удалить цвет #${num}` : 'Удалить цвет';
                            } else {
                                btn.title = num ? `Добавить цвет #${num}` : 'Добавить цвет';
                            }
                        }
                    }
                });

                // Исправляем текстовые метки у контейнеров цветов
                const colorLabels = document.querySelectorAll('[data-cjs-label]');
                colorLabels.forEach(label => {
                    const span = label.querySelector('span') || label;
                    if (span.textContent === '' || span.textContent === 'undefined' || span.textContent.includes('undefined')) {
                        const wrapper = label.closest('[data-cjs-wrapper]');
                        if (wrapper) {
                            const id = wrapper.id;
                            const match = id ? id.match(/cjs-(add-background-color|add-border-color)-(\d+)/) : null;
                            if (match) {
                                const type = match[1] === 'add-background-color' ? 'фона' : 'границы';
                                const num = match[2];
                                span.textContent = `Добавить цвет ${type} ${num}`;
                            }
                        }
                    }
                });
            }

// Будем вызывать fix КАЖДЫЕ 300мс для выбранного компонента
            let intervalId = null;
            editor.on('component:selected', (c) => {
                if (intervalId) clearInterval(intervalId);
                if (c?.get?.('type') === 'chartjs') {
                    fix(c);
                    fixCategoryLabels(editor);
                    intervalId = setInterval(() => {
                        fix(c);
                        fixCategoryLabels(editor);
                    }, 300);
                }
            });

            editor.on('component:add', (c) => {
                if (c.get?.('type') === 'chartjs') {
                    setTimeout(() => {
                        fix(c);
                        fixCategoryLabels(editor);
                    }, 500);
                }
            });

// Также запускаем фикс после рендера компонента
            editor.on('component:update', (c) => {
                if (c?.get?.('type') === 'chartjs') {
                    setTimeout(() => {
                        fix(c);
                        fixCategoryLabels(editor);
                    }, 100);
                }
            });

// Мониторим изменения DOM для новых кнопок
            const observer = new MutationObserver(() => {
                fixButtonsAndLabelsInDOM();
                fixCategoryLabels(editor);
            });

            editor.on('load', () => {
                setTimeout(() => {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['title', 'textContent']
                    });
                }, 1000);
            });

// === КОНЕЦ ===

            // // Временно добавьте этот код для отладки
            // editor.on('component:selected', (component) => {
            //     if (component.get('type') === 'chartjs') {
            //         console.log('=== ВСЕ TRAITS ===');
            //         const traits = component.get('traits');
            //         traits.forEach((trait, index) => {
            //             console.log(`${index}: name="${trait.get('name')}", label="${trait.get('label')}", value="${trait.get('value')}"`);
            //         });
            //         console.log('================');
            //     }
            // });


            setTimeout(() => {
                const { width, height } = getPageDimensions(isBookOrientation);
                setupCanvas(editor, width, height);
            }, 200);

            editor.setComponents(pages[0].content);


            // Добавляем стили для блоков
            editor.Css.addRules(`

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
                
                /* Стиль для выделенного элемента */
                .gjs-selected {
                      outline: 2px solid #325ee1 !important;
                      outline-offset: -2px;
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

                // Включаем изменение размеров (тянуть за стороны) для всех новых компонентов
                component.set('resizable', true);
            });

            //Изменение размера с помощью мыши с учетом отступов канваса если элемент не вложенный
            editor.on('component:resize', (data) => {
                const component = data.component;
                const el = data.el;
                const type = data.type;

                if (!el || !component) return;

                const parent = component.parent();
                const isNested = parent && parent.getStyle &&
                    (parent.getStyle().position === 'relative' || parent.getStyle().position === 'absolute');

                if (type === 'start') {
                    const style = component.getStyle();
                    el.dataset.resizeStartLeft = parseFloat(style.left) || 0;
                    el.dataset.resizeStartTop = parseFloat(style.top) || 0;
                    return;
                }

                if (type === 'move') {
                    if (el.dataset.resizeStartLeft !== undefined) {
                        let currentLeft = parseFloat(component.getStyle().left) || 0;
                        let currentTop = parseFloat(component.getStyle().top) || 0;
                        let currentWidth = parseFloat(component.getStyle().width) || el.offsetWidth;
                        let currentHeight = parseFloat(component.getStyle().height) || el.offsetHeight;

                        let newLeft = currentLeft;
                        let newTop = currentTop;

                        if (isNested) {
                            // Для вложенных - компенсируем смещение на 1px влево и вверх
                            newLeft = currentLeft + 1;
                            newTop = currentTop + 1;
                        } else {
                            // Для корневых - компенсируем padding
                            newLeft = currentLeft - CANVAS_PADDING_HORIZONTAL;
                            newTop = currentTop - CANVAS_PADDING_VERTICAL;
                            if (newLeft < 0) newLeft = 0;
                            if (newTop < 0) newTop = 0;
                        }

                        component.addStyle({
                            left: newLeft + 'px',
                            top: newTop + 'px',
                            width: currentWidth + 'px',
                            height: currentHeight + 'px'
                        });
                    }
                    return;
                }

                if (type === 'end') {
                    let finalLeft = parseFloat(component.getStyle().left) || 0;
                    let finalTop = parseFloat(component.getStyle().top) || 0;
                    let finalWidth = parseFloat(component.getStyle().width) || el.offsetWidth;
                    let finalHeight = parseFloat(component.getStyle().height) || el.offsetHeight;

                    let correctedLeft = finalLeft;
                    let correctedTop = finalTop;

                    if (isNested) {
                        correctedLeft = finalLeft + 1;
                        correctedTop = finalTop + 1;
                    } else {
                        correctedLeft = finalLeft - CANVAS_PADDING_HORIZONTAL;
                        correctedTop = finalTop - CANVAS_PADDING_VERTICAL;
                        if (correctedLeft < 0) correctedLeft = 0;
                        if (correctedTop < 0) correctedTop = 0;
                    }

                    component.addStyle({
                        left: correctedLeft + 'px',
                        top: correctedTop + 'px',
                        width: finalWidth + 'px',
                        height: finalHeight + 'px'
                    });

                    delete el.dataset.resizeStartLeft;
                    delete el.dataset.resizeStartTop;
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
                const checkElementAndMove = () => {
                    const el = model.target.view?.el;
                    if (el instanceof Element && typeof el.getBoundingClientRect === 'function') {
                        moveComponentToTarget(model, false);
                        return true;
                    }
                    return false;
                };

                if (!checkElementAndMove()) {
                    // Подписываемся на событие рендера через editor
                    const onRender = () => {
                        if (checkElementAndMove()) {
                            editor.off('component:update', onRender);
                        }
                    };

                    // Используем более общее событие
                    editor.on('component:update', onRender);

                    // Запасной вариант с таймаутом
                    setTimeout(() => {
                        editor.off('component:update', onRender);
                        checkElementAndMove();
                    }, 500);
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

                const modelRectBefore = modelEl.getBoundingClientRect();

                const x = modelRectBefore.left + modelRectBefore.width / 2;
                const y = modelRectBefore.top + modelRectBefore.height / 2;

                const target = findTargetComponentAtPoint(editor.DomComponents.getComponents(), x, y, modelEl);

                // Получаем текущего родителя модели
                const currentParent = model.parent();

                // Проверяем, является ли цель бэндом
                const isTargetBand = target && target.view?.el && (
                    target.view.el.hasAttribute('data-band') ||
                    target.view.el.hasAttribute('band') ||
                    target.view.el.hasAttribute('data-band-child')
                );

                // Проверяем, является ли текущий родитель бэндом
                const isCurrentParentBand = currentParent && currentParent.view?.el && (
                    currentParent.view.el.hasAttribute('data-band') ||
                    currentParent.view.el.hasAttribute('band') ||
                    currentParent.view.el.hasAttribute('data-band-child')
                );

                // Случай 1: Перетаскивание НАД бэндом, который НЕ является текущим родителем
                if (isTargetBand && target !== currentParent) {
                    const modelTopBefore = modelRectBefore.top;
                    const modelLeftBefore = modelRectBefore.left;

                    // Вставляем модель внутрь нового бэнда
                    target.append(model);

                    // Компенсация отступа при перетаскивании
                    requestAnimationFrame(() => {
                        const modelElAfter = model.view?.el;
                        if (!modelElAfter) return;

                        const modelRectAfter = modelElAfter.getBoundingClientRect();
                        const deltaY = modelTopBefore - modelRectAfter.top;
                        const deltaX = modelLeftBefore - modelRectAfter.left;

                        const currentStyle = model.getStyle();
                        let currentLeft = parseFloat(currentStyle.left) || 0;
                        let currentTop = parseFloat(currentStyle.top) || 0;

                        if (currentStyle.position !== 'absolute') {
                            model.addStyle({ position: 'absolute' });
                        }

                        model.addStyle({
                            left: (currentLeft + deltaX) + 'px',
                            top: (currentTop + deltaY) + 'px'
                        });
                    });
                    return;
                }

                // Случай 2: Перетаскивание НЕ над бэндом И элемент находится внутри бэнда
                if (!isTargetBand && isCurrentParentBand) {
                    // Перемещаем в корень (wrapper)
                    const wrapper = editor.getWrapper();
                    if (wrapper && currentParent !== wrapper) {
                        const modelTopBefore = modelRectBefore.top;
                        const modelLeftBefore = modelRectBefore.left;
                        const canvasRect = editor.Canvas.getBody().getBoundingClientRect();

                        wrapper.append(model);

                        requestAnimationFrame(() => {
                            const modelElAfter = model.view?.el;
                            if (!modelElAfter) return;

                            // Вычисляем позицию относительно canvas
                            let newLeft = modelLeftBefore - canvasRect.left;
                            let newTop = modelTopBefore - canvasRect.top;

                            if (newLeft < 0) newLeft = 0;
                            if (newTop < 0) newTop = 0;

                            model.addStyle({
                                position: 'absolute',
                                left: newLeft + 'px',
                                top: newTop + 'px'
                            });
                        });
                    }
                    return;
                }

                // Случай 3: Перетаскивание внутри того же бэнда - ничего не делаем
                if (isTargetBand && target === currentParent) {
                    // Элемент уже в этом бэнде, просто обновляем позицию
                    const parentRect = currentParent.view.el.getBoundingClientRect();
                    let newLeft = modelRectBefore.left - parentRect.left;
                    let newTop = modelRectBefore.top - parentRect.top;

                    if (newLeft < 0) newLeft = 0;
                    if (newTop < 0) newTop = 0;

                    model.addStyle({
                        position: 'absolute',
                        left: newLeft + 'px',
                        top: newTop + 'px'
                    });
                    return;
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
                // Убираем индикаторы с возможных контейнеров
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });
            });

            // Обработчик события перемещения компонента
            editor.on("component:drag:stop", (model) => {
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

        const getPageDimensions = (isBookOrientation) => {
            return isBookOrientation
                ? { width: 794, height: 1123 }
                : { width: 1123, height: 794 };
        };

        const setupCanvas = (editor, width, height) => {
            const canvasElement = editor.Canvas.getElement();
            if (!canvasElement) return;

            canvasElement.style.width = `${width + (CANVAS_PADDING_HORIZONTAL * 2)}px`;
            canvasElement.style.height = `${height + (CANVAS_PADDING_VERTICAL * 2)}px`;
            isBookOrientation? canvasElement.style.marginLeft = '15%' : canvasElement.style.marginLeft = '5%';
            canvasElement.style.marginTop = '20px';
            canvasElement.style.overflow = 'hidden';

            const body = editor.Canvas.getBody();
            body.style.width = `${width}px`;
            body.style.height = `${height}px`;
            body.style.backgroundColor = '#ffffff';
            body.style.margin = '0 auto';
            body.style.display = 'block';
            body.style.overflow = 'hidden';

            editor.Css.addRules(`
                html {
                    padding: ${CANVAS_PADDING_VERTICAL}px ${CANVAS_PADDING_HORIZONTAL}px;
                    background-color: #ffffff;
                    box-sizing: border-box;
                }

                body {
                    position: relative;
                }

                [data-gjs-type="wrapper"] {
                    min-height: auto !important;
                    height: ${height}px !important;
                    max-height: ${height}px !important;
                    padding-top: 0 !important;
                    overflow: hidden !important;
                }
            `);
        };

        useEffect(() => {
            if (!editorView) return;
            const { width, height } = getPageDimensions(isBookOrientation);
            setupCanvas(editorView, width, height);
        }, [isBookOrientation]);

        const exportYAML = async () => {

            // Добавляем data-gjs-type всем графикам перед сохранением
            const charts = editorView.getWrapper().find('[cjs-chart-type]');
            charts.forEach(chart => {
                chart.addAttributes({ 'data-gjs-type': 'chartjs' });
            });

            saveCurrentPage(editorView).then((updatedPages) => {
                let css = cleanCSS(updatedPages[0].styles).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

                const toOneLine = (value) => {
                    if (typeof value === 'string') {
                        return value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                    }
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return JSON.stringify(value);
                    return String(value);
                };

                let resultWithoutScript = {
                    dbUrl: settingDB.url,
                    dbUsername: settingDB.username,
                    dbPassword: settingDB.password,
                    dbDriver: settingDB.driverClassName,
                    sql,
                    reportName: reportName,
                    reportCategory: reportCategory,
                    content: updatedPages[0].content,
                    styles: css,
                    sqlMode: isSqlMode,
                    dataBands: JSON.stringify(dataBandsOpt),
                    bookOrientation: isBookOrientation,
                    layoutParamSettings: toOneLine(layoutParamSettings),
                    layoutParam: toOneLine(layoutParam),
                    parameters: parameters,
                }

                try {
                    let yamlString = yaml.dump(resultWithoutScript, {indent: 2, lineWidth: -1, noRefs: true});

                    const cleanScript = script.replace(/\\r\\n/g, '\n').replace(/\\r/g, '\n');
                    const scriptLines = cleanScript.split('\n');
                    const scriptBlock = 'script: |-\n' + scriptLines.map(line => '  ' + line).join('\n');
                    const finalYaml = yamlString + scriptBlock + '\n';

                    const blob = new Blob([finalYaml], {type: "application/yaml"});
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = reportName + ".yaml";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error("Ошибка при экспорте отчета:", error);
                    setModalMsg("Ошибка при экспорте отчета.");
                    showModalNotif();
                }
            });
        };


        const importYAML = () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".yaml,.yml";
            fileInput.style.display = "none";

            // Обратная функция для toOneLine
            const fromOneLine = (value) => {
                if (typeof value === 'string') {
                    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                        try {
                            return JSON.parse(value);
                        } catch {
                            return value;
                        }
                    }
                    return value;
                }
                return value;
            };

            fileInput.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const yamlContent = e.target.result;
                        const importedData = yaml.load(yamlContent);

                        setPages([{id: 1, content: "", styles: ""}]);
                        setCurrentPage(1);

                        setSettingDB({
                            url: importedData.dbUrl,
                            username: importedData.dbUsername,
                            password: importedData.dbPassword,
                            driverClassName: importedData.dbDriver
                        });

                        setSql(importedData.sql);
                        setReportName(importedData.reportName);
                        setReportCategory(importedData.reportCategory);

                        editorView.setComponents(importedData.content);
                        editorView.setStyle(importedData.styles);

                        setParameters(importedData.parameters || []);
                        setIsSqlMode(importedData.sqlMode);
                        setScript(importedData.script || '');

                        setDataBandsOpt(JSON.parse(importedData.dataBands));
                        setIsBookOrientation(importedData.bookOrientation ?? true);

                        // Применяем fromOneLine к полям, которые были через toOneLine
                        setLayoutParamSettings(fromOneLine(importedData.layoutParamSettings));
                        setLayoutParam(fromOneLine(importedData.layoutParam));

                        setTimeout(() => defineBands(importedData.content), 200);

                        setModalMsg("Отчет успешно импортирован!");
                        showModalNotif();

                    } catch (error) {
                        console.error("Ошибка при импорте отчета:", error);
                        setModalMsg("Ошибка импорта отчета! Проверьте данные на корректность.");
                        showModalNotif();
                    }
                };
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
                const scaleValue = newZoom / 100;
                frame.style.transform = `scale(${scaleValue})`;
                frame.style.transformOrigin = "0 0";  // ВАЖНО: левый верхний угол
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

        // Зум при зажатом Alt + колесо мыши
        useEffect(() => {
            if (!editorView) return;

            let isAltPressed = false;

            const handleKeyDown = (e) => {
                if (e.altKey && !isAltPressed) {
                    isAltPressed = true;
                    document.body.classList.add('alt-zoom-active');
                }
            };

            const handleKeyUp = (e) => {
                if (!e.altKey && isAltPressed) {
                    isAltPressed = false;
                    document.body.classList.remove('alt-zoom-active');
                }
            };

            const handleWheel = (e) => {
                if (!isAltPressed && !e.altKey) return;

                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY > 0 ? -2 : 2;
                changeZoom(delta);
            };

            window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            return () => {
                window.removeEventListener('wheel', handleWheel, { capture: true });
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                document.body.classList.remove('alt-zoom-active');
            };
        }, [editorView]);

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
        setIsModalParameter(false);

        const data = await fetchReportData("", "", settingDB.url, settingDB.username,
            settingDB.password, settingDB.driverClassName, sql, "", "", params, script, isSqlMode)

        if (!data) {
            return
        }

        // 👇 ТЕСТОВЫЕ ДАННЫЕ С ТРЕМЯ ДАТАСЕТАМИ
        data.globalVar = {
            dynamicLabels: ['Янв', 'Фев', 'Март', 'Апр', 'Май'],
            dynamicData1: [100, 200, 150, 180, 220],
            set0: [50, 80, 120, 90, 60],
            dynamicData3: [30, 40, 60, 50, 45]
        };

// Также добавляем данные в каждую строку таблицы
        if (data.tableData && data.tableData.length > 0) {
            data.tableData = data.tableData.map(row => ({
                ...row,
                dynamicLabels: ['Янв222', 'Фев', 'Март', 'Апр', 'Май'],
                dynamicData1: [row.number_field, row.number_field + 100, row.number_field + 200, row.number_field + 150, row.number_field + 50],
                dynamicData2: [row.number_field + 50, row.number_field + 15, row.number_field + 25, row.number_field + 20, row.number_field + 10],
                dynamicData3: [row.number_field + 70, row.number_field + 45, row.number_field + 65, row.number_field + 80, row.number_field + 30],
                set1: [999, 99, row.number_field + 12, row.number_field + 9, row.number_field + 4]
            }));
        }
// 👆 ДО СЮДА

        setDataParam(params)
        setData(data)
        setHtml(editorView.getHtml())
        setCss(editorView.getCss())

        setIsJavaEditor(false)
        setIsViewMode(true)

        setTimeout(() => {
            setIsLoading(false)
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

            // Добавляем data-gjs-type всем графикам перед сохранением
            const charts = editorView.getWrapper().find('[cjs-chart-type]');
            charts.forEach(chart => {
                chart.addAttributes({ 'data-gjs-type': 'chartjs' });
            });

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
            let content = response.data.content;

            // Удаляем пустые атрибуты датасетов
            content = content.replace(/cjs-dataset-data-\d+=""/g, '');
            content = content.replace(/cjs-dataset-label-\d+=""/g, '');
            content = content.replace(/cjs-remove-dataset-\d+=""/g, '');
            content = content.replace(/cjs-add-background-color-\d+=""/g, '');
            content = content.replace(/cjs-add-border-color-\d+=""/g, '');
            content = content.replace(/cjs-dataset-border-width-\d+=""/g, '');

            // Сохраняем плейсхолдеры
            const datasetPlaceholders = new Map();
            let labelsPlaceholder = null;

            const dataAttrRegex = /cjs-dataset-data-(\d+)="({{[^}]+}})"/g;
            let match;
            while ((match = dataAttrRegex.exec(content)) !== null) {
                const datasetIndex = parseInt(match[1]);
                if (!datasetPlaceholders.has(datasetIndex)) {
                    datasetPlaceholders.set(datasetIndex, {});
                }
                datasetPlaceholders.get(datasetIndex).data = match[2];
            }

            const labelAttrRegex = /cjs-dataset-label-(\d+)="([^"]*)"/g;
            while ((match = labelAttrRegex.exec(content)) !== null) {
                if (match[2] && match[2] !== '') {
                    const datasetIndex = parseInt(match[1]);
                    if (!datasetPlaceholders.has(datasetIndex)) {
                        datasetPlaceholders.set(datasetIndex, {});
                    }
                    datasetPlaceholders.get(datasetIndex).label = match[2];
                }
            }

            const labelsMatch = content.match(/cjs-chart-labels="({{[^}]+}})"/);
            if (labelsMatch) {
                labelsPlaceholder = labelsMatch[1];
            }

            console.log('Found dataset placeholders:', Array.from(datasetPlaceholders.entries()));

            editorView.setComponents(content);
            editorView.setStyle(response.data.styles);

            // Функция для принудительного создания color trait И установки цвета
            function forceAddColorTrait(component, traitName, label, datasetId, colorValue) {
                let trait = component.getTrait(traitName);

                if (!trait) {
                    const category = {
                        id: `cjs-dataset-options-${datasetId}`,
                        label: `#${datasetId} Набор данных`
                    };

                    component.addTrait({
                        type: 'color',
                        name: traitName,
                        label: label,
                        category: category,
                        changeProp: true
                    });

                    trait = component.getTrait(traitName);
                    console.log(`Created color trait: ${traitName}`);
                }

                if (trait && colorValue) {
                    trait.set('value', colorValue);
                    trait.setValue(colorValue);

                    // Также обновляем атрибут
                    component.addAttributes({ [traitName]: colorValue });

                    console.log(`Set color value for ${traitName}: ${colorValue}`);
                }

                return trait;
            }

            setTimeout(() => {
                const charts = editorView.getWrapper().find('[cjs-chart-type]');

                charts.forEach(chart => {
                    const currentDatasets = chart.get('chartjsOptions')?.data?.datasets || [];
                    const currentCount = currentDatasets.length;
                    const maxNeededIndex = Math.max(...Array.from(datasetPlaceholders.keys()), 0);
                    const neededCount = maxNeededIndex;

                    for (let i = currentCount; i < neededCount; i++) {
                        console.log(`Adding dataset ${i + 1}`);
                        chart.addNewDatasetTraitsGroup();
                    }

                    setTimeout(() => {
                        const updatedAttrs = chart.getAttributes();
                        const updatedChartjsOptions = chart.get('chartjsOptions');
                        const updatedTraits = chart.get('traits');

                        // Восстанавливаем labels
                        if (labelsPlaceholder && updatedAttrs['cjs-chart-labels'] !== labelsPlaceholder) {
                            chart.addAttributes({ 'cjs-chart-labels': labelsPlaceholder });
                            const labelsTrait = updatedTraits?.find(t => t.get('name') === 'cjs-chart-labels');
                            if (labelsTrait) labelsTrait.set('value', labelsPlaceholder);
                            if (updatedChartjsOptions?.data) updatedChartjsOptions.data.labels = labelsPlaceholder;
                        }

                        // Восстанавливаем датасеты
                        for (const [idx, placeholders] of datasetPlaceholders.entries()) {
                            const dataAttr = `cjs-dataset-data-${idx}`;
                            const labelAttr = `cjs-dataset-label-${idx}`;

                            if (placeholders.data) chart.addAttributes({ [dataAttr]: placeholders.data });
                            if (placeholders.label) chart.addAttributes({ [labelAttr]: placeholders.label });

                            const dataTrait = updatedTraits?.find(t => t.get('name') === dataAttr);
                            if (dataTrait && placeholders.data) dataTrait.set('value', placeholders.data);
                            const labelTrait = updatedTraits?.find(t => t.get('name') === labelAttr);
                            if (labelTrait && placeholders.label) labelTrait.set('value', placeholders.label);

                            // Цвета фона
                            const bgColors = [];
                            let pos = 0;
                            while (true) {
                                const bgColorAttr = `cjs-dataset-background-color-${pos}-${idx}`;
                                const bgColorValue = updatedAttrs[bgColorAttr];
                                if (!bgColorValue || bgColorValue === '') break;
                                bgColors.push(bgColorValue);

                                // Принудительно создаем trait и устанавливаем цвет
                                forceAddColorTrait(chart, bgColorAttr, `Цвет фона ${pos + 1}`, idx, bgColorValue);

                                pos++;
                            }

// Цвета границ
                            const brdColors = [];
                            pos = 0;
                            while (true) {
                                const brdColorAttr = `cjs-dataset-border-color-${pos}-${idx}`;
                                const brdColorValue = updatedAttrs[brdColorAttr];
                                if (!brdColorValue || brdColorValue === '') break;
                                brdColors.push(brdColorValue);

                                // Принудительно создаем trait и устанавливаем цвет
                                forceAddColorTrait(chart, brdColorAttr, `Цвет границы ${pos + 1}`, idx, brdColorValue);

                                pos++;
                            }

                            // Толщина границы
                            const borderWidthAttr = `cjs-dataset-border-width-${idx}`;
                            const borderWidthValue = updatedAttrs[borderWidthAttr];
                            if (borderWidthValue && borderWidthValue !== '') {
                                chart.addAttributes({ [borderWidthAttr]: borderWidthValue });
                                const borderWidthTrait = updatedTraits?.find(t => t.get('name') === borderWidthAttr);
                                if (borderWidthTrait) borderWidthTrait.set('value', borderWidthValue);
                            }

                            // Обновляем chartjsOptions
                            if (updatedChartjsOptions?.data?.datasets && updatedChartjsOptions.data.datasets[idx - 1]) {
                                const dataset = updatedChartjsOptions.data.datasets[idx - 1];
                                if (placeholders.data) dataset.data = placeholders.data;
                                if (placeholders.label) dataset.label = placeholders.label;
                                if (bgColors.length > 0) dataset.backgroundColor = bgColors;
                                if (brdColors.length > 0) dataset.borderColor = brdColors;
                                if (borderWidthValue && borderWidthValue !== '') dataset.borderWidth = parseInt(borderWidthValue);
                            }
                        }

                        if (updatedChartjsOptions) chart.set('chartjsOptions', updatedChartjsOptions);
                        chart.trigger('rerender');
                    }, 50);
                });
                // editorView.render();
            }, 100);

            // Устанавливаем состояния
            setReportName(response.data.reportName);
            setReportCategory(response.data.reportCategory);
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
            console.error(error);
            setModalMsg("Ошибка загрузки отчета с сервера! Попробуйте еще раз.");
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


        return (
            <div>
                {isLoading && <Loading/>}


                {!isViewMode && isJavaEditor && <JavaEditor onClose={() => setIsJavaEditor(false)} parameters={parameters}
                                                            setParameters={setParameters} setScript={(e) => setScript(e)}
                                                            script={script} layout={layoutParamSettings}
                                                            setLayout={setLayoutParamSettings}
                />}

                {!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars &&


                    <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between gjs-pn-commands py-1">
                        <div className="flex justify-between text-center items-center pl-2 w-1/2">
                            <div>
                                <span className="text-lg font-medium">Конструктор отчетов</span>
                                <span className="px-2 text-lg">
                                     <i className="fa-solid fa-pencil"></i>
                                </span>
                            </div>

                            <button onClick={clickEnterPreviewMode}
                                    className="h-7 ml-8 text-nowrap px-2 text-sm  text-gray-600 rounded ring-1 ring-gray-300
                                     shadow hover:shadow-md hover:text-blue-700 hover:scale-105 transition duration-150 ">Предпросмотр
                                отчета <i className="fa-solid fa-eye"></i></button>

                        </div>

                        <div className="flex justify-end text-center mr-2 w-1/2">
                            <span className="gjs-pn-btn hover:bg-gray-200 hover:scale-110 transition duration-100"
                                  onClick={exportYAML}
                                  title="Экспорт шаблона">
                            <i className="fa fa-upload"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200 hover:scale-110 transition duration-100"
                                  onClick={importYAML}
                                  title="Импорт шаблона">
                            <i className="fa fa-download"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200 hover:scale-110 transition duration-100"
                                  onClick={showModalSaveReport}
                                  title="Сохранить шаблон на сервер">
                            <i className="fa-solid fa-sd-card"></i></span>
                            <span className="gjs-pn-btn hover:bg-gray-200 hover:scale-110 transition duration-100"
                                  onClick={() => {
                                      downloadReportsName();
                                  }}
                                  title="Загрузить шаблон с сервера">
                           <i className="fa-solid fa-cloud-arrow-down"></i></span>
                        </div>
                    </div>}

                {!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars &&
                    <div
                        className="pl-2 gjs-two-color gjs-one-bg flex flex-row justify-between items-center  gjs-pn-commands ">
                        <div className="flex flex-row gap-x-2">
                            <div className="px-1 py-2 hover:bg-gray-200">
                                <button onClick={addReportTitleBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportTitle.png" className="icon-band" alt="Report title"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Заголовок отчета</span>
                                </button>
                            </div>
                            <div className="px-1 py-2 hover:bg-gray-200">
                                <button onClick={addPageHeaderBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageHeader.png" className="icon-band" alt="Page header"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Заголовок страницы</span>
                                </button>
                            </div>
                            <div className="px-1 py-2 hover:bg-gray-200">
                                <button onClick={addReportSummaryBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportSummary.png" className="icon-band" alt="Report Summary"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Подвал отчета</span>
                                </button>
                            </div>
                            <div className="px-1 py-2 hover:bg-gray-200">
                                <button onClick={addPageFooterBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageFooter.png" className="icon-band" alt="Page footer"
                                         draggable="false"/>
                                    <span className="text-xs font-medium">Подвал страницы</span>
                                </button>
                            </div>
                            <div className="px-1 py-2 hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <img src="/icons/DataBand.png" className="icon-band" alt="Data band" draggable="false"/>
                                <DropdownObj options={dataBandsOptDropDown} onSelect={handleSelectTableBand}
                                             label={"Бэнды"}/>
                            </div>
                            <div
                                className=" px-1 py-2 hover:bg-gray-200 flex flex-col justify-center justify-items-center ">

                                <span className=" hover:bg-gray-200 flex justify-center mt-2 h-3">
                                    <i className="fa-lg fa-regular fa-copy pt-1"></i>
                                </span>
                                <Dropdown options={orientationOpt} onSelect={handleSelectOrientation}
                                          label={"Ориентация"}/>
                            </div>
                        </div>
                        <div className="flex flex-row gap-x-2 pr-2">


                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <button onClick={() => setIsGlobalVars(true)}
                                        className="flex flex-col justify-between justify-items-center pt-2">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                            <i className="fa-solid fa-earth-americas pt-1"></i>
                                        </span>
                                    <span className="text-xs font-medium px-1">Глобальные переменные</span>
                                </button>
                            </div>

                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">

                                <button onClick={() => setIsDesignerParameter(true)}
                                        className="flex flex-col justify-between justify-items-center pt-2">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                            <i className="fa-lg fa-solid fa-list-check pt-3"></i>
                                        </span>
                                    <span className="text-xs font-medium px-1">Дизайнер параметров</span>
                                </button>
                            </div>

                            {isSqlMode && <>
                                <div className="py-2 hover:bg-gray-200 flex-col justify-center justify-items-center">
                                    <button onClick={showModalSettingDB}
                                            className="flex flex-col justify-between justify-items-center">
                                        <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                                <i className="fa-lg fa-solid fa-server pt-3"></i>
                                        </span>
                                        <span className="text-xs font-medium px-1">Конфигурация БД</span>
                                    </button>
                                </div>
                                <div className="py-2 hover:bg-gray-200 flex-col justify-center justify-items-center">
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
                                <div className="py-2 hover:bg-gray-200 flex-col justify-center justify-items-center">
                                    <button onClick={() => setIsJavaEditor(true)}
                                            className="flex flex-col justify-between justify-items-center">
                                            <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                                    {/*<i className="fa-lg fa-solid fa-keyboard pt-3"></i>*/}
                                                <i className="fa-lg fa-regular fa-clipboard pt-3"></i>
                                            </span>
                                        <span className="text-xs font-medium px-1">Java редактор</span>
                                    </button>
                                </div>
                            </>}
                        </div>
                        <div className="flex flex-row gap-x-2 pr-3 py-3">
                            <div className="flex flex-row h-7">
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

                <div
                    className={!isViewMode && !isLoading && !isJavaEditor && !isDesignerParameter && !isGlobalVars ? 'block' : 'hidden'}>
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
                    <ModalErrorScriptCompile title={"Ошибка получения данных для отчета"} message={error}
                                             onClose={() => setIsModalErrorScript(false)}/>}

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
                                       onClose={() => setIsDesignerParameter(false)}/>
                }

                {!isViewMode && isGlobalVars &&
                    <GlobalVars onClose={() => setIsGlobalVars(false)}/>
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
