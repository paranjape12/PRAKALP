import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCopyright, faEdit, faCircleInfo, faTrashCan } from '@fortawesome/free-solid-svg-icons';

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

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails((prev) => !prev);
  };

  return (
    <td style={{ width: '15rem', verticalAlign: 'top', height: '100%', display: 'flex', alignItems: 'center' }} className="p-0">
      <div className="card" style={{ flex: '1', height: '100%' }}>
        <div className="card-header p-0" style={{ height: 'auto' }}>
          <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.taskStatus, task.taskAproved)}`} style={{ fontSize: '11px' }}>
            {task.taskName}
          </h6>
          <FontAwesomeIcon icon={faTrashCan} style={{ float: 'right', cursor: 'pointer', color: 'red', paddingTop: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.4rem' }} />
          <FontAwesomeIcon icon={faEdit} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} />
          <FontAwesomeIcon icon={faCopyright} color='#1cc88a' style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />
          <FontAwesomeIcon icon={faCircleInfo} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} />
          <FontAwesomeIcon title='Show/Hide Time' icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete}
            style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem' }}
          />
        </div>
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
