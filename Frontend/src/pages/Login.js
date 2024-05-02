import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import axios from 'axios';
import '../cssfiles/Login.css'; // Make sure to import your CSS file

function Login({  }) {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
  
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
        const response = await axios.post('http://localhost:3001/getLogin', { name: username, password });
    
        if (response.data.success) {
          // Login successful, redirect to homepage or any other route
          onLoginSuccess();
        } else {
          setError(response.data.message || 'An error occurred during login');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('An error occurred during login');
      }
    };
    

    const onLoginSuccess = () => {
      navigate('/');
    };

    const togglePasswordVisibility = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword); // Toggle the state to show/hide password
  };
  

    return (
      <div className="login-box">
        <h2>Login</h2>
        <form>
          <div className="user-box">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className={username ? 'active' : ''}>User Name</label>
          </div>
          <div className="user-box">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className={password ? 'active' : ''}>Password</label>
                    {/* Visibility toggle icon */}
                    {/* <span className="visibility-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? '👁️' : '🙈'}
                    </span> */}
            
          </div>
          <button className='btn' onClick={handleLoginClick} type="submit">
          Submit
        </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    );
  }

export default Login;