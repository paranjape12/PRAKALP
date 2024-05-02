import React, { useState } from 'react';
import '../cssfiles/AddNewProject.css';

import axios from 'axios'; 

import arrow from '../assets/down-arrow.png'

const AddNewProject = ({onClose}) => {
  const [projectName, setProjectName] = useState('');
  const [salesName, setSalesName] = useState('');

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleProjectSaleChange = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, '');
    setSalesName(newValue.substring(0, 6));
  };
  
  const handleAddProject = () => {
    // Make a POST request to the server to add the project
    axios.post('http://localhost:3001/addProject', { projectName, salesName })
      .then((response) => {
        console.log(response.data);
        // Additional logic if needed
      })
      .catch((error) => {
        console.error('Error adding project:', error);
        // Handle error
      });
      window.alert('Project added successfully');
  };

  // const handleAddProject = async (projectId) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3001/tasksByProject/${projectId}`);
  //     const tasks = response.data;
  //     // Update the state or UI to display tasks
  //   } catch (error) {
  //     console.error('Error fetching tasks by project ID:', error);
  //     // Optionally, handle the error
  //   }
  // };

  return (
    <div className="card1">
      <form>
      <div className="card-header1">
        <button className="arrow-button1" onClick={onClose}><img src={arrow} /></button>
        <h2>Add New Project</h2>
      </div>
      <div className="card-body1">
        <div>
          <label>Sales Order</label>
          <input className='black-border'
            type="text"
            value={salesName}
            onChange={handleProjectSaleChange}
            placeholder="Enter Sales Order"
            maxLength={6}
            required
          />
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
      <div className="card-footer1">
        <button onClick={handleAddProject}>Add Project</button>
      </div>
      </form>
    </div>
  );
};

export default AddNewProject;