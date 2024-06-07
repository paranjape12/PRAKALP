import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskInfoDialog from './TaskInfoDialog';
import { faEye, faEyeSlash, faCopyright, faEdit, faCircleInfo, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function getTaskStatusColor(status, aproved) {
  if (aproved === 1) {
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
  const [taskDetails, setTaskDetails] = useState(null);

  const handleTaskInfoDialogOpen = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/taskInfoDialog', {
        token,
        taskId: task.taskId,
      });
      setTaskDetails(response.data);
      setTaskInfoDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
    }
  };

  const handleTaskInfoDialogClose = () => {
    setTaskInfoDialogOpen(false);
  };

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails((prev) => !prev);
  };

  return (
    <td style={{ width: '15rem', verticalAlign: 'top', height: '100%', display: 'flex', alignItems: 'center' }} className="p-0">
      <div className="card" style={{ flex: '1', height: '100%' }}>
        <div className="card-header" style={{ height: 'auto', padding:'0.2rem'}}>
          <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.taskStatus, task.taskAproved)}`} style={{ fontSize: '11px' }}>
            {task.taskName}
          </h6>
          <FontAwesomeIcon icon={faTrashCan} style={{ float: 'right', cursor: 'pointer', color: 'red', paddingTop: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.4rem' }} />
          <FontAwesomeIcon icon={faEdit} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} />
          {task.taskStatus==="1" && (<FontAwesomeIcon icon={faCopyright} color='#1cc88a' style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />)}
          <FontAwesomeIcon icon={faCircleInfo} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleTaskInfoDialogOpen}/>
          <FontAwesomeIcon title='Show/Hide Time' icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete}
            style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem' }}
          />
        </div>
        
      <TaskInfoDialog 
      key={task.taskId}
      open={taskInfoDialogOpen} 
      project={project}
      task={task}
      seconds2dayhrmin={seconds2dayhrmin}
      handleClose={handleTaskInfoDialogClose} />
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
