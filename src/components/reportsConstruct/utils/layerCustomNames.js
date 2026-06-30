/**
 * ====================================================
 * НАСТРОЙКА КАСТОМНЫХ НАЗВАНИЙ ДЛЯ СЛОЕВ В ДЕРЕВЕ
 * ====================================================
 *
 * Этот модуль заменяет стандартные названия элементов в дереве слоев
 * на более понятные и информативные:
 *
 * - Бэнды данных → "Содержимое бэнда"
 * - Текстовые элементы → их содержимое
 * - Линии → "Горизонтальная линия" / "Вертикальная линия"
 * - Графики → тип графика (Столбчатый, Линейный и т.д.)
 *
 * @param {Object} editor - Экземпляр GrapesJS редактора
 * @param {Object} options - Опции настройки
 * @param {number} options.maxLength - Максимальная длина названия (по умолчанию 30)
 * @param {string} options.placeholder - Заглушка для пустых элементов
 * @returns {Object} Объект с методами для управления названиями слоев
 */
export const setupCustomLayerNames = (editor, options = {}) => {
    const {
        maxLength = 30,
        placeholder = 'Элемент'
    } = options;

    if (!editor) {
        console.warn('Editor instance is required for custom layer names');
        return;
    }

    /**
     * Активирует панель слоев в редакторе
     */
    const activateLayersPanel = () => {
        try {
            const layersPanel = editor.Panels.getPanel('layers');
            if (layersPanel) {
                layersPanel.set('active', true);
            }
        } catch (e) {
            console.warn('Could not activate layers panel:', e);
        }
    };

    /**
     * Находит все элементы слоев в DOM
     * @returns {NodeList} Список элементов слоев
     */
    const findLayerItems = () => {
        activateLayersPanel();

        const selectors = [
            '.gjs-layer',
            '.gjs-layers .gjs-layer',
            '.gjs-layer-item',
            '[class*="gjs-layer"]',
            '.gjs-layers-item',
            '.gjs-layer__t-wrapper'
        ];

        for (const selector of selectors) {
            const items = document.querySelectorAll(selector);
            if (items.length > 0) {
                return items;
            }
        }

        const layersPanel = document.querySelector('.gjs-layers');
        if (layersPanel) {
            const items = layersPanel.querySelectorAll('[class*="layer"]');
            if (items.length > 0) {
                return items;
            }
        }

        return [];
    };

    /**
     * Ожидает появления слоев в DOM
     * @param {Function} callback - Функция, вызываемая после появления слоев
     */
    const waitForLayers = (callback) => {
        let items = findLayerItems();
        if (items.length > 0) {
            callback();
            return;
        }

        const observer = new MutationObserver(() => {
            const items = findLayerItems();
            if (items.length > 0) {
                observer.disconnect();
                callback();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            const items = findLayerItems();
            if (items.length > 0) {
                callback();
            }
        }, 100);
    };

    /**
     * Генерирует кастомное название для компонента
     * @param {Object} component - Компонент GrapesJS
     * @returns {string|null} Кастомное название или null (пропустить элемент)
     */
    const getCustomName = (component) => {
        if (!component) return placeholder;

        const type = component.get('type') || '';
        const tagName = component.get('tagName') || '';
        const attributes = component.getAttributes() || {};
        const content = component.get('content') || '';
        const text = component.get('text') || '';
        const classes = component.get('classes') || [];
        const classNames = classes.map ? classes.map(c => c.getName ? c.getName() : c) : [];

        // ================================================================
        // 1. СЛУЖЕБНЫЕ ЭЛЕМЕНТЫ (НЕ МЕНЯЕМ)
        // ================================================================
        // description-band - описание бэнда, скрываем для чистоты дерева
        if (attributes['description-band'] === 'true') {
            return null;
        }

        // ================================================================
        // 2. БЭНДЫ
        // ================================================================
        // band-parent - родительский контейнер бэнда, используем название из description-band
        if (attributes['band-parent'] === 'true') {
            let bandTitle = null;

            if (component.components) {
                const children = component.components();
                children.each(child => {
                    const childAttrs = child.getAttributes() || {};
                    if (childAttrs['description-band'] === 'true') {
                        const childContent = child.get('content') || child.get('text') || '';
                        let descText = childContent;
                        if (!descText && child.components) {
                            const grandChildren = child.components();
                            grandChildren.each(gc => {
                                const gcContent = gc.get('content') || gc.get('text') || '';
                                if (gcContent) {
                                    descText = gcContent;
                                }
                            });
                        }
                        const cleanText = descText.replace(/<[^>]*>/g, '').trim();
                        if (cleanText) {
                            bandTitle = cleanText;
                        }
                    }
                });
            }

            if (bandTitle) {
                return `${bandTitle}`;
            }

            return 'Бэнд данных';
        }

        // data-band / data-band-child - содержимое бэнда
        if (attributes['data-band'] === 'true' ||
            attributes['data-band-child'] === 'true') {
            return 'Содержимое бэнда';
        }

        // band - старый формат бэндов
        if (attributes['band'] === 'true') {
            return 'Содержимое бэнда';
        }

        // ================================================================
        // 3. ЛИНИИ
        // ================================================================
        if (classNames.includes('line-block')) {
            return '━ Гориз. линия';
        }
        if (classNames.includes('vertical-line-block')) {
            return '┃ Верт. линия';
        }
        if (tagName === 'line') {
            return '┃ Линия';
        }
        if (attributes['data-line-type'] === 'horizontal') {
            return '━ Гориз. линия';
        }
        if (attributes['data-line-type'] === 'vertical') {
            return '┃ Верт. линия';
        }

        // ================================================================
        // 4. ТЕКСТОВЫЕ ЭЛЕМЕНТЫ (показываем содержимое)
        // ================================================================
        if (type === 'text' || type === 'textnode' ||
            tagName === 'span' || tagName === 'p' || tagName === 'b' ||
            tagName === 'h1' || tagName === 'h2' || tagName === 'h3' ||
            tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {

            let textContent = content || text || '';

            if (!textContent && component.components) {
                const children = component.components();
                if (children && children.length > 0) {
                    const childTexts = [];
                    children.each(child => {
                        const childContent = child.get('content') || child.get('text') || '';
                        if (childContent) {
                            childTexts.push(childContent);
                        }
                    });
                    textContent = childTexts.join(' ');
                }
            }

            const cleanText = textContent.replace(/<[^>]*>/g, '').trim();

            if (cleanText) {
                return cleanText.length > maxLength ?
                    cleanText.substring(0, maxLength) + '...' :
                    cleanText;
            }

            const typeLabels = {
                'text': 'Текст',
                'textnode': 'Текст',
                'span': 'Текст',
                'p': 'Абзац',
                'b': 'Жирный текст',
                'h1': 'Заголовок H1',
                'h2': 'Заголовок H2',
                'h3': 'Заголовок H3',
                'h4': 'Заголовок H4',
                'h5': 'Заголовок H5',
                'h6': 'Заголовок H6'
            };
            return typeLabels[tagName] || typeLabels[type] || 'Текст';
        }

        // ================================================================
        // 5. ИЗОБРАЖЕНИЯ
        // ================================================================
        if (type === 'image' || tagName === 'img') {
            return 'Изображение';
        }

        // ================================================================
        // 6. ГРАФИКИ
        // ================================================================
        if (type === 'chartjs') {
            const chartType = attributes['cjs-chart-type'] || '';
            const chartTitle = attributes['cjs-chart-title'] || '';
            const typeMap = {
                'bar': 'Столбчатый',
                'line': 'Линейный',
                'pie': 'Круговой',
                'doughnut': 'Кольцевой',
                'radar': 'Радар',
                'polarArea': 'Полярный',
                'bubble': 'Пузырьковый',
                'scatter': 'Точечный'
            };
            const typeLabel = typeMap[chartType] || chartType || 'График';
            if (chartTitle) {
                return `${typeLabel}: ${chartTitle.length > maxLength ? chartTitle.substring(0, maxLength) + '...' : chartTitle}`;
            }
            return typeLabel;
        }

        // ================================================================
        // 7. КОНТЕЙНЕРЫ / БЛОКИ
        // ================================================================
        if (type === 'default' || tagName === 'div') {
            const id = attributes.id || '';
            let innerText = '';
            if (component.components) {
                const children = component.components();
                children.each(child => {
                    const childContent = child.get('content') || child.get('text') || '';
                    if (childContent) {
                        innerText += childContent.replace(/<[^>]*>/g, '').trim() + ' ';
                    }
                });
                innerText = innerText.trim();
            }

            if (id) {
                return `${id}${innerText ? `: ${innerText.length > 15 ? innerText.substring(0, 15) + '...' : innerText}` : ''}`;
            }
            if (innerText) {
                return `${innerText.length > maxLength ? innerText.substring(0, maxLength) + '...' : innerText}`;
            }
            return 'Контейнер';
        }

        // ================================================================
        // 8. ОСТАЛЬНЫЕ ЭЛЕМЕНТЫ
        // ================================================================
        let anyText = content || text || '';
        if (!anyText && component.components) {
            const children = component.components();
            children.each(child => {
                const childContent = child.get('content') || child.get('text') || '';
                if (childContent && !anyText) {
                    anyText = childContent.replace(/<[^>]*>/g, '').trim();
                }
            });
        }

        if (anyText) {
            return `${tagName || type}: ${anyText.length > maxLength ? anyText.substring(0, maxLength) + '...' : anyText}`;
        }

        const tagDisplay = tagName || type || placeholder;
        return tagDisplay.charAt(0).toUpperCase() + tagDisplay.slice(1);
    };

    /**
     * Обновляет названия всех слоев в дереве
     * Основная функция, которая проходится по всем элементам
     * и заменяет их названия на кастомные
     */
    const updateAllLayerNames = () => {
        const layerItems = findLayerItems();

        if (layerItems.length === 0) {
            return;
        }

        layerItems.forEach(el => {
            // Ищем элемент с названием слоя
            const titleText = el.querySelector('.gjs-layer-name');
            if (!titleText) return;

            // Пытаемся получить компонент, связанный со слоем
            let component = null;

            if (el.__cashData && el.__cashData.model) {
                component = el.__cashData.model;
            }

            if (!component && el.__cashData && el.__cashData.collection && el.__cashData.collection.length > 0) {
                component = el.__cashData.collection[0];
            }

            if (!component) {
                component = el.__model || el._model || el.__component || el._component;
            }

            if (!component) {
                return;
            }

            const customName = getCustomName(component);

            // Если вернули null - скрываем элемент
            if (customName === null) {
                el.style.display = 'none';
                return;
            }

            const currentName = titleText.textContent;

            // Обновляем название, если оно изменилось
            if (customName && currentName !== customName) {
                titleText.textContent = customName;
            }
        });
    };

    // ================================================================
    // ПОДПИСКА НА СОБЫТИЯ РЕДАКТОРА
    // ================================================================
    // Обновляем названия при изменении компонентов
    editor.on('component:update', () => {
        setTimeout(updateAllLayerNames, 10);
    });

    editor.on('component:add', () => {
        setTimeout(updateAllLayerNames, 10);
    });

    editor.on('component:remove', () => {
        setTimeout(updateAllLayerNames, 10);
    });

    editor.on('component:selected', () => {
        setTimeout(updateAllLayerNames, 10);
    });

    // ================================================================
    // ПЕРВОНАЧАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
    // ================================================================
    waitForLayers(() => {
        updateAllLayerNames();
    });

    // ================================================================
    // ЭКСПОРТ МЕТОДОВ ДЛЯ ВНЕШНЕГО ИСПОЛЬЗОВАНИЯ
    // ================================================================
    return {
        /** Принудительно обновить названия всех слоев */
        updateAllLayerNames,
        /** Получить кастомное название для компонента */
        getCustomName,
        /** Найти все элементы слоев в DOM */
        findLayerItems
    };
};

export default setupCustomLayerNames;