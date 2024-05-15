import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../cssfiles/EmployeePage.css';
import editbtn from '../assets/edit-text.png';
import deletebtn from '../assets/delete.png';
import Navbar from '../components/Navbar/Navbar';
import AddNewProject from '../components/Navbar/Dropdown/Add Project/AddNewProject';
import AddTask from '../components/Navbar/Dropdown/Add Task/AddTask';
import AssignTask from '../components/Navbar/Dropdown/Assign Task/AssignTask';
import EditEmployee from '../components/Navbar/Dropdown/Manage Employee/EditEmployee';   // Import the EditEmployee component

function EmployeePage({ isPopupVisible}) {
  const [employeeNames, setEmployeeNames] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employeeData, setEmployeeData] = useState(null); // State to store employee data for editing
  const navigate = useNavigate();
  const backgroundClass = isPopupVisible ? 'blurred-background' : '';
  const [selectedProjectName, setSelectedProjectName] = useState(null);


  // Navbar//
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAddProjectClick = () => {
    setShowAddProject(true);
    setShowAddTask(false);
    setShowAssignTask(false);
  };

  const handleCloseAddProject = () => {
    setShowAddProject(false);
    setShowAddTask(false);
    setShowAssignTask(false);
  };

  const handleAddTaskClick = () => {
    setShowAddTask(true);
    setShowAddProject(false);
    setShowAssignTask(false);
  };

  const handleCloseTaskProject = () => {
    setShowAddTask(false);
    setShowAddProject(false);
    setShowAssignTask(false);
  };

  const handleAssignTaskClick = () => {
    setShowAssignTask(true);
    setShowAddProject(false);
    setShowAddTask(false);
  };

  const handleCloseAssignTaskProject = () => {
    setShowAssignTask(false);
    setShowAddTask(false);
    setShowAddProject(false);
  };


  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    const startIndex = startDateIndex; // Start index for the new dates array
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startIndex + i)); // Adjusted date calculation
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

  const handleNextDayClick = () => {
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };

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
  useEffect(() => {
    // Fetch employee names from the server
    axios.get('http://localhost:3001/getEmployeeNames')
      .then(response => {
        setEmployeeNames(response.data);
      })
      .catch(error => {
        console.error('Error fetching employee names:', error);
      });
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  const handleAddEmpClick = () => {
    // Navigate to the edit-employee route
    navigate('/edit-employee');
  };

  // const handleEditEmployeeClick = (employeeId) => {
  //   console.log('Clicked on edit button for employeeId:', employeeId);
  //   // Fetch employee data based on employeeId for editing
  //   axios.get(`http://localhost:3001/getEmployee/${employeeId}`)
  //     .then(response => {
  //       setEmployeeData(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching employee data for editing:', error);
  //     });
  // };


  const handleEditEmployeeClick = (employeeId) => {
    console.log('Clicked on edit button for employeeId:', employeeId);
    // Redirect to the EditEmployee page
    navigate(`/edit-employee`);
  };

// Function to fetch project lists based on employee ID
// Function to fetch project names based on employee ID

const fetchProjectsByEmployee = (employeeId) => {
  axios.get(`http://localhost:3001/getProjectsByEmployee/${employeeId}`)
    .then(response => {
      setProjects(response.data);
    })
    .catch(error => {
      console.error('Error fetching project names:', error);
    });
};



  // Fetch project lists when employeeData changes
  useEffect(() => {
    if (employeeData && employeeData.id_e) {
      fetchProjectsByEmployee(employeeData.id_e);
    }
  }, [employeeData]);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('http://localhost:3001/getProjectsforEmp')
      .then((response) => {
        setProjects(response.data);
        // Select the first project by default and display its tasks
        // if (response.data.length > 0) {
        //   setSelectedProjectName(response.data[0].projectName);
        // }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  // const handleEmployeeNameClick = (employeeId) => {
  //   console.log('Clicked on employee name');
  //   // You can perform any action here, such as navigating to a different page
  //   fetchProjectsByEmployee(employeeId);
  // };
  
  

  return (
    <div>
      <div>
      <Navbar
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
        />
        {showAddProject && <AddNewProject onClose={handleCloseAddProject} />}
        {showAddTask && <AddTask onClose={handleCloseTaskProject} />}
        {showAssignTask && <AssignTask onClose={handleCloseAssignTaskProject} />}
      </div>
      <div className={`empoverview ${backgroundClass}`}>
        <div className='emp-title'>
          <div><h2>EMPLOYEE OVERVIEW</h2></div>
          <div className='add-emp' onClick={handleAddEmpClick}><a href='/add-employee'>Add Employee</a></div>
          {/* <div><h2>Projects</h2></div> */}
        </div>
        <div>
          <div className="table-wrapper">
        <table style={{ width: '20%' }} className="employee-table">
          <thead>
            <tr>
              <th>Employees</th>
            </tr>
          </thead>
          <tbody>
            {employeeNames.map((name, index) => (
              <tr key={index}>
                <td className='table_row'>
                  <div >
                    {name}
                  </div>
                  <div className='edit_emp_btn'>
                    <button onClick={() => handleEditEmployeeClick(name)} className="edit-button-proj">
                      <img src={editbtn} alt="Button" className="editimg" />
                    </button>
                  </div>
                  <div>
                        <button className="del-button-proj">
                          <img src={deletebtn} alt="Button" className="delimg" />
                        </button>
                      </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        </div>
        {/* <div className="table-wrapper">
        <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>{project.projectName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div> */}


      </div>
      {/* Display the EditEmployee component if employeeData is available */}
      {employeeData && <EditEmployee isPopupVisible={isPopupVisible} employeeData={employeeData} />}



    </div>
  );
}

export default EmployeePage;
