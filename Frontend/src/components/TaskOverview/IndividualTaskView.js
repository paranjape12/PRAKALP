import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCopyright, faInfo, faEdit, faCircleInfo, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const IndividualTaskView = ({ project, task, toggleShowTimeComplete, showTimeDetails, getTaskStatusColor, seconds2dayhrmin }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(() => {
    const storedValue = localStorage.getItem('showTimeDetails');
    const details = storedValue ? JSON.parse(storedValue) : {};
    if (details[project.projectId] === undefined) {
      details[project.projectId] = true; // Default to true if not set
      localStorage.setItem('showTimeDetails', JSON.stringify(details));
    }
    return details[project.projectId];
  });

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

  return (
    <td style={{ width: '15rem', verticalAlign: 'top', height: '100%', display: 'flex', alignItems: 'center' }} className="p-0">
      <div className="card" style={{ flex: '1', height: '100%' }}>
        <div className="card-header p-0" style={{ height: 'auto' }}>
          <h6 className="m-0 text-center font-weight-bold text-white bg-primary" style={{ fontSize: '11px' }}>
            {task.taskName}
          </h6>
          <FontAwesomeIcon icon={faTrashCan} style={{float:'right',cursor: 'pointer', color: 'red', paddingTop:'0.2rem', paddingLeft:'0.5rem', paddingRight:'0.4rem'}}/>
          <FontAwesomeIcon icon={faEdit} style={{float:'right',cursor: 'pointer', color: '#4e73df', paddingTop:'0.2rem', paddingLeft:'0.5rem'}}/>
          <FontAwesomeIcon icon={faCopyright} color='#1cc88a' style={{marginLeft:'0.4rem', verticalAlign:'middle'}}/>
          <FontAwesomeIcon icon={faCircleInfo} style={{float:'right',cursor: 'pointer', color: '#4e73df', paddingTop:'0.2rem', paddingLeft:'0.5rem'}}/>
          <FontAwesomeIcon icon={faEye} style={{float:'right',cursor: 'pointer', color: '#4e73df', paddingTop:'0.2rem'}}/>
        </div>
        <div className="card-body text-left p-0" style={{marginLeft:'0.4rem', fontSize:'14px'}}>
          R:
          <br/>
          T: 
        </div>
      </div>
      <div style={{ verticalAlign: 'middle', flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        <td style={{ padding: 'auto 0.8rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px' }}>P</td>
        <td style={{ padding: 'auto 0.35rem', fontSize: '13.44px' }}>A</td>
      </div>
    </td>
  );
}

export default IndividualTaskView;
