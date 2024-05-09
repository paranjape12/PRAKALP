import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import '../cssfiles/Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser , faUsers, faBars, faCircleUser} from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket , faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import menu from '../assets/menu.png';
import emp from '../assets/emp.png';
import settings from '../assets/settings.png';
import home from '../assets/home.png';
import profile from '../assets/profile-user.png';
import axios from 'axios';
import Popup from 'reactjs-popup';
import { RiCloseCircleFill } from 'react-icons/ri';



function Navbar({ onAddProjectClick, onAddTaskClick, onAssignTaskClick }) {

  const [activeButton, setActiveButton] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const navigate = useNavigate();  // Initialize useNavigate

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);  // Reset dropdown states when a button is clicked
    setShowSettingsDropdown(false);
    setShowMenuDropdown(false);
    setShowProfileDropdown(false);

    if (buttonName === 'home') {
      navigate('/');  // Navigate to the homepage
    }
    if (buttonName === 'emp') {
      navigate('/employee');  // Navigate to the homepage
    }

  };


  const handleAddProjectClick = () => {
    onAddProjectClick();
    // setPopupVisible(true);
  };

  const handleAddTaskClick = () => {
    onAddTaskClick();
    // setPopupVisible(true);
  };

  const handleAssignTaskClick = () => {
    onAssignTaskClick();
  };

  const handleSettingsButtonClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
    // Close the menu dropdown when settings is clicked
    setShowMenuDropdown(false);
    setShowProfileDropdown(false);
  };

  const handleMenuButtonClick = () => {
    setShowMenuDropdown(!showMenuDropdown);
    // Close the settings dropdown when menu is clicked
    setShowSettingsDropdown(false);
    setShowProfileDropdown(false);
  };

  
  const handleProfileButtonClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowSettingsDropdown(false);
    setShowMenuDropdown(false);
  };

  const handleLogout = () => {
    // Perform logout logic if needed
    // For now, simply navigate to the login page
    navigate('/login');
  };
   
  const [isPopupVisible, setPopupVisible] = useState(false);
  const background = isPopupVisible ? 'blurred-background' : '';



  // //pop add project
  // const handleAddProject = async (projectName, salesName) => {
  //   try {
  //     const token = localStorage.getItem("token"); // Assuming you have a token stored in localStorage
  //     const response = await axios.post('/api/projects', { projectName, salesName }, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log(response.data); // Log the response from the server
  //     alert("Project added successfully");
  //     // Optionally, fetch updated data or perform additional logic after project addition
  //     // fetchData(); // Example: if fetchData is a function to fetch updated data
  //   } catch (error) {
  //     console.error("Error adding project:", error);
  //     alert("Error adding project");
  //   }
    
  // };
 
   

  return (
    <div className={`App ${background}`}>
      <div className='navbar_bg'>
        <div className='title'>
        <a style={{fontSize:'24px',color:'#f8f9fc'}}>Prakalp</a>
        </div>
        <div className='navbar-container'>
        <ul className="navbar-list">
            <li class="nav-item dropdown no-arrow mx-1 p-0">
              <a title="today" id="today" class="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer' }}>
                Today
              </a>
            </li>
            <li class="nav-item dropdown no-arrow mx-1 p-0">
              <a title="previous" id="previous" class="nav-link text-white th1 p-0" style={{ paddingRight: '10px', cursor: 'pointer' }}>
                &lt; Day 1
              </a>
            </li>
            <li class="nav-item dropdown no-arrow mx-1 ">
              <a title="next" id="next" class="nav-link  text-white  th7 p-0" style={{ paddingRight: '20px', cursor: 'pointer' }}>
                -&nbsp; Day 7 &gt;
              </a>
            </li>
          </ul>
        <div className="navbar_icon">


          {/* <div className='dropdown'>
            <button className={activeButton === 'settings' ? 'home_bg active' : 'home_bg'}
              onClick={() => {
                handleSettingsButtonClick();
              }} >
              <img src={settings} className='icon_bg'></img>
            </button>
            {showSettingsDropdown && (
              <div className="dropdown-content">
                <div>
                  {/* Add your dropdown content for settings here */}
                  {/* <div><button>Projects Status</button></div>
                  <div><button>Tasks Status</button></div>
                  <div><button>Employees Status</button></div>
                </div>
              </div>
            )}
          </div> */} 
          <button className={activeButton === 'emp' ? 'home_bg active' : 'home_bg'}
            onClick={() => handleButtonClick('emp')}>
            {/* <img src={emp} className='icon_bg'></img> */}
            <FontAwesomeIcon icon={faUsers} size='2x' color='white' />
          </button>
          <button className={activeButton === 'home' ? 'home_bg active' : 'home_bg'}
            onClick={() => handleButtonClick('home')}>
            {/* <img src={home} className='icon_bg'></img> */}
            <FontAwesomeIcon icon={faDiagramProject} size='2x' color='white' />
          </button>
          <div className='dropdown'>
            <button className={activeButton === 'menu' ? 'home_bg active' : 'home_bg'}
              onClick={() => {
                handleMenuButtonClick();
              }} >
              {/* <img src={menu} className='icon_bg'></img> */}
              
              <FontAwesomeIcon icon={faBars} size='2x' color='white' />
              
            </button>
            {showMenuDropdown && (
              <div className="dropdown-content">
                {/* Add your dropdown content for menu here */}
                <div>
                  
                  
                  
                  <div><button onClick={handleAddProjectClick}>Add Project</button>
                  {/* <Popup
                    trigger={<button>Add Project</button>}
                    position="right center"
                    modal
                    className="custom-popup"
                  >
                    {(close) => (
                      <div className="popup-contents">
                        <div
                          style={{ justifyContent: "right", alignItems: "end" }}
                        >
                          <RiCloseCircleFill onClick={close} size={28} />
                        </div>
                        <h2>Add New Project </h2>
                        <div className='input-group'>
                        <label>
                           <strong>Sales Order:</strong> 
                         <input
                             type="text"
                             value={salesOrder}
                              onChange={(event) => setSalesOrder(event.target.value)}
                              />
                            </label>

                            <label>
                             <strong>Enter Project Name:</strong> 
                            <input
                              type="text"
                              value={projectName}
                              onChange={(event) => setProjectName(event.target.value)}
                            />
                            </label>
      
                            </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handlesave()}
                          >
                            SAVE
                          </button>
                          <button
                            type="button"
                            className="btn btn-dbtn btn-outline-danger"
                            onClick={() => handleclose()}
                          >
                            CLOSE
                          </button>

                        </div>
                      </div>
                    )}
                  </Popup> */}
                  </div>



                  <div><button> Manage Employees </button></div>
                  <div><button onClick={handleAddTaskClick}>Add Task</button></div>
                  <div><button onClick={handleAssignTaskClick}>Assign Task</button></div>
                  <div><button>Setting</button></div>
                </div>
              </div>
            )}
          </div>
          
           
           <div className='dropdown'>
          <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'}
               onClick={() => {
                handleProfileButtonClick('profile');
              }} 
               >
            {/* <img src={profile} className='icon_bg'></img> */}
            <FontAwesomeIcon icon={faCircleUser} size='2x' color='white'/>
            
            {showProfileDropdown && (
              <div className="dropdown-content">
                
                <div>
                  <div><button><FontAwesomeIcon icon={faUser} color='blue'/>&emsp; Profile</button></div>
                  <div onClick={handleLogout}><button><FontAwesomeIcon icon={faRightFromBracket}color='red' />&emsp; LogOut</button></div>
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