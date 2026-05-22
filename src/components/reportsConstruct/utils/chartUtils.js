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

        const chartHtml = chartEl.outerHTML;
        const placeholders = new Map();
        let labelsPlaceholder = null;

        const dataAttrRegex = /cjs-dataset-data-(\d+)="({{[^}]+}})"/g;
        let match;
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

        chartsPlaceholders.set(chartId, { placeholders, labelsPlaceholder });
    });

    return chartsPlaceholders;
};

// Функция для обновления графика при изменении цвета
const setupColorTraitHandler = (component, traitName, datasetId) => {
    const trait = component.getTrait(traitName);
    if (!trait || trait.__handlerAttached) return;

    trait.on('change:value', () => {
        const value = trait.get('value');
        component.addAttributes({ [traitName]: value });

        const options = component.get('chartjsOptions');
        if (options && options.data && options.data.datasets) {
            const bgMatch = traitName.match(/cjs-dataset-background-color-(\d+)-(\d+)/);
            const borderMatch = traitName.match(/cjs-dataset-border-color-(\d+)-(\d+)/);

            if (bgMatch) {
                const pos = parseInt(bgMatch[1]);
                const dsId = parseInt(bgMatch[2]) - 1;
                if (options.data.datasets[dsId]) {
                    if (!options.data.datasets[dsId].backgroundColor) {
                        options.data.datasets[dsId].backgroundColor = [];
                    }
                    options.data.datasets[dsId].backgroundColor[pos] = value;
                }
            } else if (borderMatch) {
                const pos = parseInt(borderMatch[1]);
                const dsId = parseInt(borderMatch[2]) - 1;
                if (options.data.datasets[dsId]) {
                    if (!options.data.datasets[dsId].borderColor) {
                        options.data.datasets[dsId].borderColor = [];
                    }
                    options.data.datasets[dsId].borderColor[pos] = value;
                }
            }
        }

        setTimeout(() => {
            component.trigger('rerender');
        }, 50);
    });

    trait.__handlerAttached = true;
};

// Добавление трейта цвета
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

    // Добавляем обработчик изменения цвета
    setupColorTraitHandler(component, traitName, datasetId);

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

        const { placeholders: datasetPlaceholders, labelsPlaceholder } = chartData;

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

                // Цвета фона
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

                // Цвета границ
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
                    const borderWidthTrait = updatedTraits?.find(t => t.get('name') === borderWidthAttr);
                    if (borderWidthTrait) borderWidthTrait.set('value', borderWidthValue);
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

    const processedContent = cleanEmptyChartAttributes(content);
    const chartsPlaceholders = extractChartsPlaceholders(processedContent);

    editorView.setComponents(processedContent);

    if (chartsPlaceholders.size > 0) {
        setTimeout(() => {
            restoreChartsPlaceholders(editorView, chartsPlaceholders);
        }, 100);
    }

    return processedContent;
};