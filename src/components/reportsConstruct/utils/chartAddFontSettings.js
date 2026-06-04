// chartAddFontSettings.js

/**
 * Категория для настроек шрифтов в панели свойств
 */
const fontCategory = { id: 'fontChart', label: 'Шрифты', open: true };

/**
 * Список доступных семейств шрифтов
 */
const fontFamilyOptions = [
    { id: 'Arial', label: 'Arial' },
    { id: 'Verdana', label: 'Verdana' },
    { id: 'Times New Roman', label: 'Times New Roman' },
    { id: 'Georgia', label: 'Georgia' },
    { id: 'Courier New', label: 'Courier New' },
    { id: 'Tahoma', label: 'Tahoma' },
    { id: 'Trebuchet MS', label: 'Trebuchet MS' },
    { id: 'Comic Sans MS', label: 'Comic Sans MS' },
    { id: 'Impact', label: 'Impact' },
    { id: 'Open Sans', label: 'Open Sans' },
    { id: 'Roboto', label: 'Roboto' },
    { id: 'Montserrat', label: 'Montserrat' }
];

/**
 * Список вариантов жирности шрифта
 */
const fontWeightOptions = [
    { id: 'normal', label: 'Обычный' },
    { id: 'bold', label: 'Жирный' },
    { id: 'lighter', label: 'Тонкий' }
];

/**
 * Список вариантов стиля шрифта
 */
const fontStyleOptions = [
    { id: 'normal', label: 'Обычный' },
    { id: 'italic', label: 'Курсив' }
];

/**
 * Добавляет настройки шрифтов к компоненту графика
 * @param {Object} component - компонент GrapesJS (chartjs)
 */
export const addFontSettings = (component) => {
    if (component.get('type') !== 'chartjs') return;

    addFamilyTrait(component);
    addColorTrait(component);
    addLegendSizeTrait(component);
    addXAxisSizeTrait(component);
    addYAxisSizeTrait(component);
    addWeightTrait(component);
    addStyleTrait(component);

    setupHandlers(component);
    restoreSavedSettings(component);
};

/**
 * Добавляет настройку семейства шрифта
 */
const addFamilyTrait = (component) => {
    component.addTrait({
        type: 'select',
        label: 'Семейство шрифта',
        name: 'fontFamily',
        changeProp: true,
        options: fontFamilyOptions,
        value: 'Arial',
        category: fontCategory
    });
};

/**
 * Добавляет настройку цвета шрифта
 */
const addColorTrait = (component) => {
    component.addTrait({
        type: 'color',
        label: 'Цвет шрифта',
        name: 'fontColor',
        changeProp: true,
        value: '#333333',
        category: fontCategory
    });
};

/**
 * Добавляет настройку размера шрифта легенды
 */
const addLegendSizeTrait = (component) => {
    component.addTrait({
        type: 'number',
        label: 'Размер шрифта легенды',
        name: 'legendFontSize',
        changeProp: true,
        value: 12,
        min: 8,
        max: 24,
        category: fontCategory
    });
};

/**
 * Добавляет настройку размера шрифта оси X
 */
const addXAxisSizeTrait = (component) => {
    component.addTrait({
        type: 'number',
        label: 'Размер шрифта оси X',
        name: 'xAxisFontSize',
        changeProp: true,
        value: 11,
        min: 8,
        max: 20,
        category: fontCategory
    });
};

/**
 * Добавляет настройку размера шрифта оси Y
 */
const addYAxisSizeTrait = (component) => {
    component.addTrait({
        type: 'number',
        label: 'Размер шрифта оси Y',
        name: 'yAxisFontSize',
        changeProp: true,
        value: 11,
        min: 8,
        max: 20,
        category: fontCategory
    });
};

/**
 * Добавляет настройку жирности шрифта
 */
const addWeightTrait = (component) => {
    component.addTrait({
        type: 'select',
        label: 'Жирность шрифта',
        name: 'fontWeight',
        changeProp: true,
        options: fontWeightOptions,
        value: 'normal',
        category: fontCategory
    });
};

/**
 * Добавляет настройку стиля шрифта
 */
const addStyleTrait = (component) => {
    component.addTrait({
        type: 'select',
        label: 'Стиль шрифта',
        name: 'fontStyle',
        changeProp: true,
        options: fontStyleOptions,
        value: 'normal',
        category: fontCategory
    });
};

/**
 * Применяет настройки шрифтов к chartjsOptions
 * @param {Object} component - компонент графика
 */
export const applyFontSettings = (component) => {
    let chartjsOptions = component.get('chartjsOptions');
    if (!chartjsOptions) {
        chartjsOptions = { data: { datasets: [] }, options: {} };
    }
    if (!chartjsOptions.options) chartjsOptions.options = {};

    const fontFamily = component.get('fontFamily');
    const fontColor = component.get('fontColor');
    const fontWeight = component.get('fontWeight');
    const fontStyle = component.get('fontStyle');
    const legendFontSize = component.get('legendFontSize');
    const xAxisFontSize = component.get('xAxisFontSize');
    const yAxisFontSize = component.get('yAxisFontSize');

    // Базовые настройки шрифта для всего графика
    chartjsOptions.options.font = {
        family: fontFamily || 'Arial',
        weight: fontWeight || 'normal',
        style: fontStyle || 'normal'
    };

    // Применяем к легенде
    if (!chartjsOptions.options.plugins) chartjsOptions.options.plugins = {};
    if (!chartjsOptions.options.plugins.legend) chartjsOptions.options.plugins.legend = {};
    if (!chartjsOptions.options.plugins.legend.labels) chartjsOptions.options.plugins.legend.labels = {};

    chartjsOptions.options.plugins.legend.labels.font = {
        size: legendFontSize || 12,
        family: fontFamily || 'Arial',
        weight: fontWeight || 'normal',
        style: fontStyle || 'normal'
    };
    chartjsOptions.options.plugins.legend.labels.color = fontColor || '#333333';

    // Применяем к оси X
    if (!chartjsOptions.options.scales) chartjsOptions.options.scales = {};
    if (!chartjsOptions.options.scales.x) chartjsOptions.options.scales.x = {};
    if (!chartjsOptions.options.scales.x.ticks) chartjsOptions.options.scales.x.ticks = {};

    chartjsOptions.options.scales.x.ticks.font = {
        size: xAxisFontSize || 11,
        family: fontFamily || 'Arial',
        weight: fontWeight || 'normal',
        style: fontStyle || 'normal'
    };
    chartjsOptions.options.scales.x.ticks.color = fontColor || '#333333';

    // Применяем к оси Y
    if (!chartjsOptions.options.scales.y) chartjsOptions.options.scales.y = {};
    if (!chartjsOptions.options.scales.y.ticks) chartjsOptions.options.scales.y.ticks = {};

    chartjsOptions.options.scales.y.ticks.font = {
        size: yAxisFontSize || 11,
        family: fontFamily || 'Arial',
        weight: fontWeight || 'normal',
        style: fontStyle || 'normal'
    };
    chartjsOptions.options.scales.y.ticks.color = fontColor || '#333333';

    component.set('chartjsOptions', chartjsOptions);
    console.log('✅ Font settings applied:', {
        family: fontFamily,
        weight: fontWeight,
        style: fontStyle,
        color: fontColor,
        legendSize: legendFontSize,
        xAxisSize: xAxisFontSize,
        yAxisSize: yAxisFontSize
    });
};

/**
 * Сохраняет настройки в атрибуты компонента
 * @param {Object} component - компонент графика
 */
const saveSettingsToAttributes = (component) => {
    component.addAttributes({
        'cjs-font-family': component.get('fontFamily'),
        'cjs-font-color': component.get('fontColor'),
        'cjs-font-weight': component.get('fontWeight'),
        'cjs-font-style': component.get('fontStyle'),
        'cjs-legend-font-size': component.get('legendFontSize'),
        'cjs-x-axis-font-size': component.get('xAxisFontSize'),
        'cjs-y-axis-font-size': component.get('yAxisFontSize')
    });
};

/**
 * Принудительно обновляет отображение графика
 * @param {Object} component - компонент графика
 */
const forceUpdate = (component) => {
    setTimeout(() => {
        const view = component.view;
        if (view && view.updateChart) {
            const canvas = view.el.querySelector('canvas');
            if (canvas && canvas.chart) {
                canvas.chart.destroy();
            }
            view.updateChart();
        }
        component.trigger('rerender');
    }, 50);
};

/**
 * Настраивает обработчики изменений для всех свойств шрифта
 * @param {Object} component - компонент графика
 */
const setupHandlers = (component) => {
    const handlers = ['fontFamily', 'fontColor', 'fontWeight', 'fontStyle', 'legendFontSize', 'xAxisFontSize', 'yAxisFontSize'];
    handlers.forEach(prop => {
        component.on(`change:${prop}`, () => {
            console.log(`🔵 Font property changed: ${prop} = ${component.get(prop)}`);
            applyFontSettings(component);
            saveSettingsToAttributes(component);
            forceUpdate(component);
        });
    });
};

/**
 * Восстанавливает сохраненные настройки из атрибутов
 * @param {Object} component - компонент графика
 */
const restoreSavedSettings = (component) => {
    const attrs = component.getAttributes();
    let needUpdate = false;

    if (attrs['cjs-font-family']) {
        component.set('fontFamily', attrs['cjs-font-family']);
        needUpdate = true;
    }
    if (attrs['cjs-font-color']) {
        component.set('fontColor', attrs['cjs-font-color']);
        needUpdate = true;
    }
    if (attrs['cjs-font-weight']) {
        component.set('fontWeight', attrs['cjs-font-weight']);
        needUpdate = true;
    }
    if (attrs['cjs-font-style']) {
        component.set('fontStyle', attrs['cjs-font-style']);
        needUpdate = true;
    }
    if (attrs['cjs-legend-font-size']) {
        component.set('legendFontSize', parseInt(attrs['cjs-legend-font-size']));
        needUpdate = true;
    }
    if (attrs['cjs-x-axis-font-size']) {
        component.set('xAxisFontSize', parseInt(attrs['cjs-x-axis-font-size']));
        needUpdate = true;
    }
    if (attrs['cjs-y-axis-font-size']) {
        component.set('yAxisFontSize', parseInt(attrs['cjs-y-axis-font-size']));
        needUpdate = true;
    }

    if (needUpdate) {
        setTimeout(() => {
            applyFontSettings(component);
            forceUpdate(component);
        }, 100);
    }
};

/**
 * Инициализирует настройки шрифтов для компонента (применяет после создания)
 * @param {Object} component - компонент графика
 */
export const initFontSettings = (component) => {
    setTimeout(() => {
        applyFontSettings(component);
        saveSettingsToAttributes(component);
        forceUpdate(component);
    }, 100);
};