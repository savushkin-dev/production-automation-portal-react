/**
 * Синхронизация выделения между канвасом и деревом слоев
 * При выборе элемента на канвасе - подсвечиваем его в дереве
 */

/**
 * Настройка синхронизации выделения с деревом слоев
 * @param {Object} editor - Экземпляр GrapesJS редактора
 * @param {string} highlightClass - CSS класс для подсветки (по умолчанию 'custom-layer-selected')
 */
export const syncSelectionWithLayerTree = (editor, highlightClass = 'custom-layer-selected') => {
    if (!editor) {
        console.warn('Editor instance is required for layer synchronization');
        return;
    }

    /**
     * Подсвечивает выбранный компонент в дереве слоев
     * @param {Object} component - Выбранный компонент GrapesJS
     */
    const highlightInTree = (component) => {
        if (!component) return;

        // Проверяем, что компонент не является бэндом (служебные элементы не подсвечиваем)
        const attrs = component.getAttributes ? component.getAttributes() : {};
        const isBand = attrs['band'] === 'true' ||
            attrs['data-band'] === 'true' ||
            attrs['band-parent'] === 'true' ||
            attrs['data-band-child'] === 'true';

        if (isBand) return;

        // Получаем все элементы дерева
        const layerItems = document.querySelectorAll('.gjs-layer');

        // Убираем подсветку со всех элементов
        layerItems.forEach(el => {
            el.classList.remove(highlightClass);
        });

        // Получаем информацию о компоненте для поиска
        const componentName = component.get('tagName') || component.get('type') || '';
        const componentId = component.getId();

        // Пробуем найти элемент в дереве
        layerItems.forEach(el => {
            // Проверяем через текст
            const textEl = el.querySelector('.gjs-layer-title-text');
            if (textEl) {
                const text = textEl.textContent || '';
                if (text.includes(componentName) || text.includes(componentId)) {
                    el.classList.add(highlightClass);
                }
            }

            // Проверяем через атрибуты
            if (el.getAttribute('data-component-id') === componentId) {
                el.classList.add(highlightClass);
            }
        });

        // Если не нашли, пробуем найти через встроенный класс .gjs-selected
        const selectedLayer = document.querySelector('.gjs-layer.gjs-selected');
        if (selectedLayer) {
            selectedLayer.classList.add(highlightClass);
        }
    };

    // Подписываемся на события редактора
    editor.on('component:selected', (component) => {
        setTimeout(() => {
            highlightInTree(component);
        }, 100);
    });

    editor.on('component:click', (component) => {
        setTimeout(() => {
            highlightInTree(component);
        }, 100);
    });
};

/**
 * Очищает подсветку во всех элементах дерева
 * @param {string} highlightClass - CSS класс для подсветки
 */
export const clearLayerHighlight = (highlightClass = 'custom-layer-selected') => {
    document.querySelectorAll(`.${highlightClass}`).forEach(el => {
        el.classList.remove(highlightClass);
    });
};

export default syncSelectionWithLayerTree;