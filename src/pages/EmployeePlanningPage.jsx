import { Navigation } from "../components/Navigation";
import { LeftNavigation } from "../components/leftNavigation/LeftNavigation";
import React, {useContext, useState, useRef, useCallback, useEffect} from "react";
import { ModalNotifyError } from "../components/modal/ModalNotifyError";
import { observer } from 'mobx-react-lite';
import { ModalNotify } from "../components/modal/ModalNotify";
import { useNavigate } from "react-router-dom";
import { Context } from "../index";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ─────────────────────────────────────────────
// Хук drag-to-scroll
// ─────────────────────────────────────────────
function useDragScroll() {
    const ref = useRef(null);
    const drag = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0, moved: false });

    const onMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        const el = ref.current;
        if (!el) return;
        if (e.target.closest('[data-no-drag-scroll]')) return;

        drag.current = {
            isDown: true,
            startX: e.pageX,
            startY: e.pageY,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
            moved: false,
        };
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';

        const onMove = (ev) => {
            if (!drag.current.isDown) return;
            const dx = ev.pageX - drag.current.startX;
            const dy = ev.pageY - drag.current.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true;
            el.scrollLeft = drag.current.scrollLeft - dx;
            el.scrollTop = drag.current.scrollTop - dy;
        };

        const onUp = () => {
            drag.current.isDown = false;
            el.style.cursor = '';
            el.style.userSelect = '';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    const onClickCapture = useCallback((e) => {
        if (drag.current.moved) {
            e.stopPropagation();
            e.preventDefault();
            drag.current.moved = false;
        }
    }, []);

    return { ref, onMouseDown, onClickCapture };
}

// ─────────────────────────────────────────────
// Справочники и данные
// ─────────────────────────────────────────────
const DAYS_IN_MONTH = 31;
const MONTH_NAME = "Октябрь 2026";

const SHIFT_TYPES = {
    D: { code: 'Д', label: 'Дневная', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    N: { code: 'Н', label: 'Ночная', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    O: { code: 'О', label: 'Отдых', color: 'bg-gray-100 text-gray-500 border-gray-200' },
    V: { code: 'В', label: 'Выходной', color: 'bg-red-50 text-red-600 border-red-100' },
    B: { code: 'Б', label: 'Больничный', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const BRIGADES = [
    {
        id: 'b1',
        name: 'Бригада 1',
        employees: [
            { id: 'e1-1', name: 'Иванов И.И.', brigadeId: 'b1' },
            { id: 'e1-2', name: 'Петров П.П.', brigadeId: 'b1' },
            { id: 'e1-3', name: 'Сидоров С.С.', brigadeId: 'b1' },
            { id: 'e1-4', name: 'Кузнецов К.К.', brigadeId: 'b1' },
            { id: 'e1-5', name: 'Смирнов С.С.', brigadeId: 'b1' },
        ]
    },
    {
        id: 'b2',
        name: 'Бригада 2',
        employees: [
            { id: 'e2-1', name: 'Попов П.П.', brigadeId: 'b2' },
            { id: 'e2-2', name: 'Васильев В.В.', brigadeId: 'b2' },
            { id: 'e2-3', name: 'Соколов С.С.', brigadeId: 'b2' },
            { id: 'e2-4', name: 'Михайлов М.М.', brigadeId: 'b2' },
            { id: 'e2-5', name: 'Новиков Н.Н.', brigadeId: 'b2' },
        ]
    },
    {
        id: 'b3',
        name: 'Бригада 3',
        employees: [
            { id: 'e3-1', name: 'Фёдоров Ф.Ф.', brigadeId: 'b3' },
            { id: 'e3-2', name: 'Морозов М.М.', brigadeId: 'b3' },
            { id: 'e3-3', name: 'Волков В.В.', brigadeId: 'b3' },
            { id: 'e3-4', name: 'Алексеев А.А.', brigadeId: 'b3' },
            { id: 'e3-5', name: 'Лебедев Л.Л.', brigadeId: 'b3' },
        ]
    },
    {
        id: 'b4',
        name: 'Бригада 4',
        employees: [
            { id: 'e4-1', name: 'Семёнов С.С.', brigadeId: 'b4' },
            { id: 'e4-2', name: 'Егоров Е.Е.', brigadeId: 'b4' },
            { id: 'e4-3', name: 'Павлов П.П.', brigadeId: 'b4' },
            { id: 'e4-4', name: 'Козлов К.К.', brigadeId: 'b4' },
            { id: 'e4-5', name: 'Степанов С.С.', brigadeId: 'b4' },
        ]
    },
    {
        id: 'b5',
        name: 'Бригада 5',
        employees: [
            { id: 'e5-1', name: 'Николаев Н.Н.', brigadeId: 'b5' },
            { id: 'e5-2', name: 'Орлов О.О.', brigadeId: 'b5' },
            { id: 'e5-3', name: 'Андреев А.А.', brigadeId: 'b5' },
            { id: 'e5-4', name: 'Макаров М.М.', brigadeId: 'b5' },
            { id: 'e5-5', name: 'Никитин Н.Н.', brigadeId: 'b5' },
        ]
    },
    {
        id: 'b6',
        name: 'Бригада 6',
        employees: [
            { id: 'e6-1', name: 'Захаров З.З.', brigadeId: 'b6' },
            { id: 'e6-2', name: 'Зайцев З.З.', brigadeId: 'b6' },
            { id: 'e6-3', name: 'Соловьёв С.С.', brigadeId: 'b6' },
            { id: 'e6-4', name: 'Борисов Б.Б.', brigadeId: 'b6' },
            { id: 'e6-5', name: 'Яковлев Я.Я.', brigadeId: 'b6' },
        ]
    },
    {
        id: 'b7',
        name: 'Бригада 7',
        employees: [
            { id: 'e7-1', name: 'Григорьев Г.Г.', brigadeId: 'b7' },
            { id: 'e7-2', name: 'Романов Р.Р.', brigadeId: 'b7' },
            { id: 'e7-3', name: 'Воробьёв В.В.', brigadeId: 'b7' },
            { id: 'e7-4', name: 'Сергеев С.С.', brigadeId: 'b7' },
            { id: 'e7-5', name: 'Кузьмин К.К.', brigadeId: 'b7' },
        ]
    },
    {
        id: 'b8',
        name: 'Бригада 8',
        employees: [
            { id: 'e8-1', name: 'Фролов Ф.Ф.', brigadeId: 'b8' },
            { id: 'e8-2', name: 'Александров А.А.', brigadeId: 'b8' },
            { id: 'e8-3', name: 'Дмитриев Д.Д.', brigadeId: 'b8' },
            { id: 'e8-4', name: 'Королёв К.К.', brigadeId: 'b8' },
            { id: 'e8-5', name: 'Гусев Г.Г.', brigadeId: 'b8' },
        ]
    },
    {
        id: 'b9',
        name: 'Бригада 9',
        employees: [
            { id: 'e9-1', name: 'Киселёв К.К.', brigadeId: 'b9' },
            { id: 'e9-2', name: 'Ильин И.И.', brigadeId: 'b9' },
            { id: 'e9-3', name: 'Максимов М.М.', brigadeId: 'b9' },
            { id: 'e9-4', name: 'Поляков П.П.', brigadeId: 'b9' },
            { id: 'e9-5', name: 'Сорокин С.С.', brigadeId: 'b9' },
        ]
    },
    {
        id: 'b10',
        name: 'Бригада 10',
        employees: [
            { id: 'e10-1', name: 'Виноградов В.В.', brigadeId: 'b10' },
            { id: 'e10-2', name: 'Ковалёв К.К.', brigadeId: 'b10' },
            { id: 'e10-3', name: 'Белов Б.Б.', brigadeId: 'b10' },
            { id: 'e10-4', name: 'Медведев М.М.', brigadeId: 'b10' },
            { id: 'e10-5', name: 'Антонов А.А.', brigadeId: 'b10' },
        ]
    },
];

const ALL_EMPLOYEES = BRIGADES.flatMap(b => b.employees);
const getEmpById = (id) => ALL_EMPLOYEES.find(e => e.id === id);

const LINES = [
    { id: 'l1', name: 'Линия 1' },
    { id: 'l2', name: 'Линия 2' },
    { id: 'l3', name: 'Линия 3' },
    { id: 'l4', name: 'Линия 4' },
    { id: 'l5', name: 'Линия 5' },
    { id: 'l6', name: 'Линия 6' },
    { id: 'l7', name: 'Линия 7' },
    { id: 'l8', name: 'Линия 8' },
];

const generateLinePlan = () => {
    const plan = {};
    LINES.forEach((line, lineIdx) => {
        plan[line.id] = [];
        for (let i = 0; i < DAYS_IN_MONTH; i++) {
            const dayBrigade = BRIGADES[(i + lineIdx) % 10];
            const nightBrigade = BRIGADES[(i + lineIdx + 5) % 10];
            plan[line.id].push({
                D: { brigadeId: dayBrigade.id, employees: dayBrigade.employees.map(e => e.id) },
                N: { brigadeId: nightBrigade.id, employees: nightBrigade.employees.map(e => e.id) }
            });
        }
    });
    return plan;
};

const generateEmployeePlan = () => {
    const empPlan = {};

    ALL_EMPLOYEES.forEach((emp, index) => {
        empPlan[emp.id] = [];
        for (let day = 0; day < DAYS_IN_MONTH; day++) {
            const seed = (day + index * 3) % 10;

            if (seed === 0 || seed === 1) empPlan[emp.id].push('D');
            else if (seed === 2 || seed === 3) empPlan[emp.id].push('N');
            else if (seed === 4 || seed === 5) empPlan[emp.id].push('O');
            else if (seed === 6) empPlan[emp.id].push('V');
            else if (seed === 7 && index % 7 === 0) empPlan[emp.id].push('B');
            else empPlan[emp.id].push('O');
        }
    });

    return empPlan;
};

// ─────────────────────────────────────────────
// Компоненты Drag-and-Drop
// ─────────────────────────────────────────────

function DraggableEmployee({ employee, sourceInfo, isOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `drag-${employee.id}-${sourceInfo?.lineId || ''}-${sourceInfo?.dayIdx || ''}-${sourceInfo?.shift || ''}`,
        data: { employee, sourceInfo, type: 'employee-card' },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            data-no-drag-scroll
            className={`w-full px-1 py-[2px] mb-[2px] text-[10px] font-medium leading-tight rounded bg-white border border-gray-300 shadow-sm cursor-grab active:cursor-grabbing truncate
                ${isOverlay ? 'ring-2 ring-blue-400 shadow-lg scale-105 z-50' : ''}`}
            title={employee.name}
        >
            {employee.name}
        </div>
    );
}

function EmptySlot({ lineId, dayIdx, shiftType, slotIdx, brigadeId }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${lineId}-${dayIdx}-${shiftType}-${slotIdx}`,
        data: { lineId, dayIdx, shiftType, slotIdx, brigadeId, type: 'slot' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`w-full h-[18px] mb-[2px] rounded border border-dashed transition-colors
                ${isOver ? 'border-blue-400 bg-blue-100' : 'border-gray-200 bg-gray-50/50'}`}
        />
    );
}

function BrigadeCell({ lineId, dayIdx, shiftType, brigadeData }) {
    const brigade = BRIGADES.find(b => b.id === brigadeData.brigadeId);
    const { isOver, setNodeRef } = useDroppable({
        id: `brigade-${lineId}-${dayIdx}-${shiftType}`,
        data: { lineId, dayIdx, shiftType, isBrigadeContainer: true, type: 'brigade' },
    });

    const isDay = shiftType === 'D';

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col p-[2px] rounded-md border min-h-[120px] transition-colors
                ${isDay ? 'bg-gray-50' : 'bg-gray-200'}
                ${isOver ? 'ring-2 ring-blue-400 ring-inset' : 'border-gray-200'}
            `}
        >
            <div className={`text-[9px] font-bold text-center mb-1 uppercase tracking-wider ${isDay ? 'text-blue-600' : 'text-indigo-600'}`}>
                {brigade?.name || '—'}
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
                {brigadeData.employees.map((empId, idx) => {
                    const emp = empId ? getEmpById(empId) : null;
                    return emp ? (
                        <DraggableEmployee
                            key={empId}
                            employee={emp}
                            sourceInfo={{ lineId, dayIdx, shiftType, slotIdx: idx }}
                        />
                    ) : (
                        <EmptySlot
                            key={`empty-${idx}`}
                            lineId={lineId}
                            dayIdx={dayIdx}
                            shiftType={shiftType}
                            slotIdx={idx}
                            brigadeId={brigadeData.brigadeId}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function DraggableShift({ shiftCode, empId, dayIdx, isOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `drag-shift-${empId}-${dayIdx}`,
        data: { empId, dayIdx, shiftCode, type: 'shift-cell' },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    const shift = SHIFT_TYPES[shiftCode] || { code: '', color: 'bg-gray-50 border-gray-100' };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            data-no-drag-scroll
            className={`w-full h-full min-h-[24px] flex items-center justify-center font-semibold text-[11px] border rounded cursor-grab active:cursor-grabbing select-none ${shift.color}`}
        >
            {shift.code}
        </div>
    );
}

function EmployeeShiftCell({ empId, dayIdx, shiftCode, onContextMenu }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${empId}-${dayIdx}`,
        data: { empId, dayIdx, type: 'shift-cell-target' },
    });

    return (
        <div
            ref={setNodeRef}
            onContextMenu={(e) => onContextMenu(e, empId, dayIdx)}
            className={`w-full h-full p-0.5 border-r border-b border-gray-200 transition-colors
                ${isOver ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : ''}`}
        >
            {shiftCode ? (
                <DraggableShift shiftCode={shiftCode} empId={empId} dayIdx={dayIdx} />
            ) : (
                <div className="w-full h-full min-h-[24px] flex items-center justify-center text-gray-300">—</div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Основная страница
// ─────────────────────────────────────────────

function EmployeePlanningPage() {
    const { store } = useContext(Context);
    const navigate = useNavigate();

    const [isModalError, setIsModalError] = useState(false);
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [viewMode, setViewMode] = useState('lines');

    const [planByLine, setPlanByLine] = useState(() => generateLinePlan());
    const [planByEmp, setPlanByEmp] = useState(() => generateEmployeePlan());

    const [activeDragData, setActiveDragData] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, empId: null, dayIdx: null });

    const { ref: scrollRef, onMouseDown: onScrollMouseDown, onClickCapture: onScrollClickCapture } = useDragScroll();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragStart = (event) => setActiveDragData(event.active.data.current);

    useEffect(() => {
        console.log("======================")
        console.log(planByLine)
        console.log(planByEmp)
    }, [planByLine, planByEmp]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragData(null);
        if (!over) return;

        const source = active.data.current;
        const target = over.data.current;
        if (!source || !target) return;

        if (source.type === 'shift-cell' && target.type === 'shift-cell-target') {
            if (source.empId === target.empId && source.dayIdx === target.dayIdx) return;
            setPlanByEmp(prev => {
                const newPlan = { ...prev };
                newPlan[source.empId] = [...newPlan[source.empId]];
                if (source.empId !== target.empId) newPlan[target.empId] = [...newPlan[target.empId]];
                const sourceShift = newPlan[source.empId][source.dayIdx];
                const targetShift = newPlan[target.empId][target.dayIdx];
                newPlan[source.empId][source.dayIdx] = targetShift;
                newPlan[target.empId][target.dayIdx] = sourceShift;
                return newPlan;
            });
        }

        if (source.type === 'employee-card' && (target.type === 'slot' || target.type === 'brigade')) {
            const sInfo = source.sourceInfo;
            const tInfo = target;
            if (sInfo.lineId === tInfo.lineId && sInfo.dayIdx === tInfo.dayIdx && sInfo.shiftType === tInfo.shiftType && sInfo.slotIdx === tInfo.slotIdx) return;

            setPlanByLine(prev => {
                const newPlan = { ...prev };
                const ensurePath = (lineId, dayIdx, shiftType) => {
                    if (!newPlan[lineId]) newPlan[lineId] = [...prev[lineId]];
                    if (!newPlan[lineId][dayIdx]) newPlan[lineId][dayIdx] = { ...prev[lineId][dayIdx] };
                    if (!newPlan[lineId][dayIdx][shiftType]) newPlan[lineId][dayIdx][shiftType] = { ...prev[lineId][dayIdx][shiftType] };
                    newPlan[lineId][dayIdx][shiftType].employees = [...prev[lineId][dayIdx][shiftType].employees];
                };

                const sourceShiftData = prev[sInfo.lineId][sInfo.dayIdx][sInfo.shiftType];
                const targetShiftData = prev[tInfo.lineId][tInfo.dayIdx][tInfo.shiftType];
                const sourceEmpId = sourceShiftData.employees[sInfo.slotIdx];

                let targetSlotIdx = tInfo.slotIdx;
                if (tInfo.isBrigadeContainer) {
                    targetSlotIdx = targetShiftData.employees.findIndex(id => id === null);
                    if (targetSlotIdx === -1) targetSlotIdx = 0;
                }
                const targetEmpId = targetShiftData.employees[targetSlotIdx];

                ensurePath(sInfo.lineId, sInfo.dayIdx, sInfo.shiftType);
                if (sInfo.lineId !== tInfo.lineId || sInfo.dayIdx !== tInfo.dayIdx || sInfo.shiftType !== tInfo.shiftType) {
                    ensurePath(tInfo.lineId, tInfo.dayIdx, tInfo.shiftType);
                }

                newPlan[sInfo.lineId][sInfo.dayIdx][sInfo.shiftType].employees[sInfo.slotIdx] = targetEmpId;
                if (tInfo.isBrigadeContainer && targetSlotIdx !== -1) {
                    newPlan[tInfo.lineId][tInfo.dayIdx][tInfo.shiftType].employees[targetSlotIdx] = sourceEmpId;
                } else if (tInfo.slotIdx !== undefined) {
                    newPlan[tInfo.lineId][tInfo.dayIdx][tInfo.shiftType].employees[tInfo.slotIdx] = sourceEmpId;
                }
                return newPlan;
            });
        }
    };

    const handleContextMenu = (e, empId, dayIdx) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, empId, dayIdx });
    };

    const setShiftManually = (shiftCode) => {
        if (!contextMenu.empId) return;
        setPlanByEmp(prev => {
            const newPlan = { ...prev };
            newPlan[contextMenu.empId] = [...newPlan[contextMenu.empId]];
            newPlan[contextMenu.empId][contextMenu.dayIdx] = shiftCode;
            return newPlan;
        });
        setContextMenu({ ...contextMenu, visible: false });
    };

    React.useEffect(() => {
        const close = () => setContextMenu(prev => ({ ...prev, visible: false }));
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    // ── Рендер: По линиям ──
    const renderLinesView = () => (
        <table className="border-collapse text-center w-full min-w-max">
            <thead className="sticky top-0 z-20 bg-white">
            <tr>
                <th rowSpan={2} className="sticky left-0 z-40 bg-white p-2 text-center border-r border-b border-gray-300 font-semibold text-sm text-gray-600 w-[120px] min-w-[120px]">
                    Линия
                </th>
                {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                    const date = new Date(2026, 9, i + 1);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                        <th key={i} colSpan={2} className={`p-1 border-r border-b border-gray-300 text-xs font-medium ${isWeekend ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500'}`}>
                            {i + 1}
                            <div className="text-[9px] font-normal opacity-60">
                                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]}
                            </div>
                        </th>
                    );
                })}
            </tr>
            <tr className="border">
                {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => (
                    <React.Fragment key={i}>
                        <th className="p-1 border-r border-b border-gray-300 text-[10px] font-medium bg-amber-50 text-blue-800 min-w-[100px] w-[100px]">Д</th>
                        <th className="p-1 border-r border-b border-gray-300 text-[10px] font-medium bg-slate-100 text-indigo-800 min-w-[100px] w-[100px]">Н</th>
                    </React.Fragment>
                ))}
            </tr>
            </thead>
            <tbody>
            {LINES.map(line => (
                <tr key={line.id} className="virtual-row">
                    <td className="sticky left-0 z-30 bg-white p-2 border-r border-b border-gray-200 font-medium text-sm whitespace-nowrap">
                        {line.name}
                    </td>
                    {Array.from({ length: DAYS_IN_MONTH }).map((_, dayIdx) => {
                        const dayData = planByLine[line.id][dayIdx];
                        return (
                            <React.Fragment key={dayIdx}>
                                <td className="p-1  border-b border-gray-400 align-top min-w-[100px] w-[100px]">
                                    <BrigadeCell lineId={line.id} dayIdx={dayIdx} shiftType="D" brigadeData={dayData.D} />
                                </td>
                                <td className="p-1 border-r border-b border-gray-400 align-top bg-gray-50/20 min-w-[100px] w-[100px]">
                                    <BrigadeCell lineId={line.id} dayIdx={dayIdx} shiftType="N" brigadeData={dayData.N} />
                                </td>
                            </React.Fragment>
                        );
                    })}
                </tr>
            ))}
            </tbody>
        </table>
    );

    // ── Рендер: По сотрудникам ──
    const renderEmployeesView = () => (
        <table className="border-collapse text-center w-full min-w-max">
            <thead className="sticky top-0 z-20 bg-white">
            <tr>
                <th className="sticky left-0 z-40 bg-white p-2 border-r border-b border-gray-300 font-semibold text-left text-sm text-gray-600 w-[150px] min-w-[150px]">
                    Сотрудник
                </th>
                {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                    const date = new Date(2026, 9, i + 1);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                        <th key={i} className={`p-1 border-r border-b border-gray-300 text-xs font-medium min-w-[40px] w-[40px] ${isWeekend ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500'}`}>
                            {i + 1}
                            <div className="text-[9px] font-normal opacity-60 mt-0.5">
                                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]}
                            </div>
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody>
            {ALL_EMPLOYEES.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 z-30 bg-white p-1.5 border-r border-b border-gray-200 font-medium text-xs whitespace-nowrap">
                        {emp.name}
                    </td>
                    {Array.from({ length: DAYS_IN_MONTH }).map((_, dayIdx) => (
                        <td key={dayIdx} className="p-0 border-b border-gray-200 min-w-[40px] w-[40px] h-8">
                            <EmployeeShiftCell
                                empId={emp.id}
                                dayIdx={dayIdx}
                                shiftCode={planByEmp[emp.id]?.[dayIdx] || ''}
                                onContextMenu={handleContextMenu}
                            />
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );

    return (
        <>
            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {}} />
            <div className="flex flex-row w-screen overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 50px)' }}>
                <div className="hidden lg:block w-[200px] py-2 border-r-2 bg-gray-50 shrink-0">
                    <LeftNavigation />
                </div>

                <div className="flex flex-col flex-1 h-full min-w-0">
                    <div className="px-4 lg:px-8 pt-6 pb-4 flex flex-row gap-2 items-center justify-between bg-white border-b border-gray-100 shrink-0 z-30">
                        <div>
                            <span className="text-2xl font-bold block">Планирование персонала</span>
                            <span className="text-sm text-gray-500">{MONTH_NAME}</span>
                        </div>

                        <div className="flex flex-row gap-3 items-center">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('lines')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'lines' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    По линиям
                                </button>
                                <button
                                    onClick={() => setViewMode('employees')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'employees' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    По сотрудникам
                                </button>
                            </div>

                            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                                Сохранить план
                            </button>
                        </div>
                    </div>

                    {/* Внешний контейнер — только layout, без скролла */}
                    <div className="flex-1 p-4 bg-white relative min-h-0">
                        {/* Скроллящийся контейнер с drag-to-scroll */}
                        <div
                            ref={scrollRef}
                            onMouseDown={onScrollMouseDown}
                            onClickCapture={onScrollClickCapture}
                            className="h-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm cursor-grab"
                        >
                            {/* Внутренний padding через отдельный div, чтобы отступ справа не съедался */}
                            <div className=" min-w-max">
                                <DndContext
                                    sensors={sensors}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    {viewMode === 'lines' ? renderLinesView() : renderEmployeesView()}

                                    {/* ... DragOverlay ... */}
                                </DndContext>

                                {/* Легенда */}
                                {viewMode === 'employees' && (
                                    <div className="mt-4 flex flex-wrap gap-4 items-center text-sm bg-white p-3 rounded-lg border border-gray-200 inline-flex shadow-sm">
                                        <span className="font-medium text-gray-700">Обозначения:</span>
                                        {Object.entries(SHIFT_TYPES).map(([code, type]) => (
                                            <div key={code} className="flex items-center gap-1.5">
                                                <div className={`w-5 h-5 border rounded flex items-center justify-center font-bold text-xs ${type.color}`}>
                                                    {type.code}
                                                </div>
                                                <span className="text-gray-600 text-xs">{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Контекстное меню */}
            {contextMenu.visible && viewMode === 'employees' && (
                <div
                    className="fixed bg-white border border-gray-200 shadow-xl rounded-md py-1 z-[100] w-32"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    {['D', 'N', 'O', 'V', 'B', ''].map(code => {
                        const shift = SHIFT_TYPES[code] || { code: '—', label: 'Очистить', color: 'bg-gray-100' };
                        return (
                            <button
                                key={code}
                                onClick={() => setShiftManually(code)}
                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${shift.color}`}>
                                    {shift.code}
                                </span>
                                {shift.label}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Модалки */}
            {isModalError && <ModalNotifyError title={"Ошибка"} message={""} onClose={() => setIsModalError(false)} />}
            {isModalNotify && <ModalNotify title={"Результат операции"} message={""} onClose={() => setIsModalNotify(false)} />}
        </>
    );
}

export default observer(EmployeePlanningPage);