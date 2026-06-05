import {useContext} from 'react';
import {Context} from '../index';
import {observer} from 'mobx-react-lite';

const RoleGuard = ({children, requiredRoles = [], fallback = null}) => {
    const {store} = useContext(Context);

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