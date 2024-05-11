import React, { useState } from 'react';
import './App.css';
import RouteManager from '../src/RouterManger/RouteManager';

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
