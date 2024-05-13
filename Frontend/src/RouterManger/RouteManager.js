import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Switch, Link } from 'react-router-dom';
import '../App.css';
import HomePage from '../pages/HomePage';
import AddEmployee from '../pages/AddEmployee';
import TaskOveriew from '../pages/TaskOverview/TaskOverview';
import EmployeePage from '../pages/EmployeePage';
import Login from '../pages/Login/Login';
import EditEmployee from '../pages/EditEmployee';
import Register from '../pages/Register/Register';

function RouteManager() {

    const [showAddProject, setShowAddProject] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAssignTask, setShowAssignTask] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);



    return (
        <Router>

            <Routes>
                <Route path="/" element={<Login />} /> 
                <Route path="/register" element={<Register />} />
                <Route path="/task" element={<TaskOveriew isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />

                <Route path="/homepage" element={<HomePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/employee" element={<EmployeePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/edit-employee" element={<EditEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/add-employee" element={<AddEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                
            </Routes>
        </Router>



    );
}

export default RouteManager;