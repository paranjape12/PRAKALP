import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Switch, Link } from 'react-router-dom';
import './App.css';
import Navbar from '../src/components/Navbar';
import AddNewProject from '../src/components/AddNewProject';
import AddTask from '../src/components/AddTask';
import AssignTask from '../src/components/AssignTask';
import HomePage from '../src/pages/HomePage';
import AddEmployee from '../src/pages/AddEmployee';
import TaskOveriew from '../src/pages/TaskOverview';
import TaskOveriew2 from '../src/pages/TaskOverview2';
import EmployeePage from '../src/pages/EmployeePage';
import Login from '../src/pages/Login';
import EditEmployee from '../src/pages/EditEmployee';
import Register from '../src/pages/Register';
import RouteManager from '../src/RouterManger/RouteManager';
import EditTask from './components/EditTask';
import Employee1 from './pages/Profile/Employee1';
import Fabar from './components/Fabar';




function App() {

  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

   return (    
    <RouteManager></RouteManager>
  );
}

export default App;
