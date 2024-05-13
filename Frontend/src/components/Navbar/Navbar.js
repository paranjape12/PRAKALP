import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel } from '@mui/material';
import { faUser, faUsers, faBars, faCircleUser, faDiagramProject, faRightFromBracket, faL } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import AddProjectDialog from './AddNewProject';
import CreateCopyProject from './CreateCopyProject';
import AddTaskModal from './AddTask'
import AddNewProject from './AddNewProject';

function Navbar({ onAddProjectClick, onAddTaskClick, onAssignTaskClick, onNextDayClick, onPreviousDayClick, onTodayClick, dates }) {
  const [activeButton, setActiveButton] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [openAddPrjDialog, setOpenAddPrjDialog] = useState(false);  
  const [dialogType, setDialogType] = useState(null); 
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [addNewProjectOpen, setAddNewProjectOpen] = useState(false);
  const [createCopyProjectOpen, setCreateCopyProjectOpen] = useState(false);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false); 
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


// Define a function to open the AddNewProject dialog
const handleOpenAddProjectDialog = () => {
  setAddProjectDialogOpen(true);
};

// Define a function to close the AddNewProject dialog
const handleCloseAddProjectDialog = () => {
  setAddProjectDialogOpen(false);
};

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    setShowSettingsDropdown(false);
    setShowMenuDropdown(false);
    setShowProfileDropdown(false);

    if (buttonName === 'home') {
      navigate('/');
    }
    if (buttonName === 'emp') {
      navigate('/employee');
    }
  };

  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };

  const handleSettingsButtonClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
    setShowMenuDropdown(false);
    setShowProfileDropdown(false);
  };

  const handleMenuButtonClick = () => {
    setShowMenuDropdown(!showMenuDropdown);
    setShowSettingsDropdown(false);
    setShowProfileDropdown(false);
  };

  const handleProfileButtonClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowSettingsDropdown(false);
    setShowMenuDropdown(false);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const background = isPopupVisible ? 'blurred-background' : '';



  return (
    <div className={`App ${background}`}>
      <div className='navbar_bg'>
        <div className='title'>
          <Link style={{ fontSize: '24px', color: '#f8f9fc', textDecoration: 'none' }}>
            {location.pathname === "/" ? "GJC created Home" :
              location.pathname === "/task" ? "Overview - Task" :
                location.pathname === "/employee1" ? "Overview - Employee" : "Prakalp"}
          </Link>
        </div>
        <div className='navbar-container'>
          {dates.length > 0 && (
            <ul className="navbar-list">
              <li className="nav-item dropdown no-arrow mx-1 p-0">
                <Link onClick={onTodayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  Today
                </Link>
              </li>
              <li className="nav-item dropdown no-arrow mx-1 p-0">
                <Link onClick={onPreviousDayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  &lt; {dates[0].dateString ? dates[0].dateString : ''}
                </Link>
              </li>
              <li className="nav-item dropdown no-arrow mx-1 p-0">
                <a onClick={onNextDayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  - {dates[dates.length - 1].dateString ? dates[dates.length - 1].dateString : ''} &gt;
                </a>
              </li>
            </ul>
          )}
          <div className="navbar_icon">
            <button className={activeButton === 'emp' ? 'home_bg active' : 'home_bg'} onClick={() => handleButtonClick('emp')}>
              <FontAwesomeIcon icon={faUsers} size='2x' color='white' />
            </button>
            <button className={activeButton === 'home' ? 'home_bg active' : 'home_bg'} onClick={() => handleButtonClick('home')}>
              <FontAwesomeIcon icon={faDiagramProject} size='2x' color='white' />
            </button>
            <div className='dropdown'>
              <button className={activeButton === 'menu' ? 'home_bg active' : 'home_bg'} onClick={() => { handleMenuButtonClick(); }}>
                <FontAwesomeIcon icon={faBars} size='2x' color='white' />
              </button>
              {showMenuDropdown && (
                <div className="dropdown-content">
                  <div>
                    <div><button onClick={handleOpenAddProjectDialog}>Add Project</button>
                    <AddNewProject open={addProjectDialogOpen} onClose={handleCloseAddProjectDialog} /></div>
                    <div><button> Manage Employees </button></div>
                    <div><button>Add Task</button></div>
                    <div><button>Assign Task</button>
                    <AddTaskModal open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} /></div>
                    <div><button>Setting</button></div>
                  </div>
                </div>
              )}
            </div>

            <div className='dropdown'>
              <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'} onClick={() => { handleProfileButtonClick('profile'); }}>
                <FontAwesomeIcon icon={faCircleUser} size='2x' color='white' />
                {showProfileDropdown && (
                  <div className="dropdown-content">
                    <div>
                      <div><button><FontAwesomeIcon icon={faUser} color='blue' />&emsp; Profile</button></div>
                      <div onClick={handleLogout}><button><FontAwesomeIcon icon={faRightFromBracket} color='red' />&emsp; LogOut</button></div>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;