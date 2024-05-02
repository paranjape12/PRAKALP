import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import arrow from '../assets/down-arrow.png';
import '../cssfiles/AssignTask.css';

const AssignTaskCard = ({ onClose }) => {
  const [employee, setEmployee] = useState('');
  const [project, setProject] = useState('');
  const [taskData, setTaskData] = useState({
    employee: '',
    project: '',
    date: '',
    activityName: '',
  });
  const [projectNames, setProjectNames] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);

  useEffect(() => {
    fetchProjectNames();
    fetchEmployeeNames();
  }, []);

  const fetchProjectNames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getProjectNames');
      setProjectNames(response.data);
    } catch (error) {
      console.error('Error fetching project names:', error);
    }
  };

  const fetchEmployeeNames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getEmployeeNames');
      setEmployeeNames(response.data);
    } catch (error) {
      console.error('Error fetching employee names:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTaskData({ ...taskData, [name]: value });
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   try {
  //     const formattedDate = moment(taskData.date).format('YYYY-MM-DD');

  //     const formattedTaskData = {
  //       employee: taskData.employee,
  //       project: taskData.project,
  //       date: formattedDate,
  //       activityName: taskData.activityName,
  //     };

  //     const response = await axios.post('http://localhost:3001/assignTasks', formattedTaskData);
  //     console.log('Task added successfully:', response.data);
  //   } catch (error) {
  //     console.error('Error adding task:', error);
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formattedDate = moment(taskData.date).format('YYYY-MM-DD');
  
      const formattedTaskData = {
        employee: taskData.employee,
        project: taskData.project,
        taskName: taskData.activityName, // Assuming 'activityName' is equivalent to 'taskName'
        timeRequired: 0, // Assuming initial time required is 0, modify as per requirement
        description: '', // Add description field if necessary
        isLastTask: false, // Add isLastTask field if necessary
        date: formattedDate,
      };
  
      const response = await axios.post('http://localhost:3001/assignTask', formattedTaskData);
      console.log('Task assigned successfully:', response.data);
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };
  

  return (
    <div className="card3">
      <div className='card-header3'>
        <button className="arrow-button3" onClick={onClose}><img src={arrow} alt="Arrow" /></button>
        <h2>Assign Task</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employee">Select Employee:</label>
          <select
            id="employee"
            name="employee"
            value={taskData.employee}
            onChange={handleChange}
            required
          >
            <option value="">Select Employee</option>
            {employeeNames.map((employeeName, index) => (
              <option key={index} value={employeeName}>
                {employeeName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="project">Select Project:</label>
          <select
            id="project"
            name="project"
            value={taskData.project}
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>
            {projectNames.map((projectName, index) => (
              <option key={index} value={projectName}>
                {projectName}
              </option>
            ))}
          </select>
        </div>
        <h3>Task Details</h3>
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={taskData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="activityName">Activity Name:</label>
          <textarea
            id="activityName"
            name="activityName"
            value={taskData.activityName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="card-footer3">
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskCard;
