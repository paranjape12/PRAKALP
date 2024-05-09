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
import EditTask from './components/EditTask';
import Employee1 from './pages/Profile/Employee1';
import Fabar from './components/Fabar';




function App() {

  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

 

// return (
//   <Router>
//       {isAuthenticated && (
//         <Navbar
//           onAddProjectClick={handleAddProjectClick}
//           onAddTaskClick={handleAddTaskClick}
//           onAssignTaskClick={handleAssignTaskClick}
//         />
//       )}
//       {showAddProject && <AddNewProject onClose={handleCloseAddProject} />}
//       {showAddTask && <AddTask onClose={handleCloseTaskProject} />}
//       {showAssignTask && <AssignTask onClose={handleCloseAssignTaskProject} />}
//       <Routes>
//         <Route path="/" element={<HomePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
//         <Route path="/task" element={<TaskOverview isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
//         <Route path="/employee" element={<EmployeePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
//         <Route path="/edit-employee" element={<AddEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
//         <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
//         <Route path="/logout" element={<Login onLoginSuccess={handleLogout} />} />
//       </Routes>
//     </Router>

//   );
// }

// export default App;



  return (
    <Router>

      {/* <div>

        < Navbar onAddProjectClick={handleAddProjectClick} onAddTaskClick={handleAddTaskClick} onAssignTaskClick={handleAssignTaskClick} />
        {showAddProject && <AddNewProject onClose={handleCloseAddProject} />}
        {showAddTask && <AddTask onClose={handleCloseTaskProject} />}
        {showAssignTask && <AssignTask onClose={handleCloseAssignTaskProject} />}S

      </div> */}

      <Routes>
        <Route path="/" element={<HomePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/task" element={<TaskOveriew isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/task2" element={<TaskOveriew2 isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/employee" element={<EmployeePage isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/edit-employee" element={<EditEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/add-employee" element={<AddEmployee isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employee1" element={<Employee1 isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/addnew-project" element={<AddNewProject isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
        <Route path="/fabar" element={<Fabar isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />

      </Routes>
      {/* <Login onLoginSuccess={handleLoginSuccess}/> */}
    </Router>



  );
}

export default App;
