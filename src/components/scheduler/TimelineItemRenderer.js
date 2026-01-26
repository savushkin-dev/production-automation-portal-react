// components/scheduler/TimelineRenderers.js
import React from "react";
import moment from "moment/moment";

/**
 * Фабрика для создания рендерера элементов таймлайна планировщика
 */
export const createItemRendererScheduler = (selectedItems, selectedItem) => {
    return ({ item, itemContext, getItemProps }) => {
        const isSelected = selectedItems.some(sel => sel.id === item.id);
        const isSingleSelected = selectedItem?.id === item.id;
        const isFact = item.info?.startFact !== null && !item.id.includes('cleaning');
        const isLinesMatch = item.info?.lineIdFact === item.info?.lineInfo?.id;

        const itemProps = getItemProps({
            style: {
                background: isSelected
                    ? (isSingleSelected ? "#cbff93" : "#cbff93")
                    : (isFact ? "#c9ffd7" : item.itemProps?.style?.background || '#fff'),
                border: '1px solid #aeaeae',
                textAlign: 'start',
                color: item.itemProps?.style?.color || 'black',
                margin: 0,
                padding: '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
            },
            onMouseDown: getItemProps().onMouseDown,
            onTouchStart: getItemProps().onTouchStart,
        });

        const { key, ...safeItemProps } = itemProps;

        return (
            <div
                key={item.id}
                {...safeItemProps}
                className="rct-item"
            >
                <div className="flex px-1 justify-between font-medium text-sm text-black">
                    {item.info?.pinned ? (
                        <>
                            {isSelected && selectedItems.length > 1 && (
                                <div className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                    {selectedItems.findIndex(el => el.id === item.id) + 1}
                                </div>
                            )}
                            <div className="h-2 absolute p-0">
                                <i className="text-red-800 p-0 m-0 fa-solid fa-thumbtack"></i>
                            </div>
                            <span className="ml-4">{item.title}</span>
                        </>
                    ) : (
                        <>
                            {isSelected && selectedItems.length > 1 && (
                                <div className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                    {selectedItems.findIndex(el => el.id === item.id) + 1}
                                </div>
                            )}
                            <span className="">{item.title}</span>
                        </>
                    )}
                </div>

                <div className="flex flex-col justify-start text-xs">
                    {item.info?.name !== "Мойка" && !item.info?.maintenance && item.info?.np && (
                        <span className="px-1 rounded">
              <span className="text-blue-500">{item.info.np}</span>
              <span className="pl-1">№ партии</span>
            </span>
                    )}

                    {item.info?.duration && (
                        <span className="px-1 rounded">
              <span className="text-pink-500">{item.info.duration} мин.</span>
              <span className="text-gray-500 px-1">|</span>
              <span className="text-green-600">
                {moment(item.start_time).format('HH:mm')}
              </span>
                            {' - '}
                            <span className="text-red-500">
                {moment(item.end_time).format('HH:mm')}
              </span>
              <span className="pl-1">Время</span>
            </span>
                    )}

                    {item.info?.groupIndex && !isFact && (
                        <span className="px-1 rounded">
              <span className="text-violet-600">{item.info.groupIndex}</span>
              <span className="pl-1">Позиция на линии</span>
            </span>
                    )}

                    {isFact && (
                        <span className="px-1 rounded">
              {!isLinesMatch && (
                  <span className="text-red-600 pr-2 h-[20px] w-[20px]">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </span>
              )}
                            <span className="text-violet-600">
                {moment(item.info?.startFact).format('HH:mm')}
              </span>
              <span className="pl-1">Факт. время начала</span>

              <span className="pl-1 text-violet-600">| {item.info?.groupIndex}</span>
              <span className="pl-1">Позиция на линии</span>
            </span>
                    )}
                </div>
            </div>
        );
    };
};

/**
 * Фабрика для создания рендерера элементов таймлайна трэкинга
 */
export const createItemRendererTracktrace = () => {
    return ({ item, itemContext, getItemProps }) => {

        const isFact = item.info?.startFact !== null && !item.id.includes('cleaning');
        const isLinesMatch = item.info?.lineIdFact === item.info?.lineInfo?.id;

        const itemProps = getItemProps({
            style: {
                background: isFact ? "#c9ffd7" : item.itemProps?.style?.background || '#fff',
                border: '1px solid #aeaeae',
                textAlign: 'start',
                color: item.itemProps?.style?.color || 'black',
                margin: 0,
                padding: '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
            },
            onMouseDown: getItemProps().onMouseDown,
            onTouchStart: getItemProps().onTouchStart,
        });

        const { key, ...safeItemProps } = itemProps;

        return (
            <div
                key={item.id}
                {...safeItemProps}
                className="rct-item"
            >
                <div className="flex px-1 justify-between font-medium text-sm text-black">

                        <>
                            <span className="">{item.title}</span>
                        </>

                </div>

                <div className="flex flex-col justify-start text-xs">
                    {item.info?.name !== "Мойка" && !item.info?.maintenance && item.info?.np && (
                        <span className="px-1 rounded">
              <span className="text-blue-500">{item.info.np}</span>
              <span className="pl-1">№ партии</span>
            </span>
                    )}

                    {item.info?.duration && (
                        <span className="px-1 rounded">
              <span className="text-pink-500">{item.info.duration} мин.</span>
              <span className="text-gray-500 px-1">|</span>
              <span className="text-green-600">
                {moment(item.start_time).format('HH:mm')}
              </span>
                            {' - '}
                            <span className="text-red-500">
                {moment(item.end_time).format('HH:mm')}
              </span>
              <span className="pl-1">Время</span>
            </span>
                    )}

                    {item.info?.groupIndex && !isFact && (
                        <span className="px-1 rounded">
              <span className="text-violet-600">{item.info.groupIndex}</span>
              <span className="pl-1">Позиция на линии</span>
            </span>
                    )}

                    {isFact && (
                        <span className="px-1 rounded">
              {!isLinesMatch && (
                  <span className="text-red-600 pr-2 h-[20px] w-[20px]">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </span>
              )}
                            <span className="text-violet-600">
                {moment(item.info?.startFact).format('HH:mm')}
              </span>
              <span className="pl-1">Факт. время начала</span>

              <span className="pl-1 text-violet-600">| {item.info?.groupIndex}</span>
              <span className="pl-1">Позиция на линии</span>
            </span>
                    )}
                </div>
            </div>
        );
    };
};

/**
 * Фабрика для создания рендерера групп таймлайна
 */
export const createGroupRenderer = () => {
    return ({ group }) => (
        <div className="custom-group-renderer flex flex-col justify-center h-full px-2">
            <div className="group-title font-semibold text-sm mb-1">
                {group.title}
            </div>
            <div className="group-stats text-xs text-gray-500">
                Выработка: {group.totalMass || 0} кг.
            </div>
        </div>
    );
};

/**
 * Функция для создания всех рендереров планировщика
 */
export const createTimelineRenderersSheduler = (selectedItems, selectedItem) => {
    return {
        itemRenderer: createItemRendererScheduler(selectedItems, selectedItem),
        groupRenderer: createGroupRenderer(),
    };
};

/**
 * Функция для создания всех рендереров трэкинга
 */
export const createTimelineRenderersTracktrace = (selectedItems, selectedItem) => {
    return {
        itemRenderer: createItemRendererTracktrace(selectedItems, selectedItem),
        groupRenderer: createGroupRenderer(),
    };
};