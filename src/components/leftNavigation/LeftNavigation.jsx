import React from 'react'
import {StringLeftNavigation} from "./StringLeftNavigation";
import RoleGuard from "../RoleGuard";

export function LeftNavigation() {

    return (
        <div className="flex flex-wrap flex-col w-full ">
            <StringLeftNavigation disabled={false} title="Отчеты АСУТП" navigationPath={"/"}/>

            <RoleGuard requiredRoles={['ROLE_SCHEDULER']}>
                <StringLeftNavigation disabled={false} title="Планы производства" navigationPath={"/scheduler"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_SCHEDULER']}>
                <StringLeftNavigation disabled={false} title="Расчет материалов" navigationPath={"/materials"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_EDITOR']}>
                <StringLeftNavigation disabled={false} title="Конструктор отчетов" navigationPath={"/designer"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_ADMIN']}>
                <StringLeftNavigation disabled={false} title="Админ панель" navigationPath={"/admin"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_ADMIN']}>
                <StringLeftNavigation disabled={false} title="Использование отчетов" navigationPath={"/report/monitor"}/>
            </RoleGuard>

        </div>
    )
}