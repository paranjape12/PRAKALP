import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import eyeIcon from '../assets/eye.svg';
import eyeIconSlash from '../assets/eye-slash.svg';
import axios from "axios";
import "../cssfiles/Login.css"; // Make sure to import your CSS file
// import { Link } from 'react-router-dom';

function Login({ }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Define 'handleCheckboxChange' function
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  //   const loginUrl ="";
  //   const handleGoogleLogin = () => {
  //     // Redirect to the specified login URL when the button is clicked
  //     window.location.href = loginUrl;
  // };

  // const handleLoginClick = () => {

  //   if (username === 'admin' && password === '1234') {
  //     // Perform login success logic
  //     onLoginSuccess();
  //     // Navigate to a different route

  //   } else {
  //     setError('Invalid username or password');
  //   }

  // };

  const handleLoginClick = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const response = await axios.post("http://localhost:3001/getLogin", {
        name: username,
        password,
      });

      if (response.data.success) {
        // Login successful, redirect to homepage or any other route
        onLoginSuccess();
      } else {
        setError(response.data.message || "An error occurred during login");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    }
  };

  const onLoginSuccess = () => {
    navigate("/");
  };

  return (
    //     <div className="login-box">
    //       <h2>Login</h2>
    //       <form>
    //         <div className="user-box">
    //           <input
    //             type="text"
    //             name="username"
    //             value={username}
    //             onChange={(e) => setUsername(e.target.value)}
    //             required
    //           />
    //           <label className={username ? 'active' : ''}>User Name</label>
    //         </div>
    //         <div className="user-box">
    //           <input
    //             type="password"
    //             name="password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             required
    //           />
    //           <label className={password ? 'active' : ''}>Password</label>
    //                   {/* Visibility toggle icon */}
    //                   {/* <span className="visibility-icon" onClick={togglePasswordVisibility}>
    //                       {showPassword ? '👁️' : '🙈'}
    //                   </span> */}

    //         </div>
    //         <button className='btn' onClick={handleLoginClick} type="submit">
    //         Submit
    //       </button>
    //         {error && <p style={{ color: 'red' }}>{error}</p>}
    //       </form>
    //     </div>
    //   );
    // }

    <div class="container">
      <div
        class="modal fade"
        id="Errormsg"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-sm" role="document">
          <div class="modal-content  p-1">
            <div class="modal-header p-1">
              <h6 class="text-danger m-0" id="Errormsgtext"></h6>
              <button
                class="close"
                type="button"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-xl-10 col-lg-12 col-md-9">
          <div class="card o-hidden border-0 shadow-lg my-5">
            <div class="card-body p-0">
              {/* Nested Row within Card Body  */}
              <div class="row">
                <div class="col-lg-5 d-none d-lg-block bg-login-image"></div>
                <div class="col-lg-7">
                  <div class="p-5">
                    <div class="text-center">
                      <h1 class="h4 text-gray-900 mb-4">Welcome Back!</h1>
                    </div>
                    <form class="user">
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control form-control-user"
                          id="exampleInputEmail"
                          aria-describedby="emailHelp"
                          placeholder="Enter Email Address..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <div className="input-group flex-nowrap">
                          <input
                            type={passwordVisible ? "text" : "password"} // Toggle input type based on showPassword state
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />

                          <div className="input-group-prepend">
                            <span
                              className="input-group-text"
                              id="showeye"
                              style={{ borderRadius: '0rem 10rem 10rem 0rem', height: '2.4rem', width: '43px' }}
                              onClick={togglePasswordVisibility}
                            >
                              {passwordVisible ? (
                                <img className="eyeIcon" src={eyeIcon} alt="Eye Icon" />
                              ) : (
                                <img className="eyeIconSlash" src={eyeIconSlash} alt="Eye Slash Icon" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="custom-control custom-checkbox small">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="customCheck"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="customCheck"
                          >
                            Remember Me
                          </label>
                        </div>
                      </div>

                      {/* <link id="loginbtn" class="btn btn-primary btn-user btn-block">
                                            Login
                      </link> */}

                      <button
                        id="loginbtn"
                        className="btn btn-outline-primary btn-user"
                        onClick={handleLoginClick}
                        type="button" // Use type="button" to prevent form submission
                      ><strong>
                          Login
                        </strong>

                      </button>

                      <hr />
                      <a
                        className="btn btn-outline-danger btn-user"
                        // onClick={handleGoogleLogin}
                        href="#!" // Use href="#!" to prevent anchor link behavior
                      >
                        <i className="fab fa-google fa-fw"></i> <strong>Login with Protovec Account.</strong>
                      </a>
                    </form>

                    {/* <div className="text-center">
                              <Link to="/forgot-password" className="small">Forgot Password?</Link>
                          </div> */}
                    <hr />
                    <div class="text-center">
                      <Link to="/register" className="small">
                        <h6>Create an Account!</h6>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
