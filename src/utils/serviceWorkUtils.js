
// Преобразование минут в часы и минуты
export const convertMinutesToHoursMinutes = (totalMinutes) => {
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60
    };
};

// Преобразование часов и минут в общие минуты
export const convertHoursMinutesToMinutes = (hours, minutes) => {
    return Number(hours) * 60 + Number(minutes);
};

// Валидация часов
export const validateHours = (value, maxHours = 99) => {
    const numValue = Number(value);

    if (isNaN(numValue) || numValue < 0) {
        return 0;
    }

    if (numValue > maxHours) {
        return maxHours;
    }

    return numValue;
};

// Валидация минут
export const validateMinutes = (value, maxMinutes = 59) => {
    const numValue = Number(value);

    if (isNaN(numValue) || numValue < 0) {
        return 0;
    }

    if (numValue > maxMinutes) {
        return maxMinutes;
    }

    return numValue;
};