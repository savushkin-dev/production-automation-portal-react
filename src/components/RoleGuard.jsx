import React, {useContext, useEffect} from 'react';
import {Context} from '../index';
import {observer} from 'mobx-react-lite';

const RoleGuard = ({children, requiredRoles = [], fallback = null}) => {
    const {store} = useContext(Context);

    useEffect(() => {
        // При монтировании компонента и при изменении requiredRoles проверяем актуальные права
        store.checkAuth();
    }, [requiredRoles]);

    if (!store.isAuth) {
        return fallback;
    }

    let hasAccess;

    hasAccess = store.hasAnyRole(requiredRoles);


    if (!hasAccess) {
        return fallback;
    }

    return children;
};

export default observer(RoleGuard);