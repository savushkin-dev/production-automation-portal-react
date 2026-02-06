import React, {useEffect, useRef, useState} from "react";


export function ViewReport({data, dataParam, html, css, onClose, isBookOrientation}) {

    const [printContent, setPrintContent] = useState("");
    const [uniqueStyles, setUniqueStyles] = useState("");
    const [fullHtml, setFullHtml] = useState("");
    const iframeRef = useRef(null);
    const [iframeScale, setIframeScale] = useState(1); // Начальный масштаб 1 (100%)



    const [pages, setPages] = useState([
        {id: 1, content: "", styles: ""}
    ]);

    let heightPage = isBookOrientation? "297mm": "210mm";
    let size = isBookOrientation? "A4": "A4 landscape"


    useEffect(() => {
        render(data, dataParam, html, css)
    }, [])


    // Обновление содержимого iframe при изменении данных
    useEffect(() => {
        if (iframeRef.current && printContent) {
            const fullHtml = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        <style>
                            @page { 
                                size: ${size};
                                margin: 0;
                            }
                            body, html {
                                /*font-family: Arial, 'Times New Roman', sans-serif;*/
                                margin: 0;
                                /*padding: 20px;*/
                                /*padding: 0;*/
                               
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
                                /*Надо учитывать высоту при рендере еще*/
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
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `;
            iframeRef.current.srcdoc = fullHtml;
            setFullHtml(fullHtml);
        }
    }, [printContent]);

    function prepareHtmlAndCss() {
        let pagesHtml = "";
        for (let i = 0; i < pages.length; i++) {
            pagesHtml += "<div class='page-container'>";
            pagesHtml += pages[i].content;
            pagesHtml += "</div> ";
            // pagesHtml += "<script>\n" +
            //     "        document.addEventListener('DOMContentLoaded', function() {\n" +
            //     "            // Получаем все элементы с data-field=\"true\"\n" +
            //     "            const fields = document.querySelectorAll('[data-field=\"true\"]');\n" +
            //     "            let clickTimeout;\n" +
            //     "            \n" +
            //     "            fields.forEach(field => {\n" +
            //     "                // Одинарный клик - скрываем поле\n" +
            //     "                field.addEventListener('click', function(e) {\n" +
            //     "                    clearTimeout(clickTimeout);\n" +
            //     "                    \n" +
            //     "                    clickTimeout = setTimeout(() => {\n" +
            //     "                        this.style.visibility = 'hidden';\n" +
            //     "                    }, 250);\n" +
            //     "                });\n" +
            //     "            });\n" +
            //     "        });\n" +
            //     "    </script>";
        }

        setPrintContent(pagesHtml)
    }

    useEffect(() => {
        prepareHtmlAndCss()
    }, [pages])


    function render(data, dataParam, html, css) {

        let startTime = performance.now();

        css = transformIDs(css);
        setUniqueStyles(css);
        renderDataBand(data, dataParam, html, css);

        let endTime = performance.now();
        const seconds = (endTime - startTime) / 1000; // Преобразуем миллисекунды в секунды
        // console.log("Рендер: " + seconds.toFixed(3))
    }

    function renderDataBand(data, dataParam, htmlTemplate, css) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlTemplate, 'text/html');
        const dataArray = data.tableData;
        // Удаляем описательные бэнды
        const descriptionBands = doc.querySelectorAll('[description-band="true"]');
        descriptionBands.forEach(description => description.remove());

        // Находим все главные бэнды
        const dataBands = doc.querySelectorAll('[data-band="true"]');
        let counterBand = 0;

        dataBands.forEach(band => {
            const bandId = band.getAttribute('id');
            let bandHtml = band.innerHTML;

            // Находим все дочерние бэнды для текущего главного
            // const childBands = Array.from(doc.querySelectorAll(`[data-band-child="true"][id^="${bandId}-child"]`));
            const childBands = Array.from(doc.querySelectorAll(`[data-band-child="true"]`));
            dataArray.forEach(item => {
                // if (bandId.toLowerCase().startsWith(item.tableName.toLowerCase())) {
                // Т.к. теперь будут передаваться только данные для одного бэнда, нету смысла искать данные по названию таблицы или бэнда
                    item.data.forEach(tableData => {
                        // Рендерим главный бэнд
                        let instanceHtml = replaceFieldsInHtml(bandHtml, tableData);
                        let bandCopy = band.cloneNode(true); // Глубокое клонирование

                        counterBand++;
                        instanceHtml = replaceFieldInHtml(instanceHtml, counterBand, "№")

                        bandCopy.innerHTML = instanceHtml;
                        doc.body.appendChild(bandCopy);

                        // Рендерим дочерние бэнды
                        childBands.forEach(originalChildBand => {
                            const childId = originalChildBand.getAttribute('id');
                            //Если есть логический параметр с таким же id как и у дочернего бэнда или когда параметр вообще отсутствует тогда рендерим дочерний элемент
                            if (dataParam[childId] || dataParam[childId] === undefined) {
                                const childHtml = originalChildBand.innerHTML;
                                const childInstanceHtml = replaceFieldsInHtml(childHtml, tableData);
                                // Клонируем ОРИГИНАЛЬНЫЙ дочерний бэнд (со всеми атрибутами и классами)
                                const childBandCopy = originalChildBand.cloneNode(true);
                                childBandCopy.innerHTML = childInstanceHtml;
                                doc.body.appendChild(childBandCopy);
                            }

                        });
                    });
                // }
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

        //Вставляем глобальные данные в бэнды
        bands.forEach(band => {
            band.innerHTML = replaceFieldsInHtml(band.innerHTML, data.globalVar)
        })

        // Разбиваем на страницы
        splitIntoA4Pages(doc.body.innerHTML, css, bands);

        return doc.body.innerHTML;
    }

    function replaceFieldsInHtml(html, data) {
        Object.keys(data).forEach(field => {
            let value = data[field];

            if(value === null){
                value = "-";
            }

            const style = data.style?.[field] || ''; // Получаем стиль для текущего поля
            // Если есть стиль для поля - оборачиваем в span
            if (style) {
                html = html.replaceAll(`{{${field}}}`, `<span style="${style}">${value}</span>`);
            }
            // Без стиля - просто подставляем значение
            else {
                html = html.replaceAll(`{{${field}}}`, value);
            }
        });
        return html;
    }

    function replaceFieldInHtml(html, value, field){
        html = html.replaceAll(`{{${field}}}`, value);
        return html;
    }

    function splitIntoA4Pages(htmlString, css, bands) {

        return new Promise((resolve) => {
            const startTime = performance.now();

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
                if(isBookOrientation){
                    maxHeight = 1103; // Высота с padding top bottom, обычная - 1123
                } else {
                    maxHeight = 774; // Высота с padding top bottom, обычная - 794
                }

                const currentBandsHeight = calculateCurrentBandsHeight(true, true, bandHeights);
                const initialHeight = tempContainer.scrollHeight + currentBandsHeight;
                let bandsWithPage = insertNumbPage(1, bands);
                insertBand(tempContainer, bandsWithPage, true, true);

                if (initialHeight <= maxHeight) {
                    const result = removeStyle(tempContainer.innerHTML);
                    resolve(result);
                    let page = [{id: 1, content: result, styles: css}];
                    setPages(page)
                    return;
                }

                //  Разбиение на страницы
                const pages = [];
                let currentPage = createPageTemplate(1, css);
                let currentPageHeight = 0;
                const childNodes = Array.from(bodyContainer.childNodes);


                for (let i = 0; i < childNodes.length; i++) {
                    const node = childNodes[i];


                    // Пропускаем style элементы
                    if (node.nodeName === "STYLE") {
                        continue;
                    }

                    // Пропускаем дочерние элементы (они будут обработаны вместе с родительскими)
                    if (node.getAttribute("id")?.includes('-child')) {
                        continue;
                    }

                    measureDiv.innerHTML = '';
                    measureDiv.appendChild(node.cloneNode(true));

                    // Собираем все дочерние элементы для текущего родителя
                    const childElements = [];
                    let j = i + 1;

                    // Собираем все последующие дочерние элементы
                    while (j < childNodes.length && childNodes[j].getAttribute("id")?.includes('-child')) {
                        childElements.push(childNodes[j]);
                        j++;
                    }

                    // Добавляем все дочерние элементы в measureDiv для расчета общей высоты
                    childElements.forEach(child => {
                        measureDiv.appendChild(child.cloneNode(true));
                    });

                    const totalNodeHeight = measureDiv.offsetHeight;

                    // Рассчитываем высоту с учетом бэндов
                    const isFirstPage = currentPage.id === 1;

                    // Пропускаем индексы дочерних элементов, которые уже обработаны
                    i += childElements.length;

                    const isLastNode = i === childNodes.length - 1;
                    let currentBandsHeight = calculateCurrentBandsHeight(isFirstPage, isLastNode, bandHeights);

                    const totalHeight = currentPageHeight + totalNodeHeight + currentBandsHeight;

                    // Если не помещается - сохраняем текущую страницу
                    if (totalHeight > maxHeight) {
                        bandsWithPage = insertNumbPage(pages.length + 1, bands);
                        finalizePage(currentPage, pages, bandsWithPage, false, false);
                        currentPage = createPageTemplate(pages.length + 1, css);
                        currentPageHeight = 0;
                        insertBand(currentPage.container, bandsWithPage, false, false);
                    }

                    // Добавляем родительский элемент
                    currentPage.container.querySelector('#body-container').appendChild(node.cloneNode(true));

                    // Добавляем все дочерние элементы
                    childElements.forEach(child => {
                        currentPage.container.querySelector('#body-container').appendChild(child.cloneNode(true));
                    });

                    currentPageHeight += totalNodeHeight;



                    // Если это последний узел - добавляем report footer
                    if (i >= childNodes.length-1) {  //Проверить или починилось
                        insertBand(currentPage.container, bands, false, true);
                        currentPageHeight += bandHeights.reportFooter;
                    }


                }

                bandsWithPage = insertNumbPage(pages.length + 1, bands);
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

                const duration = (performance.now() - startTime) / 1000;
                // console.log(`Разбиение выполнено за ${duration.toFixed(3)} сек`);
            }
        });
    }

    function insertNumbPage(numbPage, bands) {
        const bandsArray = Array.from(bands || []);
        const footerIndex = bandsArray.findIndex(el => el.id === "pageFooter");
        if (footerIndex === -1) return bandsArray;
        const newBands = [...bandsArray]; // поверхностная копия массива
        const footerClone = newBands[footerIndex].cloneNode(true); // клонируем только footer
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

    function insertBand(tempContainer, bands, addReportTitle, addReportSummary) {

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
                    tempContainer.querySelector('#footer-container').append(bands[i])
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
        if(isBookOrientation){
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
        // footerContainer.style.position = 'absolute';
        // footerContainer.style.bottom = '0';
        // footerContainer.style.left = '0';
        footerContainer.id = 'footer-container';
        tempDiv.appendChild(footerContainer);

        return tempDiv;
    }

    function transformIDs(css) { //т.к. нужно применять ко всем дубликатам бэнда
        return css.replace(/(?<!:)\#([a-zA-Z_][\w-]+)/g, (match, id) => {
            return `[id^='${id}']`; // заменяем #id на [id^='id']
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

    let iframeSize = isBookOrientation?  "w-[215mm] h-[297mm]" : "w-[302mm] h-[210mm]";

    return (
        <>
            <div>
                <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                    <div className="flex justify-start text-center ml-3 w-1/3">
                        <span className="gjs-pn-btn font-medium">Просмотр отчета</span>
                    </div>


                    <div className="flex justify-center text-center mr-2 w-1/3 ">
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            printReport()
                        }}
                              title="Экспорт PDF">
                            <i className="fa fa-file-pdf"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            exportHtml()
                        }}
                              title="Экспорт HTML">
                            <i className="fa fa-code"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            printReport()
                        }} title="Печать">
                            <i className="fa fa-print"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomOut}
                              title="Уменьшить масштаб">
                                <i className="fa fa-magnifying-glass-minus"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomIn}
                              title="Увеличить масштаб">
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
                        className={iframeSize + " origin-top border shadow-lg bg-white"}
                        // sandbox="allow-same-origin allow-scripts"
                    />

                </div>
            </div>
        </>
    )

//     // Функция экспорта PDF
//     const exportPDF = async (editor) => {
//
//         saveCurrentPage(editorView).then((updatedPages) => {
//
//             let combinedHTML = "";
//             let combinedCSS = "";
//
//             for (let i = 0; i < updatedPages.length; i++) {
//                 combinedHTML += `
//
//          <div class="print-page">
//             ${updatedPages[i].content}
//          </div>
//          `;
//                 combinedCSS += " " + updatedPages[i].styles;
//             }
//
//             // Создаем скрытый iframe для окна печати
//             const printFrame = document.createElement("iframe");
//             printFrame.style.position = "absolute";
//             printFrame.style.width = "0px";
//             printFrame.style.height = "0px";
//             printFrame.style.border = "none";
//
//             document.body.appendChild(printFrame);
//
//             const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;
//             printDocument.open("", "_blank");
//             printDocument.write(`
//
//                  <html>
//                     <head>
//                       <title>Печать</title>
//                       <style>
//                         ${combinedCSS}
//
//                         @media print {
//                         body {
//                           margin: 0;
//                           padding: 0;
//                           display: flex;
//                           flex-direction: column;
//                           align-items: center;
//                           -webkit-print-color-adjust: exact; /* Для Chrome и Safari */
//                           print-color-adjust: exact; /* Для Firefox */
//                           box-sizing: border-box;
//                         }
//                         .print-page {
//                           width: 100%;
//                           max-width: 100%;
//                           height: 100vh;
//                           min-height: 100vh;
//                           box-sizing: border-box;
//                           display: flex;
//                           flex-direction: column;
//                           justify-content: flex-start;
//                           align-items: flex-start;
//                           padding: 0;
//                           margin: 0 auto;
//                           position: relative;
//                           overflow: hidden;
//                           page-break-after: always; /* Стабильное разбиение страниц */
//                           break-after: page;
//                         }
//                         .print-page:last-child {
//                           page-break-after: auto; /* Убираем лишний пустой лист в конце */
//                         }
//                       }
//                         @page { size: A4; margin: 0; }
//                         body { width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden; }
//
//
//                       </style>
//                     </head>
//                     <body>${combinedHTML}
//                   </html>
//
//
//
//               `);
//
//             printDocument.close();
//
//             setTimeout(() => {
//                 printFrame.contentWindow.focus();
//                 document.title = "Report"
//                 printFrame.contentWindow.print();
//                 document.title = "React App"
//                 document.body.removeChild(printFrame);
//             }, 1000);
//
//         });
//     };
//
//     const printAllPages = async () => {
//         // 1. Создаем отдельное окно вместо iframe (лучше для больших документов)
//         const printWindow = window.open('', '_blank', 'width=800,height=600');
//         if (!printWindow) {
//             alert('Пожалуйста, разрешите всплывающие окна для печати');
//             return;
//         }
//
//         try {
//             // 2. Получаем данные страниц
//             const updatedPages = await saveCurrentPage(editorView);
//             if (!updatedPages.length) {
//                 printWindow.close();
//                 return;
//             }
//
//             // 3. Создаем базовую структуру документа
//             printWindow.document.open();
//             printWindow.document.write(`
//                   <!DOCTYPE html>
//                   <html>
//                   <head>
//                     <meta charset="UTF-8">
//                     <title>Печать</title>
//                     <style>
//                       @page {
//                         size: A4;
//                         margin: 0;
//                       }
//                       body {
//                         margin: 0;
//                         padding: 0;
//                         width: 210mm;
//                         overflow-x: hidden;
//                       }
//                       .print-page {
//                         width: 210mm;
//                         height: 297mm;
//                         page-break-after: always;
//                         position: relative;
//                         overflow: hidden;
//                       }
//                       .print-page:last-child {
//                         page-break-after: auto;
//                       }
//                     </style>
//                   </head>
//                   <body>
//                 `);
//
//             // 4. Используем DocumentFragment для пакетной вставки
//             const fragment = printWindow.document.createDocumentFragment();
//             const container = printWindow.document.createElement('div');
//             fragment.appendChild(container);
//
//             console.log(updatedPages)
//
//             // 5. Создаем страницы с использованием createElement (быстрее чем innerHTML)
//             for (let i = 0; i < updatedPages.length; i++) {
//                 const page = updatedPages[i];
//                 const pageDiv = printWindow.document.createElement('div');
//                 pageDiv.className = 'print-page';
//
//                 if (page.styles) {
//                     pageDiv.setAttribute('style', page.styles);
//                 }
//
//                 // Используем innerHTML только для контента страницы
//                 pageDiv.innerHTML = page.content;
//                 container.appendChild(pageDiv);
//
//                 // Даем браузеру "передохнуть" каждые 10 страниц
//                 if (i % 10 === 0) {
//                     await new Promise(resolve => setTimeout(resolve, 0));
//                 }
//             }
//
//             // 6. Вставляем все страницы одним действием
//             printWindow.document.body.appendChild(fragment);
//             printWindow.document.write('</body></html>');
//             printWindow.document.close();
//
//             // 7. Оптимизированная печать с задержкой для рендеринга
//             setTimeout(() => {
//                 const originalTitle = document.title;
//                 document.title = "Report";
//
//                 printWindow.focus();
//                 printWindow.print();
//
//                 // Восстановление состояния после печати
//                 setTimeout(() => {
//                     document.title = originalTitle;
//                     printWindow.close();
//                 }, 1000);
//             }, 500);
//
//         } catch (error) {
//             console.error('Print error:', error);
//             if (printWindow) printWindow.close();
//         }
//     };
//
//     const printReport2 = async () => {
//         const updatedPages = await saveCurrentPage(editorView);
//         try {
//             const response = await fetch(`${API_URL}/api/pdf/generate`, {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(updatedPages),
//             });
//
//             const pdfBlob = await response.blob();
//             const pdfUrl = URL.createObjectURL(pdfBlob);
//
//             const iframe = document.createElement('iframe');
//             iframe.style.display = 'none';
//             iframe.src = pdfUrl;
//             document.body.appendChild(iframe);
//
//             iframe.onload = () => {
//                 try {
//                     setTimeout(() => {
//                         iframe.contentWindow?.print();
//                     }, 500);
//                 } catch (e) {
//                     console.error('Print error:', e);
//                     document.body.removeChild(iframe);
//                     URL.revokeObjectURL(pdfUrl);
//                     alert('Ошибка при печати. Попробуйте снова или проверьте настройки печати.');
//                 }
//             };
//
//         } catch (error) {
//             console.error('Ошибка:', error);
//         }
//     }
//
//     const generatePdf = async () => {
//         const updatedPages = await saveCurrentPage(editorView);
//         try {
//             const response = await fetch(`${API_URL}/api/pdf/generate`, {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(updatedPages),
//             });
// //нужно доделать чтобы отображались русские символы и линия чтобы была до края при 100%
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = 'report.pdf';
//             link.click();
//         } catch (error) {
//             console.error('Ошибка:', error);
//         }
//     }


}