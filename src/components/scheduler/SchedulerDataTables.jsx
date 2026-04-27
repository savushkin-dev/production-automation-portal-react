import React, { memo, useCallback } from 'react';
import { DataTable } from './DataTable';
import { DAYS_CONFIG, updateDayData } from '../../utils/scheduler/dayConfig';

export const SchedulerDataTables = memo(({
                                             pdayData,
                                             setPdayData,
                                             selectDate,
                                             selectJobs,
                                             setSelectJobs,
                                             lines,
                                             isReadOnly = false
                                         }) => {

    const handleDataChange = useCallback((dayKey, newData) => {
        setPdayData(prev => updateDayData(prev, dayKey, newData));
    }, [setPdayData]);

    return (
        <>
            {isReadOnly &&
                <p className="text-sm text-amber-500 flex items-center mx-8">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                    Для управления заданиями необходимо переключиться на основной план
                </p>
            }

            <div className={`${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>

                {DAYS_CONFIG.map(({key, getDate}) => (
                    <DataTable
                        key={key}
                        data={pdayData[key]}
                        setData={(newData) => handleDataChange(key, newData)}
                        dateData={getDate(selectDate)}
                        selectJobs={selectJobs}
                        setSelectJobs={setSelectJobs}
                        lines={lines}
                        disabled={isReadOnly}
                    />
                ))}
            </div>

        </>

    );
});

SchedulerDataTables.displayName = 'SchedulerDataTables';