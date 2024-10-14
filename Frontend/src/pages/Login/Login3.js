import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeIcon from "../../assets/images/eye.svg";
import eyeIconSlash from "../../assets/images/eye-slash.svg";
import googleIcon from "../../assets/images/google.svg";
import axios from "axios";
import { Buffer } from "buffer";
import "./Login2.css";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

function Login3() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [urlEmail, setUrlEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    // Fetch the 'email' query param from the URL
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('token'); // Get 'email' from the URL query params

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

  const handleGoogleLoginSuccess = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/AES256CBClogin`, {
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
      toast.error('Google Login failed');
    }
  } catch (error) {
    toast.error('Google Login failed: ' + error.response.data);
  }
};

const handleGoogleLoginFailure = () => {
  toast.error('Google Login failed');
};



return (
  <div id="login2-body">
    <div id="gradient-text">Connecting to Prakalp...</div>
  </div>
);
}

export default Login3;