// chartUtils.js - ПРОФЕССИОНАЛЬНАЯ ВЕРСИЯ

// Очистка пустых атрибутов графиков
export const cleanEmptyChartAttributes = (content) => {
    let cleaned = content;
    cleaned = cleaned.replace(/cjs-dataset-data-\d+=""/g, '');
    cleaned = cleaned.replace(/cjs-dataset-label-\d+=""/g, '');
    cleaned = cleaned.replace(/cjs-remove-dataset-\d+=""/g, '');
    cleaned = cleaned.replace(/cjs-add-background-color-\d+=""/g, '');
    cleaned = cleaned.replace(/cjs-add-border-color-\d+=""/g, '');
    cleaned = cleaned.replace(/cjs-dataset-border-width-\d+=""/g, '');
    return cleaned;
};

// Сохранение плейсхолдеров графиков
export const extractChartsPlaceholders = (content) => {
    const chartsPlaceholders = new Map();
    const tempParser = new DOMParser();
    const tempDoc = tempParser.parseFromString(content, 'text/html');
    const chartElements = tempDoc.querySelectorAll('[data-gjs-type="chartjs"]');

    chartElements.forEach(chartEl => {
        const chartId = chartEl.getAttribute('id');
        if (!chartId) return;

        const chartType = chartEl.getAttribute('cjs-chart-type');
        const chartHtml = chartEl.outerHTML;
        const placeholders = new Map();
        let labelsPlaceholder = null;

        const colorAttrs = {};
        const bgColorRegex = /cjs-dataset-background-color-(\d+)-(\d+)="([^"]*)"/g;
        let match;
        while ((match = bgColorRegex.exec(chartHtml)) !== null) {
            colorAttrs[`cjs-dataset-background-color-${match[1]}-${match[2]}`] = match[3];
        }
        const borderColorRegex = /cjs-dataset-border-color-(\d+)-(\d+)="([^"]*)"/g;
        while ((match = borderColorRegex.exec(chartHtml)) !== null) {
            colorAttrs[`cjs-dataset-border-color-${match[1]}-${match[2]}`] = match[3];
        }
        const borderWidthRegex = /cjs-dataset-border-width-(\d+)="([^"]*)"/g;
        while ((match = borderWidthRegex.exec(chartHtml)) !== null) {
            colorAttrs[`cjs-dataset-border-width-${match[1]}`] = match[2];
        }

        if (chartType === 'doughnut' || chartType === 'pie') {
            const dataMatch = chartHtml.match(/cjs-dataset-data-1="({{[^}]+}})"/);
            if (dataMatch) {
                placeholders.set(1, { data: dataMatch[1] });
            }
            const labelsMatch = chartHtml.match(/cjs-chart-labels="({{[^}]+}})"/);
            if (labelsMatch) {
                labelsPlaceholder = labelsMatch[1];
            }
        } else {
            const dataAttrRegex = /cjs-dataset-data-(\d+)="({{[^}]+}})"/g;
            while ((match = dataAttrRegex.exec(chartHtml)) !== null) {
                const datasetIndex = parseInt(match[1]);
                if (!placeholders.has(datasetIndex)) {
                    placeholders.set(datasetIndex, {});
                }
                placeholders.get(datasetIndex).data = match[2];
            }

            const labelAttrRegex = /cjs-dataset-label-(\d+)="([^"]*)"/g;
            while ((match = labelAttrRegex.exec(chartHtml)) !== null) {
                if (match[2] && match[2] !== '') {
                    const datasetIndex = parseInt(match[1]);
                    if (!placeholders.has(datasetIndex)) {
                        placeholders.set(datasetIndex, {});
                    }
                    placeholders.get(datasetIndex).label = match[2];
                }
            }

            const labelsMatch = chartHtml.match(/cjs-chart-labels="({{[^}]+}})"/);
            if (labelsMatch) {
                labelsPlaceholder = labelsMatch[1];
            }
        }

        chartsPlaceholders.set(chartId, { placeholders, labelsPlaceholder, chartType, colorAttrs });
    });

    return chartsPlaceholders;
};

// Функция для принудительного обновления графика при изменении Trait
const setupTraitChangeHandler = (component) => {
    const traits = component.get('traits');
    if (!traits || traits.length === 0) return;

    traits.forEach(trait => {
        if (trait.__handlerAttached) return;

        trait.on('change:value', () => {
            const traitName = trait.get('name');
            const value = trait.get('value');

            component.addAttributes({ [traitName]: value });

            const options = component.get('chartjsOptions');
            if (options && options.data && options.data.datasets) {
                const bgMatch = traitName.match(/cjs-dataset-background-color-(\d+)-(\d+)/);
                const borderMatch = traitName.match(/cjs-dataset-border-color-(\d+)-(\d+)/);
                const widthMatch = traitName.match(/cjs-dataset-border-width-(\d+)/);

                if (bgMatch) {
                    const pos = parseInt(bgMatch[1]);
                    const datasetId = parseInt(bgMatch[2]) - 1;
                    if (options.data.datasets[datasetId]) {
                        if (!options.data.datasets[datasetId].backgroundColor) {
                            options.data.datasets[datasetId].backgroundColor = [];
                        }
                        options.data.datasets[datasetId].backgroundColor[pos] = value;
                    }
                } else if (borderMatch) {
                    const pos = parseInt(borderMatch[1]);
                    const datasetId = parseInt(borderMatch[2]) - 1;
                    if (options.data.datasets[datasetId]) {
                        if (!options.data.datasets[datasetId].borderColor) {
                            options.data.datasets[datasetId].borderColor = [];
                        }
                        options.data.datasets[datasetId].borderColor[pos] = value;
                    }
                } else if (widthMatch) {
                    const datasetId = parseInt(widthMatch[1]) - 1;
                    if (options.data.datasets[datasetId]) {
                        options.data.datasets[datasetId].borderWidth = parseInt(value);
                    }
                }
            }

            setTimeout(() => {
                component.trigger('rerender');
            }, 50);
        });

        trait.__handlerAttached = true;
    });
};

// Добавление трейта цвета с возможностью указания позиции
const addColorTrait = (component, traitName, datasetId, colorValue, position = null) => {
    let trait = component.getTrait(traitName);

    if (!trait) {
        const category = {
            id: `cjs-dataset-options-${datasetId}`,
            label: `Набор ${datasetId}`
        };

        const traitConfig = {
            type: 'color',
            name: traitName,
            label: false,
            category: category,
            changeProp: true
        };

        if (position !== null) {
            component.addTrait(traitConfig, { at: position });
        } else {
            component.addTrait(traitConfig);
        }

        trait = component.getTrait(traitName);
    }

    if (trait && colorValue) {
        trait.set('value', colorValue);
        trait.setValue(colorValue);
        component.addAttributes({ [traitName]: colorValue });
    }

    setupTraitChangeHandler(component);

    return trait;
};

// Получение текущего количества трейтов
const getTraitsCount = (component) => {
    const traits = component.get('traits');
    return traits ? traits.length : 0;
};

// Поиск позиции трейта по текстовому содержимому (label или name)
const findTraitPositionByLabel = (component, searchText) => {
    const traits = component.get('traits');
    if (!traits || traits.length === 0) return -1;

    for (let i = 0; i < traits.models.length; i++) {
        const trait = traits.models[i];
        const label = trait.attributes?.label;
        const name = trait.attributes?.name;

        // console.log(trait.attributes.name)
        if (name.includes(searchText)) {
console.log(name)
            return i + 1; // Вставляем ПОСЛЕ этого трейта
        }
    }
    return -1;
};

// Восстановление плейсхолдеров графиков
export const restoreChartsPlaceholders = (editorView, chartsPlaceholders) => {
    if (!editorView || !chartsPlaceholders || chartsPlaceholders.size === 0) return;

    const charts = editorView.getWrapper().find('[cjs-chart-type]');

    charts.forEach(chart => {
        const chartId = chart.getId();
        const chartData = chartsPlaceholders.get(chartId);
        if (!chartData) return;

        const { placeholders: datasetPlaceholders, labelsPlaceholder, chartType, colorAttrs } = chartData;

        // ДЛЯ DOUGHNUT И PIE
        if (chartType === 'doughnut' || chartType === 'pie') {
            setTimeout(() => {
                if (labelsPlaceholder) {
                    chart.addAttributes({ 'cjs-chart-labels': labelsPlaceholder });
                }

                const dataset = datasetPlaceholders.get(1);
                if (dataset && dataset.data) {
                    chart.addAttributes({ 'cjs-dataset-data-1': dataset.data });
                }

                // Собираем цвета фона и границ
                const bgColorsList = [];
                const brdColorsList = [];

                Object.entries(colorAttrs).forEach(([attr, value]) => {
                    chart.addAttributes({ [attr]: value });

                    const bgMatch = attr.match(/cjs-dataset-background-color-(\d+)-(\d+)/);
                    const borderMatch = attr.match(/cjs-dataset-border-color-(\d+)-(\d+)/);

                    if (bgMatch) {
                        const pos = parseInt(bgMatch[1]);
                        const datasetId = parseInt(bgMatch[2]);
                        bgColorsList.push({ pos, datasetId, value, attr });
                    } else if (borderMatch) {
                        const pos = parseInt(borderMatch[1]);
                        const datasetId = parseInt(borderMatch[2]);
                        brdColorsList.push({ pos, datasetId, value, attr });
                    }
                });

                // Сортируем по позиции
                bgColorsList.sort((a, b) => a.pos - b.pos);
                brdColorsList.sort((a, b) => a.pos - b.pos);

                // Для doughnut/pie вставляем в конец
                let currentPosition = getTraitsCount(chart);

                // Добавляем все цвета фона подряд
                bgColorsList.forEach((item) => {
                    addColorTrait(chart, item.attr, item.datasetId, item.value, currentPosition);
                    currentPosition++;
                });

                // Добавляем все цвета границ подряд
                brdColorsList.forEach((item) => {
                    addColorTrait(chart, item.attr, item.datasetId, item.value, currentPosition);
                    currentPosition++;
                });

                const borderWidth = colorAttrs['cjs-dataset-border-width-1'];
                if (borderWidth) {
                    chart.addAttributes({ 'cjs-dataset-border-width-1': borderWidth });
                    addColorTrait(chart, 'cjs-dataset-border-width-1', 1, borderWidth, currentPosition);
                }

                chart.trigger('rerender');
            }, 100);
            return;
        }

        // ДЛЯ ОСТАЛЬНЫХ ГРАФИКОВ
        const currentDatasets = chart.get('chartjsOptions')?.data?.datasets || [];
        const currentCount = currentDatasets.length;
        const maxNeededIndex = Math.max(...Array.from(datasetPlaceholders.keys()), 0);
        const neededCount = maxNeededIndex;

        for (let i = currentCount; i < neededCount; i++) {
            chart.addNewDatasetTraitsGroup();
        }

        setTimeout(() => {
            const updatedAttrs = chart.getAttributes();
            const updatedChartjsOptions = chart.get('chartjsOptions');
            const updatedTraits = chart.get('traits');

            if (labelsPlaceholder && updatedAttrs['cjs-chart-labels'] !== labelsPlaceholder) {
                chart.addAttributes({ 'cjs-chart-labels': labelsPlaceholder });
                const labelsTrait = updatedTraits?.find(t => t.get('name') === 'cjs-chart-labels');
                if (labelsTrait) labelsTrait.set('value', labelsPlaceholder);
                if (updatedChartjsOptions?.data) updatedChartjsOptions.data.labels = labelsPlaceholder;
            }

            for (const [idx, placeholders] of datasetPlaceholders.entries()) {
                const dataAttr = `cjs-dataset-data-${idx}`;
                const labelAttr = `cjs-dataset-label-${idx}`;

                if (placeholders.data) chart.addAttributes({ [dataAttr]: placeholders.data });
                if (placeholders.label) chart.addAttributes({ [labelAttr]: placeholders.label });

                const dataTrait = updatedTraits?.find(t => t.get('name') === dataAttr);
                if (dataTrait && placeholders.data) dataTrait.set('value', placeholders.data);
                const labelTrait = updatedTraits?.find(t => t.get('name') === labelAttr);
                if (labelTrait && placeholders.label) labelTrait.set('value', placeholders.label);

                // Собираем цвета фона
                const bgColorsList = [];
                let pos = 0;
                while (true) {
                    const bgColorAttr = `cjs-dataset-background-color-${pos}-${idx}`;
                    const bgColorValue = updatedAttrs[bgColorAttr];
                    if (!bgColorValue || bgColorValue === '') break;
                    bgColorsList.push({ pos, value: bgColorValue, attr: bgColorAttr });
                    pos++;
                }

                // Собираем цвета границ
                const brdColorsList = [];
                pos = 0;
                while (true) {
                    const brdColorAttr = `cjs-dataset-border-color-${pos}-${idx}`;
                    const brdColorValue = updatedAttrs[brdColorAttr];
                    if (!brdColorValue || brdColorValue === '') break;
                    brdColorsList.push({ pos, value: brdColorValue, attr: brdColorAttr });
                    pos++;
                }

                // Обновляем chartjsOptions
                if (bgColorsList.length > 0 && updatedChartjsOptions?.data?.datasets[idx - 1]) {
                    updatedChartjsOptions.data.datasets[idx - 1].backgroundColor = bgColorsList.sort((a, b) => a.pos - b.pos).map(item => item.value);
                }
                if (brdColorsList.length > 0 && updatedChartjsOptions?.data?.datasets[idx - 1]) {
                    updatedChartjsOptions.data.datasets[idx - 1].borderColor = brdColorsList.sort((a, b) => a.pos - b.pos).map(item => item.value);
                }

                // Находим позицию после кнопки "Add background color" (по русскому или английскому)
                let startPositionBg = findTraitPositionByLabel(chart, 'cjs-add-background-color');
                let startPositionBrd = findTraitPositionByLabel(chart, 'cjs-add-border-color');





                // Добавляем все цвета фона подряд
                bgColorsList.sort((a, b) => a.pos - b.pos);
                bgColorsList.forEach((item) => {
                    addColorTrait(chart, item.attr, idx, item.value, startPositionBg);
                    startPositionBg++;
                });

                // Добавляем все цвета границ подряд
                brdColorsList.sort((a, b) => a.pos - b.pos);
                brdColorsList.forEach((item) => {
                    addColorTrait(chart, item.attr, idx, item.value, startPositionBrd);
                    startPositionBrd++;
                });

                const borderWidthAttr = `cjs-dataset-border-width-${idx}`;
                const borderWidthValue = updatedAttrs[borderWidthAttr];
                if (borderWidthValue && borderWidthValue !== '') {
                    chart.addAttributes({ [borderWidthAttr]: borderWidthValue });
                    addColorTrait(chart, borderWidthAttr, idx, borderWidthValue, bgColorsList);
                    if (updatedChartjsOptions?.data?.datasets[idx - 1]) {
                        updatedChartjsOptions.data.datasets[idx - 1].borderWidth = parseInt(borderWidthValue);
                    }
                }
            }

            if (updatedChartjsOptions) chart.set('chartjsOptions', updatedChartjsOptions);
            chart.trigger('rerender');
        }, 50);
    });
};

// Полная обработка графиков при загрузке
export const processChartsOnLoad = (editorView, content) => {
    if (!editorView) return;

    const chartsPlaceholders = extractChartsPlaceholders(content);

    let safeContent = content;
    safeContent = safeContent.replace(/cjs-chart-labels="\{\{[^}]+\}\}"/g, 'cjs-chart-labels="[]"');
    safeContent = safeContent.replace(/cjs-dataset-data-\d+="\{\{[^}]+\}\}"/g, 'cjs-dataset-data-1="[]"');

    const processedContent = cleanEmptyChartAttributes(safeContent);

    editorView.setComponents(processedContent);

    if (chartsPlaceholders.size > 0) {
        setTimeout(() => {
            restoreChartsPlaceholders(editorView, chartsPlaceholders);
        }, 150);
    }

    return processedContent;
};