import React, {useContext, useEffect, useState} from "react";
import {Route, Routes} from 'react-router-dom';
import ReportDesignerPage from "./pages/ReportDesignerPage";
import Authorization from "./pages/Authorization";
import {Context} from "./index";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/ReportsPage";
import ViewReportPage from "./pages/ViewReportPage";
import SchedulePage from "./pages/SchedulePage";
import AdminPanelPage from "./pages/AdminPanelPage";
import TrackTracePage from "./pages/TrackTracePage";
import {configureMomentLocale} from "./utils/date/momentConfig";


function App() {


    const {store} = useContext(Context);

    const [isCheckAuth, setIsCheckAuth] = useState(false);

    useEffect(() => {
        configureMomentLocale();
        if (localStorage.getItem('tokenAutomationProduction')) {
            store.checkAuth().then(() => setIsCheckAuth(true));
        } else {
            setIsCheckAuth(true)
        }
    }, [])


    if (isCheckAuth) {
        return (
            <>
                <Routes>

                    <Route path="/" element={<ReportsPage/>}/>
                    <Route path="/report" element={<ViewReportPage/>}/>
                    <Route path="/scheduler" element={<SchedulePage/>}/>
                    <Route path="/tracktrace" element={<TrackTracePage/>}/>



                    <Route path="/designer" element={<PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EDITOR']} />}>
                        <Route index element={<ReportDesignerPage/>}/>
                    </Route>

                    {/*<Route path="/scheduler" element={<PrivateRoute requiredRoles={['ROLE_ADMIN']} />}>*/}
                    {/*    <Route index element={<SchedulePage/>}/>*/}
                    {/*</Route>*/}

                    <Route path="/admin" element={<PrivateRoute requiredRoles={['ROLE_ADMIN']} />}>
                        <Route index element={<AdminPanelPage/>}/>
                    </Route>


                    <Route path="/login" element={<Authorization/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>

            </>
        );
    }
}

export default App;
