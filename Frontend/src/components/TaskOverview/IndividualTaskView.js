import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskInfoDialog from './TaskInfoPopup';
import { faEye, faEyeSlash, faCopyright, faPencilAlt, faCircleInfo, faTrashCan, faL } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import EditTaskPopup from './EditTaskPopup';
import DeleteTaskPopup from './DeleteTaskPopup';

function getTaskStatusColor(status, approved) {
  if (approved === 1) {
    return "bg-success border border-success";
  } else if (status === "2") {
    return "bg-warning border border-warning";
  } else {
    return "bg-warning border border-warning";
  }
}

const IndividualTaskView = ({ project, task, toggleShowTimeComplete, seconds2dayhrmin }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(false);
  const [taskInfoDialogOpen, setTaskInfoDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
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

  const handleOpenDeleteTaskDialog = () => {
    setTaskToDelete({ taskId: task.taskId, taskName: task.taskName });
    setDeleteTaskDialogOpen(true);
  };

  const handleCloseDeleteTaskDialog = () => {
    setTaskToDelete(null);
    setDeleteTaskDialogOpen(false);
  };

  return (
    <div className="task-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="p-0" style={{ width: '100%', verticalAlign: 'top', height: '100%', display: 'flex', border: 'none' }}>
        <div className="card" style={{ flex: '1', height: '2rem', display: 'flex', flexDirection: 'column', width: '11rem', marginLeft: '0' }}>
          <div style={{ height: '5rem', width: '13.2rem', border: 'none' }}>
            <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.taskStatus, task.taskAproved)}`} style={{ marginTop: '0.5rem', fontSize: '11px' }}>
              {task.taskName}
            </h6>
            <FontAwesomeIcon icon={faTrashCan} style={{ float: 'right', cursor: 'pointer', color: 'red', paddingTop: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.4rem' }} onClick={handleOpenDeleteTaskDialog} />
            <FontAwesomeIcon icon={faPencilAlt} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleOpenEditTaskDialog} />
            {task.taskStatus === "1" && (<FontAwesomeIcon icon={faCopyright} color='#1cc88a' style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />)}
            <FontAwesomeIcon icon={faCircleInfo} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleTaskInfoDialogOpen} />
            {project.projectLastTask === 1 && (<FontAwesomeIcon icon={faL} style={{ color: '#36b9cc', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} />)}
            <FontAwesomeIcon title='Show/Hide Time' icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem' }} />
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

          {deleteTaskDialogOpen && (
            <DeleteTaskPopup
              task={taskToDelete}
              open={deleteTaskDialogOpen}
              handleClose={handleCloseDeleteTaskDialog}
            />
          )}

          {localShowTimeDetails && (
            <div className="card-body text-left" style={{ padding: '0', fontSize: '11px', height: 'auto', width: '13rem', marginLeft: '0.2rem', marginBottom: '0.2rem' }}>
              R: {seconds2dayhrmin(task.taskRequiredTime)}
              <br />
              T: {seconds2dayhrmin(task.taskActualTime)}
            </div>
          )}
        </div>


        <table style={{ marginLeft: '13.2rem' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.73rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none solid none none' }}>P</td>
              {[...Array(7)].map((_, i) => (
                <td key={i} style={{ padding: '0.6rem 4.19rem', backgroundColor: 'gray', color: 'white', borderStyle: 'none solid solid none', textAlign: 'center' }}>&nbsp;</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.6rem 0.5rem', fontSize: '13.44px' }}>A</td>
              {[...Array(7)].map((_, i) => (
                <td key={i} style={{ padding: '0.6rem 4.19rem', backgroundColor: 'white', border: '1px solid gray', textAlign: 'center' }}>&nbsp;</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IndividualTaskView;
