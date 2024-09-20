import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask';
import { Buffer } from 'buffer';
import Skeleton from '@mui/material/Skeleton'; // Import Skeleton from Material-UI
import { getUserDataFromToken } from '../../utils/tokenUtils';

const AggregateTaskView = ({ project, dates, toggleShowTimeComplete, seconds2dayhrmin, showComplete }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(() => {
    const storedValue = localStorage.getItem('showTimeDetails');
    const details = storedValue ? JSON.parse(storedValue) : {};
    if (details[project.projectId] === undefined) {
      details[project.projectId] = true;
      localStorage.setItem('showTimeDetails', JSON.stringify(details));
    }
    return details[project.projectId];
  });
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [projectTimeDetails, setProjectTimeDetails] = useState({}); // Store time details per project
  const [loading, setLoading] = useState(false); // Loading state

  const seconds2hrmin = (ss) => {
    if (ss == null) { return ``; }
    const h = Math.floor(ss / 3600);
    const m = Math.floor((ss % 3600) / 60);
    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;
    return `${formattedH} : ${formattedM}`;
  };

  const fetchProjectTimeDetails = async (projectName, userId, startDate, userRole, userNickname) => {
    setLoading(true); // Start loading when fetching data
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewIndAggPATimes`, {
        params: { projectName, userId, startDate, userRole, userNickname }
      });

      const updatedProjectTimeDetails = { planned: {}, actual: {}, projectName: response.data.data[0]?.projectName || '' };

      response.data.data.forEach(row => {
        updatedProjectTimeDetails.planned[row.taskDate] = row.planned || 0;
        updatedProjectTimeDetails.actual[row.taskDate] = row.actual || 0;
      });

      // Set project-specific time details
      setProjectTimeDetails(prevState => ({
        ...prevState,
        [project.projectId]: updatedProjectTimeDetails,
      }));
    } catch (error) {
      console.error('Error fetching project time details:', error);
    } finally {
      setLoading(false); // Stop loading after fetching data
    }
  };

  const decrypToken = getUserDataFromToken();

  useEffect(() => {
    const assignBy = decrypToken.id;
    const projectName = project.projectName;
    const startDate = dates[0]?.ymdDate;
    const userRole = decrypToken.Type;
    const userNickname = decrypToken.Nickname;

    // Fetch project time details when project or dates change
    if (project.projectId && dates.length > 0) {
      fetchProjectTimeDetails(projectName, assignBy, startDate, userRole, userNickname);
    }
  }, [project.projectId, project.projectName, dates]);

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails(prev => !prev);
    toggleShowTimeComplete(project.projectId);
  };

  const handleOpenAddTaskDialog = () => {
    setAddTaskDialogOpen(true);
  };

  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
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

  const filteredTasks = project.tasks.filter(task => showComplete || task.taskAproved !== 1);
  const noOfAssignedTasks = filteredTasks.length;

  const projectTime = projectTimeDetails[project.projectId] || { planned: {}, actual: {}, projectName: '' };

  return (
    <>
      <td style={{ width: '15rem', verticalAlign: 'unset', paddingBottom: 'auto', display: 'flex', alignItems: 'center', border: 'none' }} className="p-0">
        <div className="card" style={{ flex: '1', height: '100%' }}>
          <div className="card-header p-0">
            <h6 className={`m-0 text-center font-weight-bold text-white ${getTaskStatusColor(project.requiredTime, project.takenTime)}`} style={{ fontSize: '11px', paddingTop: '0.1rem' }}>
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
                <h6 title="Required" className="text-left m-0 Required" style={{ fontSize: '11px' }}>R : {seconds2dayhrmin(project.requiredTime) || '00 : 00 : 00'}</h6>
                <h6 title="Taken" className="text-left m-0 Taken" style={{ fontSize: '11px' }}>T : {seconds2dayhrmin(project.takenTime) || '00 : 00 : 00'}</h6>
              </>
            )}
          </div>
        </div>
        <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <td title='Planned Timings' style={{ padding: '0.35rem 0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none solid none solid' }}>P</td>
          <td title='Actual Timings' style={{ padding: '0.3rem 0.35rem', fontSize: '13.44px', borderStyle: 'solid none none solid' }}>A</td>
        </div>
      </td>
      {dates.map((date, i) => {
        const plannedTime = projectTime.planned[date.ymdDate];
        const actualTime = projectTime.actual[date.ymdDate];

        // Only show the loading mask when loading is true
        const showSkeleton = loading;

        return (
          <td key={i} style={{ padding: '0', fontSize: '15px', width: `${100 / dates.length}%`,minWidth: '80px', }}>
            <div title='Create New Task'
              style={{ cursor: 'pointer', paddingTop: '0.2rem', width: '100%', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}
              onClick={handleOpenAddTaskDialog}>
              {plannedTime !== null ? seconds2hrmin(plannedTime) : ''}
            </div>
            <div style={{ paddingTop: '0.2rem', width: '100%', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle', borderWidth: 'thin' }}>
              {actualTime !== null ? seconds2hrmin(actualTime) : ''}
            </div>
          </td>
        );
      })}
      {<AddTaskModal projectName={project.projectName} open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} />}
    </>
  );
}

export default AggregateTaskView;
