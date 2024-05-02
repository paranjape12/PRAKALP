import React, { useState, useEffect } from 'react';
import '../cssfiles/AddTask.css'
import arrow from '../assets/down-arrow.png'

import axios from 'axios'; 

import moment from 'moment'; // Include moment.js

const AddTask = ({onClose}) => {

  const [employee, setEmployee] = useState('');
  const [project, setProject] = useState();
  const [taskName, setTaskName] = useState();
  const [timeRequired, setTimeRequired] = useState();
  const [description, setDescription] = useState();
  const [isLastTask, setIsLastTask] = useState();
  const [date, setDate] = useState();
  const [hoursRequired, setHoursRequired] = useState();
  const [minutesRequired, setMinutesRequired] = useState();

  // const handleProjectChange = (event) => {
  //   setProject(event.target.value);
  // };

  // const handleTaskNameChange = (event) => {
  //   setTaskName(event.target.value);
  // };

  // const handleTimeRequiredChange = (event) => {
  //   setTimeRequired(event.target.value);
  // };

  // const handleDescriptionChange = (event) => {
  //   setDescription(event.target.value);
  // };

  // const handleDateChange = (event) => {
  //   const formattedDate = moment(task.date).format('YYYY-MM-DD');
  //   setDate(event.target.value);
  // };

  // const handleIsLastTaskChange = (event) => {
  //   setIsLastTask(event.target.checked);
  // };

  // const handleHoursRequiredChange = (event) => {
  //   setHoursRequired(event.target.value);
  // };

  // const handleMinutesRequiredChange = (event) => {
  //   setMinutesRequired(event.target.value);
  // };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // For checkboxes, handle the checked state separately
    if (type === 'checkbox') {
      setIsLastTask(checked);
    } else {
      switch (name) {
        case 'employee':
          setEmployee(value);
          break;
        case 'project':
          setProject(value);
          break;
        case 'taskName':
          setTaskName(value);
          break;
        case 'timeRequired':
          setTimeRequired(value);
          break;
        case 'description':
          setDescription(value);
          break;
        case 'date':
          setDate(value);
          break;
        case 'hoursRequired':
          setHoursRequired(value);
          break;
        case 'minutesRequired':
          setMinutesRequired(value);
          break;
        default:
          break;
      }
    }
  };

  
  // const [taskData, setTaskData] = useState({
  //   employee: '',
  //   project: '',
  //   taskName: '',
  //   timeRequired: '',
  //   description: '',
  //   isLastTask: '',
  //   date: '',
  //   hoursRequired: '',
  //   minutesRequired: '',
  // });

  
  const [projectNames, setProjectNames] = useState([]); // State to store project names

  useEffect(() => {
    fetchProjectNames(); // Fetch project names when component mounts
  }, []);

  const fetchProjectNames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getProjectNames');
      setProjectNames(response.data); // Set project names in state
    } catch (error) {
      console.error('Error fetching project names:', error);
    }
  };

  const [employeeNames, setEmployeeNames] = useState([]); // State to store employee names


  useEffect(() => {
    fetchEmployeeNames(); // Fetch employee names when component mounts
  }, []);

  const fetchEmployeeNames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getEmployeeNames');
      setEmployeeNames(response.data); // Set employee names in state
    } catch (error) {
      console.error('Error fetching employee names:', error);
    }
  };

  // const handleChange = (event) => {
  //   setTaskData({ ...taskData, [event.target.name]: event.target.value });
  // };


  const handleAddTask = async () => {
    try {
      // Format the date in YYYY-MM-DD format (optional)
      const formattedDate = moment(date).format('YYYY-MM-DD');

      // Combine hours and minutes into a single string (optional)
      const formattedTimeRequired = `${hoursRequired.padStart(2, '0')}:${minutesRequired.padStart(2, '0')}`;

      const formattedTaskData = {
        employee,
        project,
        taskName,
        timeRequired: formattedTimeRequired,
        description,
        isLastTask,
        date: formattedDate,
      };

      // Send the task data directly in the request body
      const response = await axios.post('http://localhost:3001/addTasks', formattedTaskData);
      console.log('Task added successfully:', response.data);
      // Optionally, handle success or navigate to another page
    } catch (error) {
      console.error('Error adding task:', error);
      // Optionally, display error message to the user
    }
    window.alert('Task added successfully');
  };



  return (
    <div className="card2">
      <form>
      <div className='card-header2'>
      <button className="arrow-button2" onClick={onClose}><img src={arrow} /></button>
      <h2>Add Task</h2>
      </div>
        <div className="form-group">
          <label htmlFor="employee">Select Employee:</label>
          <select 
          id="employee" 
          name="employee" 
          value={employee} 
          onChange={handleChange}
          required
          >
  <option value="">Select Employee</option>
          {/* Populate dropdown with employee names */}
          {employeeNames.map((employeeName, index) => (
            <option key={index} value={employeeName}>
              {employeeName}
            </option>
          ))}
</select>

        </div>
        <div className="form-group">
          <label htmlFor="project">Select Project:</label>
          <select id="project" name="project" value={project} onChange={handleChange} required>
          <option value="">Select Project</option>
          {/* Populate dropdown with project names */}
          {projectNames.map((projectName, index) => (
            <option key={index} value={projectName}>
              {projectName}
            </option>
          ))}

          </select>
        </div>
        <div className="form-group">
          <label htmlFor="taskName">Task Name:</label>
          <input
            type="text"
            id="taskName"
            name="taskName"
            value={taskName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
      <label>Time Required:</label>
      <div className="time-inputs">
        <input
          type="number"
          id="hoursRequired"
          name="hoursRequired"
          value={hoursRequired}
          onChange={handleChange}
          min="0"
          max="8"
          maxLength={2}
          required
        />
        <label htmlFor="hoursRequired">Hours</label>

        <input
          type="number"
          id="minutesRequired"
          name="minutesRequired"
          value={minutesRequired}
          onChange={handleChange}
          min="0"
          max="59"
          maxLength={2}
         
        />
        <label htmlFor="minutesRequired">Minutes</label>
      </div>
    </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <div className='last-task'>
          <label htmlFor="isLastTask">Mark as Last Task:</label>
          <input
            type="checkbox"
            value={isLastTask}
            id="isLastTask"
            name="isLastTask"
            checked={isLastTask}
            onChange={handleChange}
          />
        </div>
        </div>
        <div className="card-footer2">
        <button type="submit" onClick={handleAddTask}>Add Task</button>
        </div>
        </form>
    </div>
  );
};

export default AddTask;
