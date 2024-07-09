import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AggregateProjectCell from '../../components/EmployeeOverview/AggregateProjectCell';
import axios from 'axios';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus, faMinus,faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import {  MenuItem } from '@material-ui/core';

import '../../pages/TaskOverview/TaskOverview.css';
import EditEmployee from '../../components/Navbar/Dropdown/Manage Employee/EditEmployee';
import LogsPopup from '../../components/EmployeeOverview/LogsPopup';
import DeleteEmployeePopup from '../../components/EmployeeOverview/DeleteEmployeePopup';

function EmployeeOverview() {

  const getBackgroundColor = (proj_status) => {
    switch (proj_status) {
      case 1:
        return '#ADD8E6';
      case 2:
        return '#ffff00ad';
      case 3:
        return '#ff8d00b8';
      case 4:
        return '#04ff00b8';
      default:
        return '#FFFFFF';
    }
  };


  const seconds2dayhrmin = (ss) => {
    const s = ss % 60;
    const h = Math.floor((ss % 28800) / 3600); // 8 hours = 28,800 seconds
    const d = Math.floor((ss % 230400) / 28800); // 8 hours * 30 days = 230,400 seconds
    const m = Math.floor((ss % 3600) / 60);

    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;
    const formattedD = d < 10 ? '0' + d : d;

    return ` ${formattedD} : ${formattedH} : ${formattedM} `;
  };


  //Navbar

  const today = new Date();

  const daysOfWeek = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  const [expandedProjects, setExpandedProjects] = useState({});
  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startDateIndex + i));
      newDates.push({
        date: newDate,
        dateString: newDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);

  const handleExpandTasks = (projectId) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId],
    }));
  };

  const handleTodayClick = () => {
    setStartDateIndex(0);
  };

  const handleNextDayClick = () => {
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };


  //Table


  const toggleShowComplete = (e) => {
    e.stopPropagation();
    setShowComplete((prevShowComplete) => {
      const newValue = !prevShowComplete;
      // Store new value in localStorage
      localStorage.setItem('showCompletedTasks', JSON.stringify(newValue));
      return newValue;
    });
  };

  //tbody
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Fetch employees
    axios.post('http://localhost:3001/api/empDropdown', {
      token: localStorage.getItem('token'),
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error('Error: Expected an array but got', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
      });
  }, []);

  //table body project
  const [showComplete, setShowComplete] = useState(() => {
    // Get initial state from localStorage or set default value to true
    const storedValue = localStorage.getItem('showComplete');
    return storedValue ? JSON.parse(storedValue) : true;

  });

  const [showTimeComplete, setShowTimeComplete] = useState(true);
     //   const [expandedProjects, setExpandedProjects] = useState({});
   const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState(null);
   const [projects, setProjects] = useState([]);
   const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
   const [selectedProjectId, setSelectedProjectId] = useState(null);
   const [projectName, setProjectName] = useState(null);
   const [showTimeDetails, setShowTimeDetails] = useState(true);
   const [projectTimeDetails, setProjectTimeDetails] = useState({});
   const [editEmployeeOpen, setEditEmployeeOpen] = useState(false); 
   const [logsPopupOpen, setLogsPopupOpen] = useState(false); 
   const [deleteEmployee, setDeleteEmployeeOpen] = useState(false);


  useEffect(() => {
    const initialProjectTimeDetails = {};
    projects.forEach((project) => {
      initialProjectTimeDetails[project.projectId] = showTimeDetails;
    });
    setProjectTimeDetails(initialProjectTimeDetails);
  }, [projects, showTimeDetails]);



  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startDateIndex + i));
      newDates.push({
        date: newDate,
        dateString: newDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);



  // Modify the toggleShowTimeComplete function to toggle time details for a specific project
  const toggleShowTimeComplete = (projectId) => {
    setProjectTimeDetails((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId] || false,
    }));
  };


  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/taskOverview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: localStorage.getItem('token'),
          is_complete: showComplete ? '1' : '0'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showComplete]);

  // Fetch projects every 4 second to update colors
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchProjects();
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  function getTaskStatusColor(requiredTime, takenTime) {
    if (requiredTime < takenTime) {
      return 'bg-danger border border-danger';
    } else if (takenTime === 0) {
      return 'bg-warning border border-warning';
    } else {
      return 'bg-success border border-success';
    }
  }

  const handleOpenEditProjectDialog = (project) => {
    setSelectedProject({
      salesOrder: project.projectSalesOrder,
      projectName: project.projectName,
      projectStatus: project.proj_status,
      projectId: project.projectId,
    });
    setEditProjectDialogOpen(true);
  };

  const handleCloseEditProjectDialog = () => {
    setEditProjectDialogOpen(false);
    setSelectedProject(null);
  };

  const handleSaveEditProject = async (updatedProject) => {
    try {
      const response = await axios.post('http://localhost:3001/api/updateProject', {
        ProjectName: updatedProject.projectName,
        Projectid: updatedProject.projectId,
        projstatus: updatedProject.projectStatus,
        editprojmodalisalesval: updatedProject.salesOrder
      });

      if (response.data === 'Success') {
        // Update the projects state after saving
        setProjects((prevProjects) =>
          prevProjects.map((proj) =>
            proj.projectSalesOrder === updatedProject.salesOrder
              ? { ...proj, projectName: updatedProject.projectName, proj_status: updatedProject.projectStatus }
              : proj
          )
        );
      } else {
        console.error('Failed to update project:', response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOpenDeleteProjectDialog = (projectId, projectName) => {
    setSelectedProjectId(projectId);
    setDeleteProjectDialogOpen(true);
    setProjectName(projectName);
  };

  const handleCloseDeleteProjectDialog = () => {
    setSelectedProjectId(null);
    setDeleteProjectDialogOpen(false);
  };
//hrishi
  const handleOpenEditEmployeeDialog = () => {
    setEditEmployeeOpen(true);
  };

  const handleCloseEditEmployeeDialog = () => {
    setEditEmployeeOpen(false);
  };

  const handleOpenLogsDialog = () => {
    setLogsPopupOpen(true);
  };

  const handleCloseLogsDialog = () => {
    setLogsPopupOpen(false);
  };
  const handleOpenDeleteEmployeeDialog = () => {
    setDeleteEmployeeOpen(true);
  };

  const handleCloseDeleteEmployeeDialog = () => {
    setDeleteEmployeeOpen(false);
  };

 return (
    <>
      {dates.length > 0 && (
        <Navbar
          onTodayClick={handleTodayClick}
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
        />
      )}
      <table className="table table-bordered text-dark" width="100%" cellSpacing="0" style={{ marginTop: '38px', fontFamily: "Nunito" }}>
        <thead className="text-white" id="theader" style={{ fontSize: '13px' }}>
          <tr className="text-center small" style={{ position: 'sticky', top: '2.45rem', zIndex: '5' }}>
            <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white' }}>Employee Name</th>
            <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white' }}>Projects</th>
            <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ flexGrow: 1, textAlign: 'center' }}>Task Details</span>
                <div className="taskEye" style={{ position: 'absolute', right: '1rem' }}>
                  <FontAwesomeIcon
                    icon={showComplete ? faEye : faEyeSlash}
                    className="eyeicon"
                    style={{ cursor: 'pointer', color: 'white' }}
                    onClick={toggleShowComplete}
                  />
                </div>
              </div>
            </th>
            {dates.map((date, index) => {
              const currentDate = new Date(date.date);
              const isSunday = currentDate.getDay() === 0;
              return (
                <th
                  key={index}
                  className={isSunday ? 'th1th' : `th${date.day}`}
                  style={{ backgroundColor: isSunday ? 'red' : '', color: 'white' }}
                >
                  {currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}
                  <br />
                  [ {currentDate.toLocaleString('default', { weekday: 'short' })} ]
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="projectviewtbody">
        {employees.map((employee) => (
            <tr className="text-center small">
              <td className="p-2">
                <div>
                  <FontAwesomeIcon icon={faPlus} className="text-primary" style={{ float: 'left', cursor: 'pointer', paddingTop: '0.2rem' , paddingLeft:'0.7rem' }} />
                  
                  <FontAwesomeIcon icon={faTrashAlt} className="text-danger" style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight: '0.5rem' }} onClick={handleOpenDeleteEmployeeDialog } />
                  <FontAwesomeIcon icon={faPencilAlt} className="text-primary" style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight: '0.5rem' }} onClick={handleOpenEditEmployeeDialog}/>
                  <FontAwesomeIcon icon={faCircleInfo} className="text-primary" style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight:'0.5rem' }} onClick={handleOpenLogsDialog}/>
                  <br />
                  <div id="selempdrop" label="Select Employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                    
                  <span key={employee.id} value={employee.Name} style={{ fontSize: '14px' }}>
                      {employee.Name}
                    </span>
                  </div>
                </div>
                </td>
              <td>
              <AggregateProjectCell employee={employee}/>
              </td>
              <td>Task dtls</td>
              <td>Day 1</td>
              <td>Day 2</td>
              <td>Day 3</td>
              <td>Day 4</td>
              <td>Day 5</td>
              <td>Day 6</td>
              <td>Day 7</td>
              </tr>
               ))}
        </tbody>
        </table>
        {editEmployeeOpen && (
            <EditEmployee
              openEditDialog={editEmployeeOpen}
              handleClose={handleCloseEditEmployeeDialog}
            />
          )}
          {logsPopupOpen && (
            <LogsPopup
              open={logsPopupOpen}
              handleClose={handleCloseLogsDialog}
            />
          )}
      <Footer />
      </>
  )
}

export default EmployeeOverview
