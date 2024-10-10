import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faSquarePlus, faUser, faUsers, faBars, faCircleUser, faDiagramProject, faRightFromBracket, faHouse } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask'
import AddNewProject from '../Navbar/Dropdown/Add Project/AddNewProject';
import AssignTaskDialog from '../Navbar/Dropdown/Assign Task/AssignTask';
import SettingsDialog from '../Navbar/Dropdown/Settings/SettingsDialog';
import AddEmployee from '../Navbar/Dropdown/Manage Employee/AddEmployee';
import LogoutPopup from '../../components/Navbar/Dropdown/Logout/LogoutPopup'
import { getUserDataFromToken } from '../../utils/tokenUtils';
import { useDispatch } from 'react-redux';
import { openAddProjectModal } from '../../services/redux/AddEmployeeSlice';
import { useSelector } from 'react-redux';

function Navbar({ onTodayClick, onNextDayClick, onPreviousDayClick, dates, settingsDialogOpen, onOpenSettingsDialog, onSettingsClose, onSettingsApply, onSaveFetchProjects, onTaskSaved }) {


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
  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);

  const addEmployeeModal = useSelector((state) => state.addEmployee.addEmployeeModal);
  
  const dispatch = useDispatch();

  const handleOpenAddEmployeeModal = () => {
    setShowMenuDropdown(false);
    dispatch(openAddProjectModal());

  }
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    { PageName: 'Project' },
    { PageName: 'Epmloyee' },
    { PageName: 'Task' },
    // Add more pages as needed
  ];

  const handleOpenAddProjectDialog = () => {
    setShowMenuDropdown(!showMenuDropdown);
    setAddProjectDialogOpen(true);
  };
  const handleCloseAddProjectDialog = () => {
    setAddProjectDialogOpen(false);
  };

  const handleOpenAddEmployeeDialog = () => {
    setShowMenuDropdown(!showMenuDropdown);
    setAddEmployeeDialogOpen(true);
  };
  const handleCloseAddEmployeeDialog = () => {
    setAddEmployeeDialogOpen();
  };

  const handleOpenAddTaskDialog = () => {
    setShowMenuDropdown(!showMenuDropdown);
    setAddTaskDialogOpen(true);
  };
  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };
  const handleOpenSettingsDialog = () => {
    setShowMenuDropdown(!showMenuDropdown);
  };
  const handleOpenAssignTaskDialog = () => {
    setShowMenuDropdown(!showMenuDropdown);
    setAssignTaskDialogOpen(true);
  };
  const handleCloseAssignTaskDialog = () => {
    setAssignTaskDialogOpen(false);
  };

  const userdata = getUserDataFromToken();

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


  const handleOpenlogoutPopup = () => {
    setLogoutPopupOpen(true);
  };

  const handleCloselogoutPopup = () => {
    setLogoutPopupOpen(false);
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
          {userdata.accessdetails && (
            <div className='dropdown'>
              <button className={activeButton === 'menu' ? 'home_bg active' : 'home_bg'} onClick={() => { handleMenuButtonClick('menu'); }}>
                <FontAwesomeIcon icon={faBars} style={{ fontSize: '1.6rem' }} color='white' />
              </button>
              {showMenuDropdown && (
                <div className={`dropdown-navbar-content  ${showMenuDropdown ? 'show' : ''}`} style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    <button
                      className='dropdown-item d-flex align-items-center'
                      onClick={handleOpenAddProjectDialog}
                      title="Add Project"
                    >
                      <div className='mr-3'>
                        <div className='icon-circle bg-primary'>
                          <FontAwesomeIcon icon={faSquarePlus} style={{ color: "white" }} />
                        </div>
                      </div>
                      <div>
                        Add Project
                      </div>
                    </button>
                  </div>
                  <hr style={{ margin: '0', color: '#e5e8e8', backgroundColor: '#e5e8e8', }} />

                  <div>
                    <button
                      className='dropdown-item d-flex align-items-center'
                      onClick={handleOpenAddEmployeeModal}
                      title="Add Project"
                    >
                      <div className='mr-3'>
                        <div className='icon-circle bg-success'>
                          <FontAwesomeIcon icon={faUsers} style={{ color: "white", }} />
                        </div>
                      </div>
                      <div>
                        Manage<br></br>
                        Employee
                      </div>
                    </button>
                  </div>
                  <hr style={{ margin: '0', color: '#e5e8e8', backgroundColor: '#e5e8e8', }} />

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
                  </div>
                  <hr style={{ margin: '0', color: '#e5e8e8', backgroundColor: '#e5e8e8', }} />

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
                  </div>
                  <hr style={{ margin: '0', color: '#e5e8e8', backgroundColor: '#e5e8e8', }} />

                  <div onClick={handleOpenSettingsDialog}>
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

                  </div>
                </div>
              )}

              <AddEmployee openDialog={addEmployeeDialogOpen} handleClose={handleCloseAddEmployeeDialog} />
              <SettingsDialog open={settingsDialogOpen} onClose={onSettingsClose} onApply={onSettingsApply}  onSaveFetchProjects={onSaveFetchProjects} />
              <AssignTaskDialog open={assignTaskDialogOpen} onClose={handleCloseAssignTaskDialog} />
              <AddNewProject open={addProjectDialogOpen} onClose={handleCloseAddProjectDialog} onSaveFetchProjects={onSaveFetchProjects} />
              <AddTaskModal open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} onSaveFetchProjects={onSaveFetchProjects} onTaskSaved={onTaskSaved}/>
            </div>
          )}

          <div className='dropdown'>
            <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'} onClick={() => { handleProfileButtonClick('profile'); }}>
              <FontAwesomeIcon icon={faCircleUser} size='2x' color='white' />
              {showProfileDropdown && (
                <div className={`dropdown-profile-content  ${showProfileDropdown ? 'show' : ''}`} style={{ marginTop: '15px' }}>
                  <div>
                    <div><button><Link to="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                      <FontAwesomeIcon icon={faUser} color='blue' />&emsp; Profile
                    </Link></button>
                    </div>

                    <hr style={{ margin: '0', color: '#e5e8e8', backgroundColor: '#e5e8e8', }} />

                    <div onClick={handleOpenlogoutPopup}>
                      <button><FontAwesomeIcon icon={faRightFromBracket} color='red' />&emsp; LogOut</button></div>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      {logoutPopupOpen && (
        <LogoutPopup
          open={logoutPopupOpen}
          handleClose={handleCloselogoutPopup}

        />
      )}
    </div>

  );
}
export default Navbar; 