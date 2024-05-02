import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../cssfiles/AddEmployee.css'; // Import your CSS file

const EditEmployee = ({ isPopupVisible}) => {
  const { employeeId } = useParams(); // Access the employeeId from URL params

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    use_email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [showEmailAlert, setShowEmailAlert] = useState(false);

  // useEffect(() => {
  //   // Fetch employee data based on employeeId
  //   axios.put(`http://localhost:3001/updateEmployee/${employeeId}`)
  //     .then(response => {
  //       const { name, nickname, email,use_email, role, location, password, confirm_password } = response.data;
  //       setFormData({
  //         name,
  //         nickname,
  //         email,
  //         use_email,
  //         role,
  //         location,
  //         password: '', // Reset password fields
  //         confirmPassword: '', // Reset confirmPassword fields
  //       });
  //     })
  //     .catch(error => {
  //       console.error('Error fetching employee data:', error);
  //     });
  // }, [employeeId]);

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

  const handleUpdateEmployee = () => {

    
    // Validate form fields
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);

    // If there are errors, do not proceed with the update
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // If no errors, make the API call to update the employee
    axios.put(`http://localhost:3001/updateEmployee/${employeeId}`, formData)
      .then(response => {
        // Handle success (e.g., show success message)
        console.log(response.data);
      
      })
      .catch(error => {
        console.error('Error updating employee:', error);
        // Handle error (e.g., show error message)
      });
      window.alert('Employee updated successfully');
  };

  const togglePasswordVisibility = () => {
    setFormData({ ...formData, isPasswordVisible: !formData.isPasswordVisible });
  };

  const isValidEmail = (email) => {
    // Regular expression for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className={`edit-employee-container ${isPopupVisible ? 'blurred-background' : ''}`}>
      <div className='add-emp-title'>
        <h1>Edit Employee</h1>
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
          <input type={formData.isPasswordVisible ? 'text' : 'password'} id="password" className='pass-in' value={formData.password} onChange={handleInputChange} />
          <span className="visibility-icon" onClick={togglePasswordVisibility}>
            {formData.isPasswordVisible ? '👁️' : '👁️'}
          </span>
          {errors.password && <span className="error-message">{errors.password}</span>}

          <label>Confirm Password :</label>
          <input type="password" id="confirmPassword" className='pass-in' value={formData.confirmPassword} onChange={handleInputChange} />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
        <div className='flex_container2'>
          <label>Role :</label>
          <div className='role-align'>
            <select id="role" className='selectemp' value={formData.role} onChange={handleInputChange}>
              {/* Populate this dropdown with employee names from your data source */}
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <label>Location :</label>
          <div className='location_align'>
            <select id="location" className='selectlocation' value={formData.location} onChange={handleInputChange}>
              {/* Populate this dropdown with employee locations from your data source */}
              <option value="">Select Location</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Ratnagiri">Ratnagiri</option>
            </select>
          </div>
        </div>
      </div>
      <div className='align'>
        <button className='add-emp-btn' onClick={handleUpdateEmployee}>Update Employee</button>
      </div>
    </div>
  );
};

export default EditEmployee;
