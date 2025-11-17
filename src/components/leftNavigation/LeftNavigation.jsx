import React from 'react'
import {StringLeftNavigation} from "./StringLeftNavigation";
import RoleGuard from "../RoleGuard";

export function LeftNavigation() {

    return (
        <div className="flex flex-wrap lg:flex-col w-full ">
            {/*<StringLeftNavigation disabled={false} title="Справка по проектам" navigationPath={"/"}/>*/}
            <StringLeftNavigation disabled={false} title="Отчеты АСУТП" navigationPath={"/"}/>
            {/*<StringLeftNavigation disabled={false} title="Менеджмент IP адресов" navigationPath={"/"}/>*/}

            {/*<StringLeftNavigation disabled={false} title="Прослеживаемость" navigationPath={"/"}/>*/}
            {/*<StringLeftNavigation disabled={false} title="Диспетчеризация" navigationPath={"/"}/>*/}
            {/*<StringLeftNavigation disabled={false} title="Показатели KPI" navigationPath={"/"}/>*/}

            <RoleGuard requiredRoles={['ROLE_SCHEDULER']}>
                <StringLeftNavigation disabled={false} title="Планы производства" navigationPath={"/scheduler"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_ADMIN','ROLE_EDITOR']}>
                <StringLeftNavigation disabled={false} title="Конструктор отчетов" navigationPath={"/designer"}/>
            </RoleGuard>

            <RoleGuard requiredRoles={['ROLE_ADMIN']}>
                <StringLeftNavigation disabled={false} title="Админ панель" navigationPath={"/admin"}/>
            </RoleGuard>


        </div>
    )
}