import React, {useEffect, useRef, useState} from "react";
import {ModalNotify} from "../modal/ModalNotify";

export function ViewReport({data, dataParam, html, css, onClose, isBookOrientation}) {

    const [printContent, setPrintContent] = useState("");
    const [uniqueStyles, setUniqueStyles] = useState("");
    const [fullHtml, setFullHtml] = useState("");
    const iframeRef = useRef(null);
    const [iframeScale, setIframeScale] = useState(1);
    const [isModalNotify, setIsModalNotif] = useState(false);
    const [modalMsg, setModalMsg] = useState('');
    const [pages, setPages] = useState([{id: 1, content: "", styles: ""}]);

    let heightPage = isBookOrientation ? "297mm" : "210mm";
    let size = isBookOrientation ? "A4" : "A4 landscape"

    useEffect(() => {
        render(data, dataParam, html, css)
    }, [])

    useEffect(() => {
        if (iframeRef.current && printContent) {
            const finalHtml = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8" />
                <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
                <style>
                    @page { 
                        size: ${size};
                        margin: 0;
                    }
                    body, html {
                        margin: 0;
                        padding: 0 !important;
                        left: 0;
                        right: 0;
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                    }
                    .page-container {
                        position: relative;
                        page-break-after: always;
                        height: ${heightPage};
                        overflow: hidden;
                        margin: 0;
                        padding-left: 20px;
                        padding-right: 20px;
                        padding-top: 10px; 
                        padding-bottom: 10px;
                        left: 0;
                        right: 0;
                        box-sizing: border-box;
                    }
                    hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                    ${uniqueStyles}
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                (function() {
                    function initCharts() {
                        if (typeof Chart === 'undefined') {
                            setTimeout(initCharts, 100);
                            return;
                        }
                        
                        const chartDivs = document.querySelectorAll('[data-gjs-type="chartjs"]');
                        
                        chartDivs.forEach(function(div) {
                            try {
                                const chartType = div.getAttribute('cjs-chart-type');
                                const chartLabels = div.getAttribute('cjs-chart-labels');
                                const chartTitle = div.getAttribute('cjs-chart-title');
                                const chartSubtitle = div.getAttribute('cjs-chart-subtitle');
                                
                                if (!chartType) return;
                                
                                const isBubbleOrScatter = chartType === 'bubble' || chartType === 'scatter';
                                const datasets = [];
                                let datasetIndex = 1;
                                
                                while (true) {
                                    const datasetData = div.getAttribute(\`cjs-dataset-data-\${datasetIndex}\`);
                                    if (!datasetData) break;
                                    
                                    const datasetLabel = div.getAttribute(\`cjs-dataset-label-\${datasetIndex}\`);
                                    const borderWidth = div.getAttribute(\`cjs-dataset-border-width-\${datasetIndex}\`);
                                    
                                    // Собираем цвета в массив
                                    const bgColors = [];
                                    let pos = 0;
                                    while (true) {
                                        const color = div.getAttribute(\`cjs-dataset-background-color-\${pos}-\${datasetIndex}\`);
                                        if (!color) break;
                                        bgColors.push(color);
                                        pos++;
                                    }
                                    
                                    let backgroundColor = null;
                                    if (bgColors.length > 0) {
                                        backgroundColor = bgColors;
                                    } else {
                                        backgroundColor = div.getAttribute(\`cjs-dataset-background-color-\${datasetIndex}\`);
                                        if (!backgroundColor) {
                                            backgroundColor = div.getAttribute(\`cjs-dataset-background-color-0-\${datasetIndex}\`);
                                        }
                                    }
                                    
                                    // Собираем цвета границ
                                    const brdColors = [];
                                    pos = 0;
                                    while (true) {
                                        const color = div.getAttribute(\`cjs-dataset-border-color-\${pos}-\${datasetIndex}\`);
                                        if (!color) break;
                                        brdColors.push(color);
                                        pos++;
                                    }
                                    
                                    let borderColor = null;
                                    if (brdColors.length > 0) {
                                        borderColor = brdColors;
                                    } else {
                                        borderColor = div.getAttribute(\`cjs-dataset-border-color-\${datasetIndex}\`);
                                        if (!borderColor) {
                                            borderColor = div.getAttribute(\`cjs-dataset-border-color-0-\${datasetIndex}\`);
                                        }
                                    }
                                    
                                    let parsedData;
                                    let parsedLabels = null;
                                    
                                    if (isBubbleOrScatter) {
                                        // Для bubble/scatter - преобразуем числа в объекты
                                        const numbers = datasetData.split(',').map(Number);
                                        
                                        if (chartType === 'scatter') {
                                            parsedData = numbers.map((y, index) => ({ x: index, y: y }));
                                        } else {
                                            parsedData = numbers.map((value, index) => ({ x: index, y: value, r: Math.abs(value / 2) }));
                                        }
                                        
                                        // Лейблы для осей
                                        let labelsAttr = div.getAttribute(\`cjs-chart-labels-\${datasetIndex}\`);
                                        if (!labelsAttr) labelsAttr = chartLabels;
                                        if (labelsAttr) {
                                            parsedLabels = labelsAttr.split(',').map(Number);
                                        }
                                    } else {
                                        // Для обычных графиков
                                        parsedData = datasetData.split(',').map(Number);
                                    }
                                    
                                    const dataset = {
                                        label: datasetLabel || \`Набор \${datasetIndex}\`,
                                        data: parsedData,
                                        borderWidth: borderWidth ? parseInt(borderWidth) : 1
                                    };
                                    
                                    if (backgroundColor) dataset.backgroundColor = backgroundColor;
                                    if (borderColor) dataset.borderColor = borderColor;
                                    
                                    datasets.push(dataset);
                                    datasetIndex++;
                                }
                                
                                if (datasets.length === 0) return;
                                
                                // Сохраняем размеры
                                const originalWidth = div.style.width;
                                const originalHeight = div.style.height;
                                
                                // Создаем canvas
                                const canvas = document.createElement('canvas');
                                div.innerHTML = '';
                                div.appendChild(canvas);
                                
                                if (originalWidth) div.style.width = originalWidth;
                                if (originalHeight) div.style.height = originalHeight;
                                
                                canvas.style.width = '100%';
                                canvas.style.height = '100%';
                                
                                // Конфиг графика
                                const chartConfig = {
                                    type: chartType,
                                    data: {
                                        datasets: datasets
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            title: {
                                                display: !!(chartTitle && chartTitle !== 'undefined' && chartTitle !== ''),
                                                text: (chartTitle && chartTitle !== 'undefined') ? chartTitle : ''
                                            },
                                            subtitle: {
                                                display: !!(chartSubtitle && chartSubtitle !== 'undefined' && chartSubtitle !== ''),
                                                text: (chartSubtitle && chartSubtitle !== 'undefined') ? chartSubtitle : ''
                                            }
                                        }
                                    }
                                };
                                
                                // Добавляем лейблы для обычных графиков
                                if (!isBubbleOrScatter && chartLabels) {
                                    chartConfig.data.labels = chartLabels.split(',');
                                }
                                
                                // Для bubble/scatter добавляем оси
                                if (isBubbleOrScatter) {
                                    chartConfig.options.scales = {
                                        x: { type: 'linear', position: 'bottom', title: { display: true, text: 'X' } },
                                        y: { type: 'linear', title: { display: true, text: 'Y' } }
                                    };
                                }
                                
                                new Chart(canvas, chartConfig);
                            } catch(e) {
                                console.error('Chart init error:', e);
                            }
                        });
                    }
                    
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', initCharts);
                    } else {
                        initCharts();
                    }
                })();
            </script>
            </body>
            </html>
        `;
            iframeRef.current.srcdoc = finalHtml;
            setFullHtml(finalHtml);
        }
    }, [printContent]);

    function prepareHtmlAndCss() {
        let pagesHtml = "";
        for (let i = 0; i < pages.length; i++) {
            pagesHtml += "<div class='page-container'>";
            pagesHtml += pages[i].content;
            pagesHtml += "</div> ";
        }
        setPrintContent(pagesHtml)
    }

    useEffect(() => {
        prepareHtmlAndCss()
    }, [pages])

    function render(data, dataParam, html, css) {
        css = transformIDs(css);
        setUniqueStyles(css);
        renderDataBand(data, dataParam, html, css);
    }

    // ==================== ЗАМЕНА ДАННЫХ В ГРАФИКАХ ====================

    function replaceChartDataInHtml(html, rowData) {
        let result = html;

        // Заменяем cjs-chart-labels
        if (rowData.dynamicLabels) {
            const labelsValue = Array.isArray(rowData.dynamicLabels) ? rowData.dynamicLabels.join(',') : String(rowData.dynamicLabels);
            result = result.replace(/cjs-chart-labels="[^"]*"/, `cjs-chart-labels="${labelsValue}"`);
        }

        // Заменяем cjs-dataset-data-1
        if (rowData.dynamicData) {
            const dataValue = Array.isArray(rowData.dynamicData) ? rowData.dynamicData.join(',') : String(rowData.dynamicData);
            result = result.replace(/cjs-dataset-data-1="[^"]*"/, `cjs-dataset-data-1="${dataValue}"`);
        }

        return result;
    }

    // ==================== ФУНКЦИЯ ЗАМЕНЫ ПОЛЕЙ ====================

    function replaceFieldsInHtml(html, rowData) {
        if (!rowData) return html;

        let result = html;

        // Сначала заменяем обычные поля
        Object.keys(rowData).forEach(field => {
            let value = rowData[field];
            if (value === null || value === undefined) return;

            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            const regex = new RegExp(`\\{\\{${field}\\}\\}`, 'g');
            result = result.replace(regex, displayValue);
        });

        // Затем обрабатываем атрибуты графиков
        result = replaceChartDataInHtml(result, rowData);

        return result;
    }

    function replaceFieldInHtml(html, value, field) {
        return html.replaceAll(`{{${field}}}`, String(value));
    }

    // ==================== ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ====================

    function renderDataBand(data, dataParam, htmlTemplate, css) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlTemplate, 'text/html');
        const dataArray = data.tableData;

        // if (!data.tableData || data.tableData.length === 0) {
        //     setPages([{content: doc.body.innerHTML, css: ""}]);
        //     setModalMsg("Скрипт вернул пустые данные. Подстановка значений в отчет невозможна.");
        //     setIsModalNotif(true);
        //     return;
        // }

        // Удаляем описательные бэнды
        const descriptionBands = doc.querySelectorAll('[description-band="true"]');
        descriptionBands.forEach(description => description.remove());

        // Находим все главные бэнды
        const dataBands = doc.querySelectorAll('[data-band="true"]');
        let counterBand = 0;

        dataBands.forEach(band => {
            let bandHtml = band.innerHTML;
            const childBands = Array.from(doc.querySelectorAll(`[data-band-child="true"]`));

            dataArray.forEach((tableData, index) => {
                // Рендерим главный бэнд
                let instanceHtml = replaceFieldsInHtml(bandHtml, tableData);
                let bandCopy = band.cloneNode(true);

                // Применяем чередование фона
                if (index > 0 && index % 2 !== 0) {
                    bandCopy.style.backgroundColor = '#f6f6f6';
                }

                counterBand++;
                instanceHtml = replaceFieldInHtml(instanceHtml, counterBand, "№");

                bandCopy.innerHTML = instanceHtml;
                doc.body.appendChild(bandCopy);

                // Рендерим дочерние бэнды
                childBands.forEach(originalChildBand => {
                    const childId = originalChildBand.getAttribute('id');
                    if (dataParam[childId] || dataParam[childId] === undefined) {
                        const childHtml = originalChildBand.innerHTML;
                        const childInstanceHtml = replaceFieldsInHtml(childHtml, tableData);
                        const childBandCopy = originalChildBand.cloneNode(true);
                        childBandCopy.innerHTML = childInstanceHtml;
                        doc.body.appendChild(childBandCopy);
                    }
                });
            });

            // Удаляем оригинальные бэнды из шаблона
            doc.body.removeChild(band.parentNode);
            childBands.forEach(child => {
                if (child.parentNode) {
                    doc.body.removeChild(child.parentNode);
                }
            });
        });

        // Удаляем служебные бэнды
        const bands = doc.querySelectorAll('[band="true"]');
        bands.forEach(band => doc.body.removeChild(band.parentNode));

        // Вставляем глобальные данные в бэнды
        bands.forEach(band => {
            band.innerHTML = replaceFieldsInHtml(band.innerHTML, data.globalVar);
        });

        let finalHtml = doc.body.innerHTML;

        // Удаляем старый скрипт инициализации от плагина
        finalHtml = finalHtml.replace(/<script>var props = \{.*?<\/script>/gs, '');

        // Разбиваем на страницы
        splitIntoA4Pages(finalHtml, css, bands);

        return finalHtml;
    }

    function splitIntoA4Pages(htmlString, css, bands) {
        return new Promise((resolve) => {
            let currentBands = bands;
            const tempContainer = createTempContainer();
            tempContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                width: 794px;
                visibility: hidden;
            `;

            const bodyContainer = tempContainer.querySelector('#body-container');
            bodyContainer.innerHTML = `<style>${css}</style>${htmlString}`;
            document.body.appendChild(tempContainer);

            const bandHeights = {
                header: getBandHeight(bands, 'pageHeader'),
                footer: getBandHeight(bands, 'pageFooter'),
                reportHeader: getBandHeight(bands, 'reportTitle'),
                reportFooter: getBandHeight(bands, 'reportSummary')
            };

            const measureDiv = createTempContainer();
            measureDiv.style.cssText = `
                position: absolute;
                visibility: hidden;
                width: 794px;
            `;
            document.body.appendChild(measureDiv);

            try {
                let maxHeight;
                if (isBookOrientation) {
                    maxHeight = 1103;
                } else {
                    maxHeight = 774;
                }

                const currentBandsHeight = calculateCurrentBandsHeight(true, true, bandHeights);
                const initialHeight = tempContainer.scrollHeight + currentBandsHeight;
                let bandsWithPage = insertNumbPage(1, currentBands);
                insertBand(tempContainer, bandsWithPage, true, true);

                if (initialHeight <= maxHeight) {
                    const result = removeStyle(tempContainer.innerHTML);
                    resolve(result);
                    let page = [{id: 1, content: result, styles: css}];
                    setPages(page)
                    return;
                }

                const pages = [];
                let currentPage = createPageTemplate(1, css);
                let currentPageHeight = 0;
                const childNodes = Array.from(bodyContainer.childNodes);

                for (let i = 0; i < childNodes.length; i++) {
                    const node = childNodes[i];

                    if (node.nodeName === "STYLE") {
                        continue;
                    }

                    if (node.getAttribute("id")?.includes('-child')) {
                        continue;
                    }

                    measureDiv.innerHTML = '';
                    measureDiv.appendChild(node.cloneNode(true));

                    const childElements = [];
                    let j = i + 1;

                    while (j < childNodes.length && childNodes[j].getAttribute("id")?.includes('-child')) {
                        childElements.push(childNodes[j]);
                        j++;
                    }

                    childElements.forEach(child => {
                        measureDiv.appendChild(child.cloneNode(true));
                    });

                    const totalNodeHeight = measureDiv.offsetHeight;
                    i += childElements.length;

                    const isLastNode = i === childNodes.length - 1;
                    let currentBandsHeight = calculateCurrentBandsHeight(currentPage.id === 1, isLastNode, bandHeights);
                    const totalHeight = currentPageHeight + totalNodeHeight + currentBandsHeight;

                    if (totalHeight > maxHeight) {
                        bandsWithPage = insertNumbPage(pages.length + 1, currentBands);
                        finalizePage(currentPage, pages, bandsWithPage, false, false);
                        currentPage = createPageTemplate(pages.length + 1, css);
                        currentPageHeight = 0;

                        currentBands = bands;
                        const bandsForNewPage = insertNumbPage(pages.length + 1, currentBands);
                        insertBand(currentPage.container, bandsForNewPage, false, false);
                    }

                    currentPage.container.querySelector('#body-container').appendChild(node.cloneNode(true));
                    childElements.forEach(child => {
                        currentPage.container.querySelector('#body-container').appendChild(child.cloneNode(true));
                    });

                    currentPageHeight += totalNodeHeight;

                    if (i >= childNodes.length - 1) {
                        insertBand(currentPage.container, bands, false, true, false);
                        currentPageHeight += bandHeights.reportFooter;
                    }
                }

                bandsWithPage = insertNumbPage(pages.length + 1, currentBands);
                if (currentPage.container.querySelector('#body-container').childNodes.length > 0) {
                    finalizePage(currentPage, pages, bandsWithPage, false, false);
                }

                setPages(pages);
                resolve(pages[0]?.content || '');

            } catch (e) {
                console.error(e)
            } finally {
                safeRemove(tempContainer);
                safeRemove(measureDiv);
            }
        });
    }

    function insertNumbPage(numbPage, bands) {
        const bandsArray = Array.from(bands || []);
        const footerIndex = bandsArray.findIndex(el => el.id === "pageFooter");
        if (footerIndex === -1) return bandsArray;
        const newBands = [...bandsArray];
        const footerClone = newBands[footerIndex].cloneNode(true);
        footerClone.innerHTML = footerClone.innerHTML.replace(/{{page}}/g, numbPage);
        newBands[footerIndex] = footerClone;
        return newBands;
    }

    function safeRemove(element) {
        try {
            if (element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        } catch (error) {
            console.warn('Ошибка при удалении элемента:', error);
        }
    }

    function finalizePage(page, pages, bands, showReportHeader, showReportFooter) {
        if (pages.length === 0) {
            insertBand(page.container, bands, true, showReportFooter);
        } else {
            insertBand(page.container, bands, showReportHeader, showReportFooter);
        }
        page.content = page.container.innerHTML;
        pages.push(page);
        safeRemove(page.container);
    }

    function calculateCurrentBandsHeight(isFirstPage, isLastNode, bandHeights) {
        let height = 0;
        if (isFirstPage) {
            height += bandHeights.reportHeader;
        }
        height += bandHeights.header;
        height += bandHeights.footer;
        if (isLastNode) {
            height += bandHeights.reportFooter;
        }
        return height;
    }

    function createPageTemplate(id, css) {
        const container = createTempContainer();
        return {
            id,
            content: "",
            styles: css,
            container
        };
    }

    function removeStyle(htmlString) {
        let styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
        return htmlString.replace(styleRegex, '');
    }

    function insertBand(tempContainer, bands, addReportTitle, addReportSummary, addPageFooter = true) {
        for (let i = 0; i < bands.length; i++) {
            switch (bands[i].id) {
                case 'reportTitle': {
                    if (addReportTitle) tempContainer.querySelector('#header-container').prepend(bands[i])
                    break;
                }
                case 'pageHeader': {
                    tempContainer.querySelector('#header-container').append(bands[i])
                    break;
                }
                case 'reportSummary': {
                    if (addReportSummary) tempContainer.querySelector('#footer-container').prepend(bands[i])
                    break;
                }
                case 'pageFooter': {
                    if (addPageFooter) tempContainer.querySelector('#footer-container').append(bands[i])
                    break;
                }
            }
        }
    }

    function getBandHeight(bands, type) {
        let band;
        bands.forEach(node => {
            if (node.id === type) {
                band = node;
            }
        });
        if (!band) return 0;
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.appendChild(band)
        document.body.appendChild(temp);
        let height;
        if (type === 'pageFooter') {
            height = getFooterBandHeight()
        } else {
            height = temp.offsetHeight;
        }
        document.body.removeChild(temp);
        return height;
    }

    function getFooterBandHeight() {
        let footerPage = document.getElementById('pageFooter');
        if (footerPage != null) {
            return footerPage.offsetHeight
        } else {
            return 0;
        }
    }

    function createTempContainer() {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = 'relative';
        if (isBookOrientation) {
            tempDiv.style.height = "297mm"
        } else {
            tempDiv.style.height = "210mm"
        }
        const headerContainer = document.createElement('div');
        headerContainer.id = 'header-container';
        tempDiv.appendChild(headerContainer);
        const bodyContainer = document.createElement('div');
        bodyContainer.id = 'body-container';
        tempDiv.appendChild(bodyContainer);
        const footerContainer = document.createElement('div');
        footerContainer.id = 'footer-container';
        tempDiv.appendChild(footerContainer);
        return tempDiv;
    }

    function transformIDs(css) {
        return css.replace(/(?<!:)\#([a-zA-Z_][\w-]+)/g, (match, id) => {
            return `[id^='${id}']`;
        });
    }

    const zoomIn = () => {
        setIframeScale(prev => Math.min(prev + 0.1, 1.4));
    };

    const zoomOut = () => {
        setIframeScale(prev => Math.max(prev - 0.1, 0.6));
    };

    const printReport = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.print();
        }
    };

    const exportHtml = () => {
        const blob = new Blob([fullHtml], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    let iframeSize = isBookOrientation ? "w-[215mm] h-[297mm]" : "w-[302mm] h-[210mm]";

    return (
        <>
            <div>
                <div className="gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                    <div className="flex justify-start text-center ml-3 w-1/3">
                        <span className="gjs-pn-btn font-medium">Просмотр отчета</span>
                    </div>

                    <div className="flex justify-center text-center mr-2 w-1/3 ">
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={exportHtml} title="Экспорт HTML">
                            <i className="fa fa-code"></i>
                        </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={printReport} title="Печать">
                            <i className="fa fa-print"></i>
                        </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomOut} title="Уменьшить масштаб">
                            <i className="fa fa-magnifying-glass-minus"></i>
                        </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomIn} title="Увеличить масштаб">
                            <i className="fa fa-magnifying-glass-plus"></i>
                        </span>
                    </div>

                    <div className="flex justify-end items-center w-1/3 mr-3 ">
                        <button
                            className="h-[28px] px-3 rounded text-xs text-white font-medium shadow-inner bg-blue-800 hover:bg-blue-700"
                            onClick={onClose}>Закрыть
                        </button>
                    </div>
                </div>

                <div className="flex justify-center p-4 rounded-lg">
                    <iframe
                        ref={iframeRef}
                        title="report-preview"
                        style={{transform: `scale(${iframeScale})`}}
                        className={`${iframeSize} origin-top border shadow-lg bg-white`}
                    />
                </div>
            </div>

            {isModalNotify &&
                <ModalNotify title={"Результат операции"} message={modalMsg} onClose={() => setIsModalNotif(false)}/>}
        </>
    );
}