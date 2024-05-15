
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCircleUser, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate,Link } from 'react-router-dom';
import './Profile.css';


const Profile = () => {

    const [activeButton, setActiveButton] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const navigate = useNavigate();
    const [name, setName] = useState('hrishi');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('Mumbai'); // Default location
    const emailuse = "1"; // Define emailuse here or replace with your logic

    const handleSave = () => {
        // Handle form submission logic here
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Location:', location);
        // Add logic to handle password and confirm password if needed
      };
    const handleProfileButtonClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowSettingsDropdown(false);
        setShowMenuDropdown(true);
      };

      const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
        setShowSettingsDropdown(false);
        setShowMenuDropdown(false);
        setShowProfileDropdown(false);
    
        if (buttonName === 'home') {
          navigate('/task');
        }
      };
    
    
    const handleLogout = () => {
        navigate('/');
      };
      



      const background = isPopupVisible ? 'blurred-background' : '';
  return (

    //Navbar 
    <div>
   
      <div className='profile_bg'>
        <div className='title'>
          <h4 style={{ fontSize: '24px', color: '#f8f9fc', textDecoration: 'none' }}>
            My Profile
          </h4>
        </div>
    
            <div className='dropdown'>
            <button className={activeButton === 'home' ? 'home_bg active' : 'home_bg'} onClick={() => handleButtonClick('home')}>
        <FontAwesomeIcon icon={faHouse} style={{fontSize:'1.6rem'}} color='white' />
            </button>
            <button className={activeButton === 'profile' ? 'home_bg active' : 'home_bg'} onClick={() => { handleProfileButtonClick('profile'); }}>
                <FontAwesomeIcon icon={faCircleUser} style={{fontSize:'1.7rem'}} color='white' />
                {showProfileDropdown && (
                  <div className="dropdown-content">
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
          
        {/* close Navbar  */}

        <div className="container-fluid mt-5">
      <div className="row">
        <div className="col col-md-6 offset-md-3">
          <div className="card shadow">
            <div className="card-body card-block">
              <div >
                <label htmlFor="name" className="form-control-label text-dark">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {/* Validation message */}
                <small className="form-text text-danger Empnamemsg" id="Empnamemsgname" style={{ display: 'none' }}></small>
              </div>
              <div className="profile-for-memail mt-2" >
                <label htmlFor="Email" className="form-control-label text-dark">Email</label>
                <input
                  type="email"
                  id="Email"
                  placeholder="Abc@protocev.com"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {/* Validation message */}
                <small className="form-text text-danger Empnamemsg" id="EmpnamemsgEmail" style={{ display: 'none' }}></small>
              </div>
              {/* Conditionally render password fields based on emailuse */}
              {emailuse !== "1" && (
                <>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword" className="form-control-label text-dark">Password</label>
                    <div className="input-group">
                      <input
                        type="password"
                        className="form-control form-control-user"
                        id="exampleInputPassword"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="input-group-prepend">
                        <span className="input-group-text" id="showeye">
                          <i className="fa fa-eye"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <small className="form-text text-danger Empnamemsg" id="Empnamemsgpass" style={{ display: 'none' }}></small>
                  <div className="form-group">
                    <label htmlFor="exampleRepeatPassword" className="form-control-label text-dark">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control form-control-user"
                      id="exampleRepeatPassword"
                      placeholder="Repeat Password"
                      value={password} // Ensure to update this with confirm password state
                      onChange={(e) => setPassword(e.target.value)} // Update state accordingly
                    />
                  </div>
                  <small className="form-text text-danger Empnamemsg" id="Empnamemsgcpass" style={{ display: 'none' }}></small>
                </>
              )}
              <div className="profile-location mt-3">
                {/* <label htmlFor="dropLocation" className="form-control-label text-dark">Location</label> */}
                <select
                  className="form-select border border-primary rounded p-1"
                  aria-label="Default select example"
                  id="dropLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Ratnagiri">Ratnagiri</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" id="save" className="btn btn-success" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Profile
