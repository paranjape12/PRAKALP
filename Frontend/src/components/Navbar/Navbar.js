import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faBars, faCircleUser, faDiagramProject, faRightFromBracket, faL } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask'
import AddNewProject from '../Navbar/Dropdown/Add Project/AddNewProject';
import AssignTaskDialog from '../Navbar/Dropdown/Assign Task/AssignTask'

function Navbar({ onNextDayClick, onPreviousDayClick, dates }) {
  const [activeButton, setActiveButton] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [assignTaskDialogOpen, setAssignTaskDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenAddProjectDialog = () => {
    setAddProjectDialogOpen(true);
  };
  const handleCloseAddProjectDialog = () => {
    setAddProjectDialogOpen(false);
  };
  const handleOpenAddTaskDialog = () => {
    setAddTaskDialogOpen(true);
  };
  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };
  const handleOpenAssignTaskDialog = () => {
    setAssignTaskDialogOpen(true);
  };
  const handleCloseAssignTaskDialog = () => {
    setAssignTaskDialogOpen(false);
  };

  const onTodayClick = () => {
    window.location.reload(false);
  }

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
              <button className={activeButton === 'menu' ? 'home_bg active' : 'home_bg'} onClick={() => { handleMenuButtonClick('menu'); }}>
                <FontAwesomeIcon icon={faBars} size='2x' color='white' />
              </button>
              {showMenuDropdown && (
                <div className="dropdown-content">
                  <div>
                    <div><button onClick={handleOpenAddProjectDialog}>Add Project</button>
                      <AddNewProject open={addProjectDialogOpen} onClose={handleCloseAddProjectDialog} /></div>
                    <div><button> Manage Employees </button></div>
                    <div><button onClick={handleOpenAddTaskDialog}>Add Task</button>
                      <AddTaskModal open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} /></div>
                    <div><button onClick={handleOpenAssignTaskDialog}>Assign Task</button>
                    <AssignTaskDialog open={assignTaskDialogOpen} onClose={handleCloseAssignTaskDialog}/></div>
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