import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask';

const AggregateTaskView = ({ project, toggleShowTimeComplete, seconds2dayhrmin, showComplete }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(() => {
    const storedValue = localStorage.getItem('showTimeDetails');
    const details = storedValue ? JSON.parse(storedValue) : {};
    if (details[project.projectId] === undefined) {
      details[project.projectId] = true; // Default to true if not set
      localStorage.setItem('showTimeDetails', JSON.stringify(details));
    }
    return details[project.projectId];
  });
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

  useEffect(() => {
    const storedValue = localStorage.getItem('showTimeDetails');
    const details = storedValue ? JSON.parse(storedValue) : {};
    details[project.projectId] = localShowTimeDetails;
    localStorage.setItem('showTimeDetails', JSON.stringify(details));
  }, [localShowTimeDetails, project.projectId]);

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails((prev) => !prev);
    toggleShowTimeComplete(project.projectId); // Keep the parent state in sync
  };

  function getTaskStatusColor(requiredTime, takenTime) {
    if (requiredTime < takenTime) {
      return 'bg-danger border border-danger';
    } else if (takenTime === 0) {
      return 'bg-warning border border-warning';
    } else {
      return 'bg-success border border-success';
    }
  }

  const handleOpenAddTaskDialog = () => {
    setAddTaskDialogOpen(true);
  };
  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };

  // Filter tasks based on the showComplete state and approved value
  const filteredTasks = project.tasks.filter(task => showComplete || task.taskAproved !== 1);
  const noOfAssignedTasks = filteredTasks.length;

  return (
    <>
      <td style={{ width: '15rem', verticalAlign: 'unset', paddingBottom: 'auto', display: 'flex', alignItems: 'center' }} className="p-0">
        <div className="card" style={{ flex: '1', height: '100%' }}>
          <div className="card-header p-0">
          <h6 className={`m-0 text-center font-weight-bold text-white ${getTaskStatusColor(project.requiredTime, project.takenTime)}`} style={{ fontSize: '11px', paddingTop:'0.1rem' }}>
              Total Task: {noOfAssignedTasks}
              <a className="show p-0" style={{ float: 'right' }} title="Show/Hide Time" name="31">
                <div className="taskEye" style={{ position: 'absolute', right: '1rem' }}>
                  <FontAwesomeIcon
                    icon={localShowTimeDetails ? faEye : faEyeSlash}
                    className="eyeicon"
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={handleToggleShowTimeComplete}
                  />
                </div>
              </a>
            </h6>
          </div>
          <div className="card-body text-left" style={{ padding: '0.37rem' }}>
            {localShowTimeDetails && (
              <>
                <h6 title="Required" className="text-left m-0 Required" style={{ fontSize: '11px' }}>R : {seconds2dayhrmin(project.requiredTime)}</h6>
                <h6 title="Taken" className="text-left m-0 Taken" style={{ fontSize: '11px' }}>T : {seconds2dayhrmin(project.takenTime)}</h6>
              </>
            )}
          </div>
        </div>
        <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column'}}>
          <td style={{ padding: '0.3rem 0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px',borderStyle:'none none none solid' }}>P</td>
          <td style={{ padding: '0.3rem 0.35rem', fontSize: '13.44px',borderStyle:'solid none none solid'}}>A</td>
        </div>
      </td>
      {/* Add 2 rows 7 <td> elements */}
      {[...Array(7)].map((_, i) => (
        <td key={i} style={{ padding: '0'}}>
          <tr 
            style={{ padding: '0.2rem', display: 'block', backgroundColor: 'gray', color: 'white', border:'none', cursor: 'pointer', textAlign:'center' }}
            onClick={handleOpenAddTaskDialog}
          >
            &nbsp;
          </tr>
          <tr style={{ padding: '0.17rem', display: 'block' ,borderStyle:'solid none none none'}}>{i+8}</tr>
        </td>
      ))}
      {<AddTaskModal projectName={project.projectName} open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} />}
    </>
  );
}

export default AggregateTaskView;
