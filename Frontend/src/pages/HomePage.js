import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../cssfiles/HomePage.css';
import deletebtn from '../assets/delete.png';
import editbtn from '../assets/edit-text.png';
import axios from 'axios';
import EditProject from '../components/EditProject';
//import WeeklyCalender from './WeeklyCalender';
import Navbar from '../components/Navbar/Navbar';
import AddNewProject from '../components/Navbar/AddNewProject';
import AddTask from '../components/Navbar/AddTask';
import AssignTask from '../components/AssignTask';
import TaskOverviewGJC from './TaskOverview/TaskOverviewGJC';



function HomePage({ isPopupVisible, userRole, employeeId }) {
  const navigate = useNavigate();
  const backgroundClass = isPopupVisible ? 'blurred-background' : '';

  const [projects, setProjects] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState(null);
  const [isConfirmDialogActive, setIsConfirmDialogActive] = useState(false);
  const [editProjectData, setEditProjectData] = useState(null);
  const [isThreeColumnLayout, setIsThreeColumnLayout] = useState(false);


  //Navbar//
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

  //Navbar functions ended//
  

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('http://localhost:3001/getProjects')
      .then((response) => {
        setProjects(response.data);
        // Select the first project by default and display its tasks
        if (response.data.length > 0) {
          setSelectedProjectName(response.data[0].projectName);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  // Handle click on the <td>
  const handleTdClickProject = (projectName) => {
    setSelectedProjectName(projectName); // Update the selected project ID
  };

  const handleDeleteProject = (projectId) => {
    setProjectIdToDelete(projectId);
    setShowDeleteModal(true);
    setIsConfirmDialogActive(true); 
  };

  const confirmDeleteProject = () => {
    axios.delete(`http://localhost:3001/deleteProject/${projectIdToDelete}`)
      .then((response) => {
        console.log('Project deleted successfully');
        setProjects(projects.filter(project => project.id_p !== projectIdToDelete));
      })
      .catch((error) => {
        console.error('Error deleting project:', error);
      });
    setShowDeleteModal(false);
    setIsConfirmDialogActive(false); // Deactivate confirm dialog
  };

  const cancelDeleteProject = () => {
    setProjectIdToDelete(null);
    setShowDeleteModal(false);
    setIsConfirmDialogActive(false); // Deactivate confirm dialog
  };

  const handleEditProject = (project) => {
    setEditProjectData(project); // Set project data for editing
  };

  const toggleThreeColumnLayout = () => {
    setIsThreeColumnLayout(prevState => !prevState); // Toggle the three-column layout state
  };

  return (
    <div>
    <div>

< Navbar onAddProjectClick={handleAddProjectClick} onAddTaskClick={handleAddTaskClick} onAssignTaskClick={handleAssignTaskClick} />
{showAddProject && <AddNewProject onClose={handleCloseAddProject} />}
{showAddTask && <AddTask onClose={handleCloseTaskProject} />}
{showAssignTask && <AssignTask onClose={handleCloseAssignTaskProject} />}S

</div>
    <div className={`homepage ${backgroundClass} ${isThreeColumnLayout ? 'three-column-layout' : ''}`}>
      
      <div>
        {/* Project Overview */}
        <div className='table-toggle-container'>
        <div className='project-overview-name'>
          <div><h2>Project Overview</h2></div>
          
          
          <div className='total-proj'>Total Projects: 
          <div className='proj-count'>{projects.length}</div>
          {/* Toggle button */}
        {/* <button className='toggle-button' onClick={toggleThreeColumnLayout}>~</button> */}
          
            
            </div>  
        </div>
        </div>
        
        
        <div className='table-container'>
          <div className="project-table-scroll">
            <table className='table-proj'>
              <thead>
                <tr>
                  <th>Project Name</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id_p} className={selectedProjectName === project.projectName || (index === 0 && !selectedProjectName) ? 'highlighted-project' : ''} onClick={() => handleTdClickProject(project.projectName)}>
                    <td className="proj-row">
                      <div> 
                        [ {project.salesName} ]<br></br> <strong>{project.projectName}</strong>
                      </div>
                      <div>
                        <button className="edit-button-proj" onClick={() => handleEditProject(project)}>
                          <img src={editbtn} alt="Button" className="editimg" />
                        </button>
                      </div>
                      <div>
                        <button className="del-button-proj" onClick={() => handleDeleteProject(project.id_p)}>
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
        
      
      </div>

    

      {/* Display TaskOverview component */}
      <div className="half-page">
        <TaskOverviewGJC isPopupVisible={isPopupVisible} selectedProjectName={selectedProjectName} />
      </div>

      {/* {!isThreeColumnLayout && (
        <div className="second-page">
          <TaskOverview isPopupVisible={isPopupVisible} selectedProjectName={selectedProjectName} />
        </div>
      )} */}


      {/* {isThreeColumnLayout && (
        <div className="third-page">
        <WeeklyCalender isPopupVisible={isPopupVisible} selectedProjectName={selectedProjectName} />
      </div>
      )} */}

      

      
 
     
        



      {showDeleteModal && (
        <div className="delete-modal">
          <p>Are you sure you want to delete this project?</p>
          <div>
            <button onClick={confirmDeleteProject}>Yes</button>
            <button onClick={cancelDeleteProject}>No</button>
          </div>
        </div>
      )}

      {isConfirmDialogActive && ( // Render overlay only if confirm dialog is active
        <div className="overlay"></div>
      )}

      {editProjectData && (
        <EditProject projectData={editProjectData} onClose={() => setEditProjectData(null)} />
      )}
    </div>
    </div>
  );
}

export default HomePage;