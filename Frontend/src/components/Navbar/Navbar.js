import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link, } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faSquarePlus, faUser, faUsers, faBars, faCircleUser, faDiagramProject, faRightFromBracket, faHouse } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask'
import AddNewProject from '../Navbar/Dropdown/Add Project/AddNewProject';
import AssignTaskDialog from '../Navbar/Dropdown/Assign Task/AssignTask';
import Profile from '../../pages/Profile/Profile';
import SettingsDialog from '../Navbar/Dropdown/Settings/SettingsDialog';
import AddEmployee from '../Navbar/Dropdown/Manage Employee/AddEmployee';
import { getUserDataFromToken } from '../../utils/tokenUtils';


function Navbar({ onTodayClick, onNextDayClick, onPreviousDayClick, dates, settingsDialogOpen, onOpenSettingsDialog, onSettingsClose, onSettingsApply }) {
  const [activeButton, setActiveButton] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [assignTaskDialogOpen, setAssignTaskDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    { PageName: 'Project' },
    { PageName: 'Epmloyee' },
    { PageName: 'Task' },
    // Add more pages as needed
  ];

  // useEffect(() => {
  //   // Fetch pages
  //   axios.get(`${process.env.REACT_APP_API_BASE_URL}/pages')
  // .then(response => {
  //   console.log('Pages fetched successfully:', response.data);
  // })
  // .catch(error => {
  //   console.error('There was an error fetching the pages!', error);
  // });

  // }, []);

  const handleOpenAddProjectDialog = () => {
    setAddProjectDialogOpen(true);
  };
  const handleCloseAddProjectDialog = () => {
    setAddProjectDialogOpen(false);
  };

  const handleOpenAddEmployeeDialog = () => {
    setAddEmployeeDialogOpen(true);
  };
  const handleCloseAddEmployeeDialog = () => {
    setAddEmployeeDialogOpen(false);
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
    localStorage.removeItem('token');
    localStorage.removeItem('filterState');
    const userData = getUserDataFromToken();
    if (userData.Type !== "Employee") {
      localStorage.removeItem('filterStateAdmin');
    }
  };


  const background = isPopupVisible ? 'blurred-background' : '';

  return (
    <div className={`App ${background}`}>
      <div className='navbar_bg'>
        <div className='title'>
          <Link style={{ fontSize: '24px', color: '#f8f9fc', textDecoration: 'none' }}>
            {location.pathname === "/project" ? "Overview - Project" :
              location.pathname === "/task" ? "Overview - Task" :
                location.pathname === "/employeeOverview" ? "Overview - Employee" : "Prakalp"}
          </Link>
        </div>
        <div className='navbar-container'>
          {dates.length > 0 && (
            <ul className="navbar-list">
              <li className="today-nav-item dropdown no-arrow mx-1 p-0">
                <Link onClick={onTodayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  Today
                </Link>
              </li>
              <li className="prev-nav-item dropdown no-arrow mx-1 p-0">
                <Link onClick={onPreviousDayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  &lt; {dates[0].dateString ? dates[0].dateString : ''}
                </Link>
              </li>
              <li className="next-nav-item dropdown no-arrow mx-1 p-0">
                <a onClick={onNextDayClick} className="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer', fontFamily: 'Nunito' }}>
                  - {dates[dates.length - 1].dateString ? dates[dates.length - 1].dateString : ''} &gt;
                </a>
              </li>
            </ul>
          )}
          {location.pathname === "/task" ? (
            <div className="navbar_icon">
              <Link to="/employeeOverview">
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
              <Link to="/project">
                <FontAwesomeIcon icon={faDiagramProject} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
            </div>
          ) : location.pathname === "/employeeOverview" ? (
            <div className="navbar_icon">
              <Link to="/project">
                <FontAwesomeIcon icon={faDiagramProject} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
              <Link to="/task">
                <FontAwesomeIcon icon={faHouse} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
            </div>
          ) : location.pathname === "/project" ? (
            <div className="navbar_icon">
              <Link to='/employeeOverview'>
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
              <Link to='/task'>
                <FontAwesomeIcon icon={faHouse} style={{ fontSize: '1.6rem', paddingLeft: '1rem' }} color='white' />
              </Link>
            </div>
          ) : (
            <div className="placeholder-class"></div>
          )}
          <div className='dropdown'>
            <button className={activeButton === 'menu' ? 'home_bg active' : 'home_bg'} onClick={() => { handleMenuButtonClick('menu'); }}>
              <FontAwesomeIcon icon={faBars} style={{ fontSize: '1.6rem' }} color='white' />
            </button>
            {showMenuDropdown && (
              <div className={`dropdown-content ${showMenuDropdown ? 'show' : ''}`} style={{ borderRadius: '10px' }}>
                <div>
                  <button
                    className='dropdown-item d-flex align-items-center'
                    onClick={handleOpenAddProjectDialog}
                    title="Add Project"
                  >
                    <div className='mr-3'>
                      <div className='icon-circle bg-primary'>
                        <FontAwesomeIcon icon={faSquarePlus} style={{ color: "white", }} />
                      </div>
                    </div>
                    <div>
                      Add Project
                    </div>
                  </button>
                  <AddNewProject open={addProjectDialogOpen} onClose={handleCloseAddProjectDialog} />
                </div>
                <div>
                  <button
                    className='dropdown-item d-flex align-items-center'
                    onClick={handleOpenAddEmployeeDialog}
                    title="Add Project"
                  >
                    <div className='mr-3'>
                      <div className='icon-circle bg-success'>
                        <FontAwesomeIcon icon={faUsers} style={{ color: "white", }} />
                      </div>
                    </div>
                    <div>
                      Manage Employee
                    </div>
                  </button>
                  <AddEmployee openDialog={addEmployeeDialogOpen} handleClose={handleCloseAddEmployeeDialog} pages={pages} />
                </div>

                <div>
                  <button
                    className='dropdown-item d-flex align-items-center'
                    onClick={handleOpenAddTaskDialog}
                    title="Add Project"
                  >
                    <div className='mr-3'>
                      <div className='icon-circle bg-warning'>
                        <FontAwesomeIcon icon={faSquarePlus} style={{ color: "white", }} />
                      </div>
                    </div>
                    <div>
                      Add Task
                    </div>
                  </button>
                  <AddTaskModal open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} />
                </div>
                <div>
                  <button
                    className='dropdown-item d-flex align-items-center'
                    onClick={handleOpenAssignTaskDialog}
                    title="Add Project"
                  >
                    <div className='mr-3'>
                      <div className='icon-circle bg-warning'>
                        <FontAwesomeIcon icon={faSquarePlus} style={{ color: "white", }} />
                      </div>
                    </div>
                    <div>
                      Assign Task
                    </div>
                  </button>
                  <AssignTaskDialog open={assignTaskDialogOpen} onClose={handleCloseAssignTaskDialog} />
                </div>

                <div>
                  <button
                    className="dropdown-item d-flex align-items-center"
                    onClick={onOpenSettingsDialog}
                    title="Add Project"
                  >
                    <div className="mr-3">
                      <div className="icon-circle bg-secondary">
                        <FontAwesomeIcon icon={faGear} style={{ color: "white", }} />
                      </div>
                    </div>
                    <div>
                      Setting
                    </div>
                  </button>
                  <SettingsDialog open={settingsDialogOpen} onClose={onSettingsClose}
                    onApply={onSettingsApply}  // Pass apply handler to SettingsDialog
                  />
                </div>
              </div>
            )}
          </div>

          <div className='dropdown'>
            <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'} onClick={() => { handleProfileButtonClick('profile'); }}>
              <FontAwesomeIcon icon={faCircleUser} size='2x' color='white' />
              {showProfileDropdown && (
                <div className={`dropdown-content ${showProfileDropdown ? 'show' : ''}`}>
                  <div>
                    <div><button><Link to="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                      <FontAwesomeIcon icon={faUser} color='blue' />&emsp; Profile
                    </Link></button>
                    </div>

                    <div onClick={handleLogout}><button><FontAwesomeIcon icon={faRightFromBracket} color='red' />&emsp; LogOut</button></div>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Navbar;