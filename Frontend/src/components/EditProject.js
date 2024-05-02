import React, { useState } from 'react';
import '../cssfiles/EditProject.css';
import axios from 'axios';
import arrow from '../assets/down-arrow.png';

const EditProject = ({ onClose, projectData, updateProjectList }) => {
  const [projectName, setProjectName] = useState(projectData ? projectData.projectName : '');
  const [salesName, setSalesName] = useState(projectData ? projectData.salesName : '');
  const [salesNameError, setSalesNameError] = useState('');

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleProjectSaleChange = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, '');
    if (event.target.value !== newValue) {
        setSalesNameError('Please enter numbers only.'); // Display error message
      } else {
        setSalesNameError(''); // Clear error message if input is valid
        setSalesName(newValue.substring(0, 6));
      }
    };

  const handleEditProject = () => {
    
    axios.put(`http://localhost:3001/updateProject/${projectData.id_p}`, { projectName, salesName })
      .then((response) => {
        console.log(response.data);
        updateProjectList(); // Update project list after editing
        onClose(); // Close the EditProject component
      })
      .catch((error) => {
        console.error('Error editing project:', error);
      });
      window.alert('Project updated successfully');
  };

  return (
    <div className="card2">
      <form>
        <div className="card-header2">
          <button className="arrow-button2" onClick={onClose}><img src={arrow} alt="Arrow" /></button>
          <h2>Edit Project</h2>
        </div>
        <div className="card-body2">
          <div>
            <label>Sales Order</label>
            <input
              type="text"
              value={salesName}
              onChange={handleProjectSaleChange}
              placeholder="Enter Sales Order"
              maxLength={6}
              required
            />
             {salesNameError && <div className="error-message">{salesNameError}</div>} {/* Render error message */}
          </div>
          <div>
            <label>Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={handleProjectNameChange}
              placeholder="Enter Project Name"
              maxLength={50}
              required
            />
          </div>
        </div>
        <div className="card-footer2">
          <button onClick={handleEditProject}>Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
