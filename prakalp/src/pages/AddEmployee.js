import React, { useState } from 'react';
import axios from 'axios';
import '../cssfiles/AddEmployee.css'; // Import your CSS file

const AddEmployee = ({ isPopupVisible }) => {

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: '',
  });

  const [useEmail, setUseEmail] = useState(false); // State to track whether email is used for login
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailAlert, setShowEmailAlert] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'email' && /[A-Z]/.test(value)) {
      // Show alert if the email contains capital letters
      setShowEmailAlert(true);
    } else {
      setShowEmailAlert(false);
    }
    setFormData({ ...formData, [id]: value });
  };

  const handleAddEmployee = () => {
    // const { name, nickname, email, password, confirmPassword, role, location } = formData;
    
    const name = document.getElementById('name').value;
  const nickname = document.getElementById('nickname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.getElementById('selectRole').value; // Extract role value
  const location = document.getElementById('selectLocation').value; // Extract location value
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // All fields are filled and validated, make the API call
    axios.post('http://localhost:3001/addEmployee', {
      name,
      nickname,
      email,
      useEmail,
      password,
      confirmPassword,
      role,
      location,
    })
      .then(response => {
        console.log(response.data);
        window.location.reload();
      })
      .catch(error => {
        console.error('Error adding employee:', error);
        // Handle error (e.g., show an error message)
      });
      window.alert('Employee added successfully');
  };

  const handleUseEmailChange = (e) => {
    setUseEmail(e.target.checked); // Update useEmail state when checkbox is toggled
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isValidEmail = (email) => {
    // Regular expression for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const backgroundClass = isPopupVisible ? 'blurred-background' : '';

  return (
    <div className={`edit-employee-container ${backgroundClass}`}>
      <div className='add-emp-title'>
        <h1>Add Employee</h1>
      </div>
      <div className='flex_container'>
        <div className='flex_container1'>
          <label>Name :</label>
          <input type="text" id="name" className='in' value={formData.name} onChange={handleInputChange} />
          {errors.name && <span className="error-message">{errors.name}</span>}

          <label>Nickname :</label>
          <input type="text" id="nickname" className='in' value={formData.nickname} onChange={handleInputChange} />
          {errors.nickname && <span className="error-message">{errors.nickname}</span>}

          <label>Email :</label>
          <input type="text" id="email" className='in' value={formData.email} onChange={handleInputChange} />
          {errors.email && <span className="error-message">{errors.email}</span>}
          {showEmailAlert && <span className="alert">Email should be in lowercase letters</span>}

          <label>Password :</label>
<input type={isPasswordVisible ? 'text' : 'password'} id="password" className='pass-in' value={formData.password} onChange={handleInputChange} />
<span className="visibility-icon" onClick={togglePasswordVisibility}>
  {isPasswordVisible ? '👁️' : '👁️'}
</span>
{errors.password && <span className="error-message">{errors.password}</span>}


          <label>Confirm Password :</label>
          <input type="password" id="confirmPassword" className='pass-in' value={formData.confirmPassword} onChange={handleInputChange} />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
        <div className='flex_container2'>
          <label>Role :</label>
          <div className='role-align'>
            <select id="selectRole" className='selectemp'>
              {/* Populate this dropdown with employee names from your data source */}
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <label>Location :</label>
          <div className='location_align'>
            <select id="selectLocation" className='selectlocation'>
              {/* Populate this dropdown with employee locations from your data source */}
              <option value="">Select Location</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Ratnagiri">Ratnagiri</option>
            </select>
          </div>
        </div>
      </div>
      <div className='align'>
        <button className='add-emp-btn' onClick={handleAddEmployee}>Add Employee</button>
      </div>
    </div>
  );
};

export default AddEmployee;