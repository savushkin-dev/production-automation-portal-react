import React, {useState, useEffect} from 'react'
import {styleInput, styleLabelInput} from "../../data/styles";
import {CustomStyle} from "../../data/styleForSelect";
import CreatableSelect from "react-select/creatable";
import ReportService from "../../services/ReportService";
import {WhiteButton} from "../reportsConstruct/buttons/WhiteButton";
import {BlueButton} from "../reportsConstruct/buttons/BlueButton";

export function ModalInput({title, message, onClose, onAgreement, name, onChangeName, category, onChangeCategory }) {

    const [optCategoryNames, setOptCategoryNames] = useState([]);
    const [selectCategory, setSelectCategory] = useState(null);

    useEffect(() => {
        fetchCategoryNames();
    }, []);

    // Устанавливаем выбранную категорию при изменении props
    useEffect(() => {
        if (category && optCategoryNames.length > 0) {
            setSelectCategory({
                value: category,
                label: category
            });
        }
    }, [category, optCategoryNames]);

    async function fetchCategoryNames() {
        try {
            const response = await ReportService.getCategories();
            const options = ReportService.convertCategoriesToOptions(response.data);
            setOptCategoryNames(options);
        } catch (error) {
            console.error("Ошибка загрузки категорий:", error);
        }
    }

    const handleCategoryChange = (newValue) => {
        setSelectCategory(newValue);
        onChangeCategory({
            target: {
                value: newValue ? newValue.value : ''
            }
        });
    };

    const handleCreateCategory = (inputValue) => {
        const newCategory = { value: inputValue, label: inputValue };
        setSelectCategory(newCategory);
        onChangeCategory({
            target: {
                value: inputValue
            }
        });
        setOptCategoryNames(prev => [...prev, newCategory]);
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30 rounded bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 animate-[scaleIn_0.3s_ease]"
            >
                <h1 className="text-2xl font-medium text-start mb-6">{title}</h1>
                <div className="flex flex-col">
                    <div className="flex flex-col mb-2">
                        <span className={styleLabelInput}>Уникальное имя отчета</span>
                        <input
                            className={styleInput}
                            value={name}
                            onChange={onChangeName}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className={styleLabelInput}>Категория отчета</span>
                        <CreatableSelect
                            placeholder="Введите или выберите категорию..."
                            value={selectCategory}
                            onChange={handleCategoryChange}
                            styles={CustomStyle}
                            options={optCategoryNames}
                            isSearchable={true}
                            noOptionsMessage={() => "Категории не найдены"}
                            formatCreateLabel={(inputValue) => `${inputValue}`}
                            onCreateOption={handleCreateCategory}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <div className="flex flex-row justify-end mt-4">
                        <div className="flex flex-row justify-end items-center bg-white my-2 gap-2">
                            <WhiteButton onClick={onClose} text={"Отмена"}/>
                            <BlueButton onClick={() => {
                                onAgreement(name, category)
                                fetchCategoryNames()
                            }} text={"Сохранить"} disabled={!name?.trim() || !category?.trim()}/>
                        </div>
                    </div>

                </div>

            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: translate(-50%, -50%) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    )
}