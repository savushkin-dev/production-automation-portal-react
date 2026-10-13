import { Navigation } from "../components/Navigation";
import { LeftNavigation } from "../components/leftNavigation/LeftNavigation";
import React, { useContext, useState } from "react";
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
// Статичные данные
// ─────────────────────────────────────────────

const INITIAL_EMPLOYEES = [
    { id: "e1", name: "Иванов И.И." },
    { id: "e2", name: "Петров П.П." },
    { id: "e3", name: "Сидоров С.С." },
    { id: "e4", name: "Кузнецов К.К." },
    { id: "e5", name: "Смирнов С.С." },
    { id: "e6", name: "Попов П.П." },
    { id: "e7", name: "Васильев В.В." },
    { id: "e8", name: "Соколов С.С." },
    { id: "e9", name: "Михайлов М.М." },
    { id: "e10", name: "Новиков Н.Н." },
    { id: "e11", name: "Фёдоров Ф.Ф." },
    { id: "e12", name: "Морозов М.М." },
];

const EMPTY_SLOTS = () => Array(6).fill(null);

const INITIAL_SHIFTS = [
    {
        id: "day-2026-10-12",
        type: "day",
        label: "Дневная смена",
        time: "08:00 – 20:00",
        slots: EMPTY_SLOTS(),
    },
    {
        id: "night-2026-10-12",
        type: "night",
        label: "Ночная смена",
        time: "20:00 – 08:00",
        slots: EMPTY_SLOTS(),
    },
];

// ─────────────────────────────────────────────
// Draggable-карточка сотрудника
// ─────────────────────────────────────────────

function EmployeeCard({ employee, isOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: employee.id,
            data: { employee },
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging && !isOverlay ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`px-3 py-2 rounded-md border border-gray-300 bg-white shadow-sm
                cursor-grab active:cursor-grabbing text-sm select-none
                ${isOverlay ? "ring-2 ring-blue-400" : ""}`}
        >
            {employee.name}
        </div>
    );
}

// ─────────────────────────────────────────────
// Droppable-слот в смене
// ─────────────────────────────────────────────

function ShiftSlot({ shiftId, slotIndex, employee }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot:${shiftId}:${slotIndex}`,
        data: { shiftId, slotIndex },
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-14 rounded-md flex items-center justify-center text-sm
                transition-colors border-2
                ${
                isOver
                    ? "border-blue-400 bg-blue-50"
                    : employee
                        ? "border-transparent bg-white shadow-sm"
                        : "border-dashed border-gray-300 bg-gray-50"
            }`}
        >
            {employee ? (
                <EmployeeCard employee={employee} />
            ) : (
                <span className="text-gray-400">+</span>
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

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState("");
    const [isModalError, setIsModalError] = useState(false);
    const [isModalNotify, setIsModalNotify] = useState(false);

    // ── Состояние доски ──
    const [shifts, setShifts] = useState(INITIAL_SHIFTS);
    const [unassigned, setUnassigned] = useState(INITIAL_EMPLOYEES);
    const [activeEmployee, setActiveEmployee] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, // защита от случайного drag
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 5 },
        })
    );

    // ── Helpers для поиска/удаления сотрудника ──

    const findEmployeeLocation = (employeeId, shiftsArr, unassignedArr) => {
        const uIdx = unassignedArr.findIndex((e) => e.id === employeeId);
        if (uIdx !== -1) return { type: "unassigned", index: uIdx };

        for (const shift of shiftsArr) {
            const sIdx = shift.slots.findIndex((e) => e && e.id === employeeId);
            if (sIdx !== -1) return { type: "shift", shiftId: shift.id, index: sIdx };
        }
        return null;
    };

    const removeEmployee = (employeeId, shiftsArr, unassignedArr) => {
        const newUnassigned = unassignedArr.filter((e) => e.id !== employeeId);
        const newShifts = shiftsArr.map((shift) => ({
            ...shift,
            slots: shift.slots.map((e) =>
                e && e.id === employeeId ? null : e
            ),
        }));
        return { newShifts, newUnassigned };
    };

    // ── Drag handlers ──

    const handleDragStart = (event) => {
        const { active } = event;
        const employee = active.data.current?.employee;
        setActiveEmployee(employee || null);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveEmployee(null);

        if (!over) return;

        const employeeId = active.id;
        const employee = active.data.current?.employee;
        if (!employee) return;

        // Куда упало
        const overData = over.data.current;

        // Сначала вынимаем сотрудника из текущего места
        const { newShifts: shiftsAfterRemove, newUnassigned: unassignedAfterRemove } =
            removeEmployee(employeeId, shifts, unassigned);

        // Если упало в слот смены
        if (overData?.shiftId !== undefined) {
            const { shiftId, slotIndex } = overData;

            const targetShift = shiftsAfterRemove.find((s) => s.id === shiftId);
            if (!targetShift) return;

            // Если слот занят — вернуть "вытесненного" в unassigned
            const occupant = targetShift.slots[slotIndex];
            let finalUnassigned = unassignedAfterRemove;
            if (occupant) {
                finalUnassigned = [...unassignedAfterRemove, occupant];
            }

            const finalShifts = shiftsAfterRemove.map((shift) => {
                if (shift.id !== shiftId) return shift;
                const newSlots = [...shift.slots];
                newSlots[slotIndex] = employee;
                return { ...shift, slots: newSlots };
            });

            setShifts(finalShifts);
            setUnassigned(finalUnassigned);
            return;
        }

        // Если упало в панель нераспределённых
        if (overData?.type === "unassigned") {
            setShifts(shiftsAfterRemove);
            setUnassigned([...unassignedAfterRemove, employee]);
            return;
        }

        // Упало куда-то ещё — просто фиксируем удаление из старого места
        setShifts(shiftsAfterRemove);
        setUnassigned(unassignedAfterRemove);
    };

    // ── Droppable-панель нераспределённых ──

    function UnassignedPanel() {
        const { isOver, setNodeRef } = useDroppable({
            id: "unassigned-panel",
            data: { type: "unassigned" },
        });

        return (
            <div
                ref={setNodeRef}
                className={`w-56 shrink-0 rounded-lg p-3 border-2 transition-colors
                    ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
            >
                <h3 className="font-semibold text-sm mb-3 text-gray-700">
                    Не распределены
                </h3>
                <div className="flex flex-col gap-2">
                    {unassigned.length === 0 && (
                        <span className="text-xs text-gray-400">
                            Все распределены
                        </span>
                    )}
                    {unassigned.map((emp) => (
                        <EmployeeCard key={emp.id} employee={emp} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation
                isHiddenMenu={false}
                isOpenMenu={false}
                setOpenMenu={() => {}}
            />
            <div className="flex flex-row window-height">
                <div className="hidden lg:block w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                    <LeftNavigation />
                </div>
                <div className="flex flex-col w-full">
                    <>
                        <div className="px-1 lg:px-16 pt-6 pb-2 flex flex-row gap-2 items-center justify-between text-center">
                            <span className="text-2xl font-bold">
                                Планирование персонала
                            </span>
                            <div className="flex flex-row gap-3"></div>
                        </div>

                        {/* Фильтры */}
                        <div className="px-1 lg:px-24 pb-2"></div>

                        {/* ── Доска ── */}
                        <div className="px-1 lg:px-16 pb-6">
                            <DndContext
                                sensors={sensors}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="flex gap-4 items-start">
                                    <UnassignedPanel />

                                    {shifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex-1 border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                                        >
                                            <div className="flex items-baseline justify-between mb-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    {shift.label}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {shift.slots.filter(Boolean).length} / 6
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3">
                                                {shift.time}
                                            </p>

                                            <div className="grid grid-cols-3 gap-2">
                                                {shift.slots.map((emp, idx) => (
                                                    <ShiftSlot
                                                        key={idx}
                                                        shiftId={shift.id}
                                                        slotIndex={idx}
                                                        employee={emp}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <DragOverlay>
                                    {activeEmployee ? (
                                        <EmployeeCard employee={activeEmployee} isOverlay />
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    </>
                </div>

                {isModalError && (
                    <ModalNotifyError
                        title={"Ошибка"}
                        message={error}
                        onClose={() => setIsModalError(false)}
                    />
                )}
                {isModalNotify && (
                    <ModalNotify
                        title={"Результат операции"}
                        message={msg}
                        onClose={() => setIsModalNotify(false)}
                    />
                )}
            </div>
        </>
    );
}

export default observer(EmployeePlanningPage);