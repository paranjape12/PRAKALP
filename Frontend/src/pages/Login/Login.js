import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeIcon from "../../assets/images/eye.svg";
import eyeIconSlash from "../../assets/images/eye-slash.svg";
import googleIcon from "../../assets/images/google.svg";
import axios from "axios";
import { Buffer } from "buffer";
import "./Login.css";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [urlEmail, setUrlEmail] = useState(''); // New state for email from URL
  const navigate = useNavigate();

  // Extract email from URL when the component mounts
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    // Fetch the 'email' query param from the URL
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email'); // Get 'email' from the URL query params

    if (emailFromUrl) {
      setUrlEmail(emailFromUrl); // Store the email from the URL in state
    }

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(Buffer.from(savedPassword, 'base64').toString('utf-8'));
      setRememberMe(savedRememberMe);
    }
  }, []);

  useEffect(() => {
    if (urlEmail) {
      // Simulate Google login with the email set from URL
      handleGoogleLoginSuccess();
    }
  }, [urlEmail]);

  const saveCredentials = () => {
    if (rememberMe) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', Buffer.from(password).toString('base64'));
      localStorage.setItem('rememberMe', 'true');
    }
  };

  const generateToken = (userData) => {
    const userDataString = JSON.stringify(userData);
    const token = Buffer.from(userDataString).toString('base64');
    localStorage.setItem('token', token);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toast.error('Please enter all credentials');
        return;
      }

      const emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!emailRegex.test(email)) {
        toast.error('Email format mismatch. Please enter a valid email address');
        return;
      }

      if (!passRegex.test(password)) {
        toast.error(`Password format mismatch. 
          Please enter a valid password with the following criteria:
          1. At least one capital letter.
          2. Must contain a special character (@, $, !, &, etc).
          3. Password length must be at least 8 characters.`);
        return;
      }

      // Encode password to base64
      const encodedPassword = Buffer.from(password).toString('base64');

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/getLogin`, {
        email,
        pass: encodedPassword, // Send the encoded password to the backend
        rememberMe: rememberMe.toString() // Convert rememberMe boolean to string
      });

      // Handle responses
      if (response.data.message === 'Success') {
        const userData = response.data.result;

        // Extract projsorting values from userData
        const projsorting = userData[0].projsorting.split(' ').map(Number); // Assuming it is space-separated numbers
        const projsorting2 = userData[0].projsorting2.split(' ').map(Number);
        const projsorting_pv = userData[0].projsorting_pv.split(' ').map(Number);

        // Create the filterState object
        const filterState = {
          pv: projsorting,
          ev: projsorting_pv,  // Assuming "ev" uses the same as "projsorting"
          pv2: projsorting2,
        };

        // Save filterState in localStorage
        localStorage.setItem('filterState', JSON.stringify(filterState));

        if (userData[0].Type !== "Employee") {
          localStorage.setItem('filterStateAdmin', JSON.stringify(filterState));
        }

        // Generate and store token
        generateToken(userData);
        saveCredentials();

        toast.success('Login successful');
        navigate('/task');  // Use navigate instead of window.location
      } else if (response.data.message === 'This account is disabled') {
        toast.error('This account is disabled.');
      } else {
        toast.error('Please enter a valid email or password');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };


  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleGoogleLoginSuccess = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/googlelogin`, {
        params: {
          token: urlEmail, // Pass the extracted email
        },
      });
      if (response.data.message === 'Success') {
        const userData = response.data.result;

        // Extract projsorting values from userData
        const projsorting = userData[0].projsorting.split(' ').map(Number); // Assuming it is space-separated numbers
        const projsorting2 = userData[0].projsorting2.split(' ').map(Number);
        const projsorting_pv = userData[0].projsorting_pv.split(' ').map(Number);

        // Create the filterState object
        const filterState = {
          pv: projsorting,
          ev: projsorting_pv,  // Assuming "ev" uses the same as "projsorting"
          pv2: projsorting2,
        };

        // Save filterState in localStorage
        localStorage.setItem('filterState', JSON.stringify(filterState));

        if (userData[0].Type !== "Employee") {
          localStorage.setItem('filterStateAdmin', JSON.stringify(filterState));
        }

        // Generate and store token
        generateToken(userData);
        saveCredentials();

        toast.success('Login successful');
        navigate('/task');  
    } else {
      setMessage('Google Login failed');
    }
  } catch (error) {
    setMessage('Google Login failed: ' + error.response.data);
  }
};

const handleGoogleLoginFailure = () => {
  setMessage('Google Login failed');
};



return (
  <div id="login-body">
    <div className="container">
      <div
        className="modal fade"
        id="Errormsg"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm" role="document">
          <div className="modal-content p-1">
            <div className="modal-header p-1">
              <h6 className="text-danger m-0" id="Errormsgtext"></h6>
              <button
                className="close"
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
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-5 d-none d-lg-block bg-login-image"></div>
                <div className="col-lg-7">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-4">
                        {urlEmail ? `Hello ${urlEmail}!` : 'Hello World!'}
                      </h1>
                    </div>
                    <form className="user">
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
                            style={{ height: "3.1rem", paddingLeft: '1.5rem' }}
                          />
                          <div className="input-group-prepend">
                            <span
                              className="input-group-text"
                              id="showeye"
                              style={{
                                borderRadius: "0rem 10rem 10rem 0rem",
                                height: "3.1rem",
                                width: "43px",
                                cursor: "pointer"
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
                          style={{ width: '100%' }}
                          className="btn btn-primary btn-user"
                          onClick={handleLogin}
                          type="button" // Use type="button" to prevent form submission
                        >
                          <strong>Login</strong>
                        </button>
                      </div>
                      <hr />
                      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                      >

                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onFailure={handleGoogleLoginFailure}
                          className="google-login-button"
                        >
                          {/* <img
                            src={googleIcon}
                            alt="Google Icon"
                            style={{ width: "1.5rem", marginRight: "1rem" }}
                            className="googleIcon"
                          />
                          <i className="fab fa-google fa-fw"></i>{" "}
                          <strong>Login with Protovec Account.</strong> */}
                        </GoogleLogin>
                      </GoogleOAuthProvider>
                    </form>
                    {message && <p style={{ color: 'red' }}>{message}</p>}
                    <hr />
                    <div className="text-center">
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
  </div>
);
}

export default Login;