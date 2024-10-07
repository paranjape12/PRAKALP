import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskOveriew from '../pages/TaskOverview/TaskOverview';
import Login from '../pages/Login/Login';
import Login3 from '../pages/Login/Login3';
import Register from '../pages/Register/Register';
import ProjectOverview from '../pages/ProjectOverview/ProjectOverview';
import Profile from '../pages/Profile/Profile';
import EmployeeOverview from '../pages/EmployeeOverview/EmployeeOverview';

function RouteManager() {
    return (
        <Router>
            <Routes>
                {/* AES token based login */}
                <Route path="/" element={<Login3 />} />
                {/* regular password login */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/task" element={<TaskOveriew />} />
                <Route path="/employeeOverview" element={<EmployeeOverview />} />
                <Route path="/project" element={<ProjectOverview />} />
            </Routes>
        </Router>
    );
}

export default RouteManager;