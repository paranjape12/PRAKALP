import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../App.css';
import HomePage from '../pages/HomePage';
import AddEmployee from '../components/Navbar/Dropdown/Manage Employee/AddEmployee';
import TaskOveriew from '../pages/TaskOverview/TaskOverview';
import EmployeePage from '../pages/EmployeePage';
import Login from '../pages/Login/Login';
import EditEmployee from '../components/Navbar/Dropdown/Manage Employee/EditEmployee';
import Register from '../pages/Register/Register';
import ProjectOverview from '../pages/ProjectOverview';
import Profile from '../pages/Profile/Profile';

function RouteManager() {
    const [showAddProject, setShowAddProject] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAssignTask, setShowAssignTask] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile/>} />
                <Route path="/task" element={<TaskOveriew/>} />
                <Route path="/employee" element={<EmployeePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/project" element={<ProjectOverview />} />


                <Route path="/homepage" element={<HomePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/edit-employee" element={<EditEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/add-employee" element={<AddEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
            </Routes>
        </Router>
    );
}

export default RouteManager;