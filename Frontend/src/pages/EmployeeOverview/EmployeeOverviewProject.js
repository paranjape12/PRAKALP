import React from 'react'

function EmployeeOverviewProject() {
  const [showComplete, setShowComplete] = useState(() => {
    // Get initial state from localStorage or set default value to true
    const storedValue = localStorage.getItem('showComplete');
    return storedValue ? JSON.parse(storedValue) : true;
  });
  const [showTimeComplete, setShowTimeComplete] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [showTimeDetails, setShowTimeDetails] = useState(true);
  const [projectTimeDetails, setProjectTimeDetails] = useState({});

  const toggleShowComplete = (e) => {
    e.stopPropagation();
    setShowComplete((prevShowComplete) => {
      const newValue = !prevShowComplete;
      // Store new value in localStorage
      localStorage.setItem('showCompletedTasks', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Modify the toggleShowTimeComplete function to toggle time details for a specific project
  const toggleShowTimeComplete = (projectId) => {
    setProjectTimeDetails((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId] || false,
    }));
  };

  // Inside the useEffect hook for fetching projects, initialize the projectTimeDetails state with default values
  useEffect(() => {
    const initialProjectTimeDetails = {};
    projects.forEach((project) => {
      initialProjectTimeDetails[project.projectId] = showTimeDetails;
    });
    setProjectTimeDetails(initialProjectTimeDetails);
  }, [projects, showTimeDetails]);

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

  const handleOpenAddTaskModal = (projectName) => {
    setProjectName(projectName); 
    setShowAddTaskModal(true); 
  };
  
  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false); // Close AddTaskModal
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
          is_complete: showComplete ? '1' : '0',
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

  return (
    <div>
      {projects.map((project, index) => (
            <tr key={index}>
              <td className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', padding: '0 0 0 0.5rem', fontSize: '13.44px' }}>
                {project.assigntaskpresent && (
                  <FontAwesomeIcon
                    icon={expandedProjects[project.projectId] ? faMinus : faPlus}
                    style={{ cursor: 'pointer' }}
                    title='Expand Tasks'
                    onClick={() => handleExpandTasks(project.projectId)}
                  />
                )}
                [{project.projectSalesOrder}]
                <a className="deleteproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Delete project" name={project.proid} onClick={() => handleOpenDeleteProjectDialog(project.projectId, project.projectName)}>
                  <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                </a>
                <a className="editproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Edit project" id={project.projectId} name={project.projectName} value={project.proj_status} onClick={() => handleOpenEditProjectDialog(project)}>
                  <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                </a>
                <br />
                {project.projectName}
              </td>
              <td>
              {project.assigntaskpresent && (
                <>
                  {expandedProjects[project.projectId] ? (
                    project.tasks
                      // Filter out tasks with approved value equal to 1 if showComplete is false
                      .filter(task => showComplete || task.taskAproved !== 1)
                      .map(task => (
                        <IndividualTaskView
                          key={task.taskId}
                          project={project}
                          task={task}
                          toggleShowTimeComplete={toggleShowTimeComplete}
                          seconds2dayhrmin={seconds2dayhrmin}
                        />
                      ))
                  ) : (
                    <AggregateTaskView
                      project={project}
                      toggleShowTimeComplete={() => toggleShowTimeComplete(project.projectId)}
                      seconds2dayhrmin={seconds2dayhrmin}
                      showComplete={showComplete}
                    />
                  )}
                </>
                
              )}</td>
              {!project.assigntaskpresent && (
                <td className="text-center addtask" name={project.projectName} style={{ fontSize: '13.44px', verticalAlign: 'middle' }} colSpan="9">
                  No Task Found today
                </td>
              )}
            </tr>
             ))}
    </div>
  )
}

export default EmployeeOverviewProject
