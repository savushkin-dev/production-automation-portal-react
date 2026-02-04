import React, {useState} from 'react';
import './Dropdown.css';

const Dropdown = ({options, onSelect, label, onOpen, onClose}) => {
    const [isOpen, setIsOpen] = useState(false);


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option) => {
        onSelect(option); // Вызываем функцию при выборе опции
        setIsOpen(false); // Закрываем выпадающий список
    };

    return (
        <>
            {isOpen && <div
                className="fixed top-0 z-30 right-0 left-0 bottom-0"
                onClick={() => setIsOpen(false)}
            />}
            <div className="dropdown">
                <button onClick={toggleDropdown} className="text-xs font-medium w-24">
                    {label}
                </button>
                {isOpen && (
                    <div className="dropdown-menu text-xs font-medium">
                        {options.map((option, index) => (
                            <div key={index} className="dropdown-item" onClick={() => handleSelect(option)}>
                                {option === 'Дочерний-child' ? option.slice(0, -6) : option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>

    );
};

export default Dropdown;
