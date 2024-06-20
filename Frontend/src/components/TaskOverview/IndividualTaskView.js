import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskInfoDialog from './TaskInfoPopup';
import { faEye, faEyeSlash, faCopyright, faPencilAlt, faCircleInfo, faTrashCan, faL } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import EditTaskPopup from './EditTaskPopup';

function getTaskStatusColor(status, approved) {
  if (approved === 1) {
    return "bg-success border border-success";
  } else if (status === "2") {
    return "bg-warning border border-warning";
  } else {
    return "bg-warning border border-warning";
  }
}

const seconds2hrmin = (ss) => {
  const m = Math.floor(ss / 60); // total minutes
  const h = Math.floor(m / 60); // total hours
  const minutes = m % 60; // remaining minutes

  const formattedH = h < 10 ? '0' + h : h;
  const formattedM = minutes < 10 ? '0' + minutes : minutes;

  return `${formattedH} : ${formattedM}`;
};


const IndividualTaskView = ({ project, task, toggleShowTimeComplete, seconds2dayhrmin }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(false);
  const [taskInfoDialogOpen, setTaskInfoDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:3001/api/taskInfoDialog', {
          token,
          taskId: task.taskId,
        });
        setTaskDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch task details:', error);
      }
    };

    fetchTaskDetails();
  }, [task.taskId]);

  const handleTaskInfoDialogOpen = () => {
    setTaskInfoDialogOpen(true);
  };

  const handleTaskInfoDialogClose = () => {
    setTaskInfoDialogOpen(false);
  };

  const handleOpenEditTaskDialog = () => {
  
    setSelectedProject({
      projectName: project.projectName,
      projectLastTask: project.projectLastTask,
      taskName: task.taskName,
      taskActualTime: task.taskActualTime,             
      taskDetails: task.taskDetails,  
    });
    setEditTaskDialogOpen(true);
  };
  

  const handleCloseEditTaskDialog = () => {
    setSelectedProject(null);
    setEditTaskDialogOpen(false);
  };

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails(prev => !prev);
  };

  return (
    <td style={{ width: '15rem', verticalAlign: 'top', height: '100%', display: 'flex', alignItems: 'center' }} className="p-0">
      <div className="card" style={{ flex: '1', height: '100%' }}>
        <div className="card-header" style={{ height: 'auto', padding: '0.2rem' }}>
          <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.taskStatus, task.taskAproved)}`} style={{ fontSize: '11px' }}>
            {task.taskName}
          </h6>
          <FontAwesomeIcon icon={faTrashCan} style={{ float: 'right', cursor: 'pointer', color: 'red', paddingTop: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.4rem' }} />
          <FontAwesomeIcon icon={faPencilAlt} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleOpenEditTaskDialog} />
          {task.taskStatus === "1" && (<FontAwesomeIcon icon={faCopyright} color='#1cc88a' style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />)}
          <FontAwesomeIcon icon={faCircleInfo} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleTaskInfoDialogOpen} />
          {project.projectLastTask === 1 && (<FontAwesomeIcon icon={faL} style={{ color: '#36b9cc', paddingTop: '0.2rem', paddingLeft: '0.5rem' }}/>)}
          <FontAwesomeIcon title='Show/Hide Time' icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete}
            style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem' }}
          />
        </div>

        <TaskInfoDialog
          key={task.taskId}
          open={taskInfoDialogOpen}
          project={project}
          task={task}
          taskDetails={taskDetails}
          handleClose={handleTaskInfoDialogClose}
        />

        {selectedProject && (
          <EditTaskPopup
            open={editTaskDialogOpen}
            handleClose={handleCloseEditTaskDialog}
            projectDetails={selectedProject}
          />
        )}

        {localShowTimeDetails && (
          <div className="card-body text-left p-0" style={{ marginLeft: '0.4rem', fontSize: '11px' }}>
            R: {seconds2dayhrmin(task.taskGivenTime)}
            <br />
            T: {seconds2dayhrmin(task.taskActualTime)}
          </div>
        )}
      </div>
      <div style={{ verticalAlign: 'middle', flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        <td style={{ padding: '0.6rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px' }}>P</td>
        <td style={{ padding: '0.6rem 0.5rem', fontSize: '13.44px' }}>A</td>
      </div>
    </td>
  );
}

export default IndividualTaskView;
