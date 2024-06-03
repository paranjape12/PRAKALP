import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AggregateTaskView = ({ project, toggleShowTimeComplete, showTimeDetails, getTaskStatusColor, seconds2dayhrmin }) => {
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
    <>
      <td style={{ width: '15rem', verticalAlign: 'unset', height: '100%', display: 'flex', alignItems: 'center' }} className="p-0">
        <div className="card" style={{ flex: '1', height: '100%' }}>
          <div className="card-header p-0">
            <h6 className={`m-0 text-center font-weight-bold text-white ${getTaskStatusColor(project.requiredTime, project.takenTime)}`} style={{ fontSize: '11px' }}>
              Total Task: {project.noofassigntasks}
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
          <div className="card-body text-left p-0">
            {localShowTimeDetails && (
              <>
                <h6 title="Required" className="text-left m-0 Required" style={{ fontSize: '11px' }}>R : {seconds2dayhrmin(project.requiredTime)}</h6>
                <h6 title="Taken" className="text-left m-0 Taken" style={{ fontSize: '11px' }}>T : {seconds2dayhrmin(project.takenTime)}</h6>
              </>
            )}
          </div>
        </div>
        <div style={{ verticalAlign: 'middle', flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <td style={{ padding: '0 0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px' }}>P</td>
          <td style={{ padding: '0 0.35rem', fontSize: '13.44px' }}>A</td>
        </div>
      </td>
    </>
  );
}

export default AggregateTaskView;
