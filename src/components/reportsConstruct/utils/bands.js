/**
 * Добавляет основной бэнд с данными
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {string} tableName - имя таблицы/бэнда
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addDataBand = (editorView, tableName, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    if (editorView.getHtml().includes("data-band=\"true\"")) {
        return;
    }

    editorView.Components.addType('data-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
                        <p data-field="true" style="position: absolute; top: 60px; left: 20px; margin: 0px">Укажите поле из запроса в двойных скобках: {{field_1}}</p>
                    </div>
                `,
            },
        },
    });

    const components = editorView.getComponents();
    let insertAt = 0;

    // Пропускаем заголовок отчета, если он есть
    if (usedBands.reportTitle) {
        insertAt = 1;
    }

    // Пропускаем заголовок страницы, если он есть
    if (usedBands.headerPage) {
        insertAt = usedBands.reportTitle ? 2 : 1;
    }

    components.add('<div data-gjs-type="data-band-block"></div>', { at: insertAt });

    lockAllBandParents();
    lockAllBand();
};

/**
 * Добавляет дочерний бэнд
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {string} childName - имя дочернего бэнда
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addChildDataBand = (editorView, childName, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    editorView.Components.addType('data-child-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
                        <p data-field="true" style="position: absolute; top: 60px; left: 20px; margin: 0px; z-index: 9999">Дочерний бэнд: {{field_1}}</p>
                    </div>
                `,
            },
        },
    });

    const components = editorView.getComponents();
    if (usedBands.reportSummary && usedBands.footerPage) {
        components.add('<div data-gjs-type="data-child-band-block"></div>', { at: components.length - 2 });
    } else if (usedBands.reportSummary) {
        components.add('<div data-gjs-type="data-child-band-block"></div>', { at: components.length - 1 });
    } else {
        components.add('<div data-gjs-type="data-child-band-block"></div>');
    }
    lockAllBandParents();
    lockAllBand();
};

/**
 * Добавляет бэнд заголовка страницы
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addPageHeaderBand = (editorView, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    editorView.Components.addType('pageHeader-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
                    <div band="true" id="pageHeader" data-gjs-type="locked-band" style="height: 100px; width: ${widthPage}px; background: #fbfbfb; position: relative; border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                        <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; z-index: 9999">Заголовок страницы</h2>
                    </div>
                `,
            },
        },
    });

    const components = editorView.getComponents();
    if (usedBands.headerPage === false) {
        if (usedBands.reportTitle) {
            components.add('<div data-gjs-type="pageHeader-band-block"></div>', { at: 1 });
        } else {
            components.add('<div data-gjs-type="pageHeader-band-block"></div>', { at: 0 });
        }
        setUsedBands(prevState => ({ ...prevState, headerPage: true }));
    }
    lockAllBandParents();
    lockAllBand();
};

/**
 * Добавляет бэнд заголовка отчета
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addReportTitleBand = (editorView, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    editorView.Components.addType('reportTitle-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
        components.add('<div data-gjs-type="reportTitle-band-block"></div>', { at: 0 });
        setUsedBands(prevState => ({ ...prevState, reportTitle: true }));
    }
    lockAllBandParents();
    lockAllBand();
};

/**
 * Добавляет бэнд подвала страницы
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addPageFooterBand = (editorView, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    editorView.Components.addType('pageFooter-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
                        background: #fbfbfb; border: 0px dashed #3b82f6; padding: 0px 0px 0px 0px; overflow: visible;">
                        <h2 style="position: absolute; top: 30px; left: 20px; margin: 0px; width: 250px; z-index: 9999">Подвал страницы</h2>
                    </div>
                `,
            },
        },
    });

    const components = editorView.getComponents();
    if (usedBands.footerPage === false) {
        components.add('<div data-gjs-type="pageFooter-band-block"></div>', { at: components.length });
        setUsedBands(prevState => ({ ...prevState, footerPage: true }));
    }
    lockAllBandParents();
    lockAllBand();
};

/**
 * Добавляет бэнд подвала отчета
 * @param {Object} editorView - экземпляр редактора GrapesJS
 * @param {Object} usedBands - объект с состоянием бэндов
 * @param {Function} setUsedBands - функция обновления состояния
 * @param {string} widthPage - ширина страницы
 * @param {Function} lockAllBandParents - функция блокировки родителей
 * @param {Function} lockAllBand - функция блокировки бэндов
 */
export const addReportSummaryBand = (editorView, usedBands, setUsedBands, widthPage, lockAllBandParents, lockAllBand) => {
    editorView.Components.addType('reportSummary-band-block', {
        model: {
            defaults: {
                tagName: 'div',
                draggable: false,
                droppable: true,
                resizable: false,
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
                    </div>
                `,
            },
        },
    });

    const components = editorView.getComponents();
    if (usedBands.reportSummary === false) {
        components.add('<div data-gjs-type="reportSummary-band-block"></div>', { at: components.length });
        setUsedBands(prevState => ({ ...prevState, reportSummary: true }));
    }
    lockAllBandParents();
    lockAllBand();
};