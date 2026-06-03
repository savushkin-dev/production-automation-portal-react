import React from 'react';

export function BlueButton({
                               onClick,
                               text = 'Кнопка',
                               className = '',
                               heightPx = '30',
                               icon = null,
                               iconPosition = 'right' // 'left' или 'right'
                           }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 h-[${heightPx}px] text-[0.900rem] font-medium rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] ${className}`}
        >
            {icon && iconPosition === 'left' && (
                <i className={`${icon} ${text ? 'pr-2' : ''}`}></i>
            )}
            {text}
            {icon && iconPosition === 'right' && (
                <i className={`${icon} ${text ? 'pl-2' : ''}`}></i>
            )}
        </button>
    );
}