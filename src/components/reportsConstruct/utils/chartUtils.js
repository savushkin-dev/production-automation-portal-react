// chartUtils.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

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
        // Удаляем старый обработчик если есть
        if (trait.__handlerAttached) return;

        // Добавляем обработчик изменения
        trait.on('change:value', () => {
            const traitName = trait.get('name');
            const value = trait.get('value');

            // Обновляем атрибут
            component.addAttributes({ [traitName]: value });

            // Обновляем chartjsOptions
            const options = component.get('chartjsOptions');
            if (options && options.data && options.data.datasets) {
                // Парсим имя трейта
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

            // Перерисовываем график
            setTimeout(() => {
                component.trigger('rerender');
            }, 50);
        });

        trait.__handlerAttached = true;
    });
};

const forceAddColorTrait = (component, traitName, label, datasetId, colorValue) => {
    let trait = component.getTrait(traitName);

    if (!trait) {
        const category = {
            id: `cjs-dataset-options-${datasetId}`,
            label: `#${datasetId} Набор данных`
        };

        component.addTrait({
            type: 'color',
            name: traitName,
            label: false,
            category: category,
            changeProp: true
        });

        trait = component.getTrait(traitName);
    }

    if (trait && colorValue) {
        trait.set('value', colorValue);
        trait.setValue(colorValue);
        component.addAttributes({ [traitName]: colorValue });
    }

    // Настраиваем обработчик изменения
    setupTraitChangeHandler(component);

    return trait;
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

                // Восстанавливаем цвета и создаем Trait'ы
                Object.entries(colorAttrs).forEach(([attr, value]) => {
                    chart.addAttributes({ [attr]: value });

                    const match = attr.match(/cjs-dataset-(background|border)-color-(\d+)-(\d+)/);
                    if (match) {
                        const type = match[1] === 'background' ? 'фона' : 'границы';
                        const pos = parseInt(match[2]) + 1;
                        const datasetId = parseInt(match[3]);
                        const label = `Цвет ${type} ${pos}`;
                        forceAddColorTrait(chart, attr, label, datasetId, value);
                    }
                });

                const borderWidth = colorAttrs['cjs-dataset-border-width-1'];
                if (borderWidth) {
                    chart.addAttributes({ 'cjs-dataset-border-width-1': borderWidth });
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

                const bgColors = [];
                let pos = 0;
                while (true) {
                    const bgColorAttr = `cjs-dataset-background-color-${pos}-${idx}`;
                    const bgColorValue = updatedAttrs[bgColorAttr];
                    if (!bgColorValue || bgColorValue === '') break;
                    bgColors.push(bgColorValue);
                    forceAddColorTrait(chart, bgColorAttr, `Цвет фона ${pos + 1}`, idx, bgColorValue);
                    pos++;
                }

                const brdColors = [];
                pos = 0;
                while (true) {
                    const brdColorAttr = `cjs-dataset-border-color-${pos}-${idx}`;
                    const brdColorValue = updatedAttrs[brdColorAttr];
                    if (!brdColorValue || brdColorValue === '') break;
                    brdColors.push(brdColorValue);
                    forceAddColorTrait(chart, brdColorAttr, `Цвет границы ${pos + 1}`, idx, brdColorValue);
                    pos++;
                }

                const borderWidthAttr = `cjs-dataset-border-width-${idx}`;
                const borderWidthValue = updatedAttrs[borderWidthAttr];
                if (borderWidthValue && borderWidthValue !== '') {
                    chart.addAttributes({ [borderWidthAttr]: borderWidthValue });
                    forceAddColorTrait(chart, borderWidthAttr, `Толщина границы`, idx, borderWidthValue);
                }

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