// TaskDetailsPopup.js
import React from 'react';
import '../css/TaskDetailsPopup.css'

function TaskDetailsPopup({ task, onClose }) {
  return (
    <div className="task-details-popup">
        <div className="popup-content">
            <div className='header-task-details'>
            <h2>Task Details</h2>
            </div>
      
      <div>Employee Name: <strong>{task.employee}</strong></div>
      <div>Time Required: <strong>{task.timeRequired} hrs</strong></div>
      <div>Date: <strong>{task.date}</strong></div>
      <div>Description: <strong>{task.description}</strong></div>
      <div>Is Last Task: <strong>{task.isLastTask ? 'Yes' : 'No'}</strong></div>
      {/* <div>Time Taken: <strong>{task.timeTaken} hrs</strong></div> */}
      <button onClick={onClose}>Close</button>
    </div>
    </div>
  );
}

export default TaskDetailsPopup;
