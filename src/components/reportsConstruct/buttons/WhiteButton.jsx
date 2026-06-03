import React from 'react';

export function WhiteButton({
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
            className={`px-3 h-[${heightPx}px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-700 ${className}`}
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