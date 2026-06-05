// utils/colorsUtils.js
export const STORAGE_KEYS = {
    LEFT_BORDER_COLOR: 'scheduler_left_border_color',
    BOTTOM_BORDER_COLOR: 'scheduler_bottom_border_color',
    LEFT_BORDER_WIDTH: 'scheduler_left_border_width',
    BOTTOM_BORDER_WIDTH: 'scheduler_bottom_border_width'
}

export const DEFAULT_COLORS = {
    leftBorder: '#436fff',    // синий
    bottomBorder: '#c100cf'   // фиолетовый
}

export const DEFAULT_WIDTHS = {
    leftBorder: '3',    // пиксели
    bottomBorder: '2'   // пиксели
}

// Функция для получения цвета из localStorage
export const getStoredColor = (key, defaultColor) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored || defaultColor;
    }
    return defaultColor;
}

// Функция для получения толщины границы из localStorage
export const getStoredWidth = (key, defaultWidth) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored || defaultWidth;
    }
    return defaultWidth;
}