export const STORAGE_KEYS = {
    LEFT_BORDER_COLOR: 'scheduler_left_border_color',
    BOTTOM_BORDER_COLOR: 'scheduler_bottom_border_color'
}

export const DEFAULT_COLORS = {
    leftBorder: '#436fff',    // синий
    bottomBorder: '#c100cf'   // фиолетовый
}

// Функция для получения цвета из localStorage
export const getStoredColor = (key, defaultColor) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored || defaultColor;
    }
    return defaultColor;
}