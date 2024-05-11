import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";
import eyeIconSlash from "../../assets/eye-slash.svg";
import googleIcon from "../../assets/google.svg";
import axios from "axios";
import "./Login.css"; // Make sure to import your CSS file
// import { Link } from 'react-router-dom';

function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage('Please enter all credentials');
        return;
      }

      const emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

      if (!emailRegex.test(email)) {
        setErrorMessage('Email format mismatch. Please enter a valid email address');
        return;
      }

      if (!passRegex.test(password)) {
        setErrorMessage(`Password format mismatch. 
          Please enter a valid password with the following criteria:
          1. At least one capital letter.
          2. Must contain a special character (@, $, !, &, etc).
          3. Password length must be at least 8 characters.`);
        return;
      }
      // Encode password to base64 using btoa function
      const encodedPassword = btoa(password);

      // Encode password to base64
      // const encodedPassword = Buffer.from(password).toString('base64');

      const response = await axios.post('http://localhost:3001/api/getLogin', {
        email,
        pass: encodedPassword, // Send the encoded password to the backend
        rememberMe: rememberMe.toString() // Convert rememberMe boolean to string
      });

      if (response.data === 'Success') {
        window.location = '/task2'; // Redirect to dashboard upon successful login
      } else {
        setErrorMessage('Please enter a valid email or password');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };





  // const handleCheckboxChange = () => {
  //   setIsChecked(!isChecked); // Define 'handleCheckboxChange' function
  // };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <body id="login-body">
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
                                style={{
                                  borderRadius: "0rem 10rem 10rem 0rem",
                                  height: "3.1rem",
                                  width: "43px",
                                }}
                                onClick={togglePasswordVisibility}
                              >
                                {passwordVisible ? (
                                  <img
                                    className="eyeIcon"
                                    src={eyeIcon}
                                    alt="Eye Icon"
                                  />
                                ) : (
                                  <img
                                    className="eyeIconSlash"
                                    src={eyeIconSlash}
                                    alt="Eye Slash Icon"
                                  />
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
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="customCheck"
                            >
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <div>
                          <button
                            id="loginbtn"
                            className="btn btn-primary btn-user"
                            onClick={handleLogin}
                            type="button" // Use type="button" to prevent form submission
                          >
                            <strong>Login</strong>
                          </button>
                          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        </div>
                        <hr />
                        <a
                          className="btn btn-danger btn-user"
                          // onClick={handleGoogleLogin}
                          href="#!" // Use href="#!" to prevent anchor link behavior
                        >
                          <img
                            src={googleIcon}
                            alt="Google Icon"
                            style={{ width: "1.5rem", marginRight: "1rem" }}
                            className="googleIcon"
                          />
                          <i className="fab fa-google fa-fw"></i>{" "}
                          <strong>Login with Protovec Account.</strong>
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
    </body>
  );
}

export default Login;
