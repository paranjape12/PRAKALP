import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskInfoDialog from './TaskInfoPopup';
import { faEye, faEyeSlash, faCopyright, faPencilAlt, faCircleInfo, faTrashCan, faL } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import EditTaskPopup from './EditTaskPopup';
import DeleteTaskPopup from './DeleteTaskPopup';
import TaskCompletePopup from './TaskCompletePopup';
import { Buffer } from 'buffer';
import { format } from 'date-fns';

function getTaskStatusColor(status, approved) {
  if (approved === 1) {
    return "bg-success border border-success";
  } else if (status === "2") {
    return "bg-warning border border-warning";
  } else {
    return "bg-warning border border-warning";
  }
}

function decryptToken(token) {
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  const userData = JSON.parse(decodedToken)[0];
  return userData;
}

const IndividualTaskView = ({ project, dates, task, toggleShowTimeComplete, seconds2dayhrmin }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(false);
  const [taskInfoDialogOpen, setTaskInfoDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [taskCompleteOpen, setTaskCompleteOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [taskTimings, setTaskTimings] = useState([]);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = decryptToken(token);
        setNickname(userData.Nickname);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTaskTimings = async () => {
      try {
        const formattedDates = dates.map(item => format(new Date(item.date), 'yyyy-MM-dd'));
        const responses = await Promise.all(formattedDates.map(formattedDate => (
          axios.post('http://localhost:3001/api/indViewPATimes', {
            projectName: project.projectName,
            dates: [formattedDate]
          })
        )));
        const responseData = responses.map(response => response.data);
        setTaskTimings(responseData);
        console.log("responseData :", responseData);
      } catch (error) {
        console.error('Failed to fetch task timings:', error);
      }
    };

    fetchTaskTimings();
  }, [project.projectName, dates]);

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

 
  const handleOpenTaskCompleteDialog = () => {
    setTaskCompleteOpen(true);
  };

  const handleCloseTaskCompleteDialog = () => {
    setTaskCompleteOpen(false);
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
            {taskCompleteOpen && (
              <TaskCompletePopup
                open={taskCompleteOpen}
                handleClose={handleCloseTaskCompleteDialog}
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
              {taskTimings.map((timing, i) => (
                <td key={i} style={{ minWidth: '8.7rem', backgroundColor: 'gray', color: 'white', borderStyle: 'none solid solid none', textAlign: 'center', fontWeight: '800', fontSize: '13px' }}>
                  {timing.length > 0 && timing[0]?.taskid === task.taskId ? `${nickname} : ${seconds2dayhrmin(timing[0].planned)}` : ''}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.6rem 0.5rem', fontSize: '13.44px' }}>A</td>
              {taskTimings.map((timing, i) => (
                <td key={i} style={{ minWidth: '8.7rem', backgroundColor: 'white', border: '1px solid gray', textAlign: 'center', fontWeight: '800', fontSize: '13px' }} onClick={handleOpenTaskCompleteDialog}>
                  {timing.length > 0 && timing[0]?.taskid === task.taskId ? (
                    <>
                      <span style={{ color: seconds2dayhrmin(timing[0].actual) ? '#1cc88a ' : 'inherit' }}>{nickname}</span> : {seconds2dayhrmin(timing[0].actual)}
                    </>
                  ) : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IndividualTaskView;
