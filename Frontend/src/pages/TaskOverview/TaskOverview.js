import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import '../../pages/TaskOverview/TaskOverview.css';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const today = new Date();

const daysOfWeek = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

function TaskOverview() {
  const [showComplete, setShowComplete] = useState(true);
  const [projects, setProjects] = useState([]);

  const toggleShowComplete = (e) => {
    e.stopPropagation();
    setShowComplete(prevShowComplete => !prevShowComplete);
  };

  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startDateIndex + i));
      newDates.push({
        date: newDate,
        dateString: newDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);

  const handleNextDayClick = () => {
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projectcell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: localStorage.getItem('token'),
            is_complete: showComplete ? '1' : '0'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProjects();
  }, [showComplete]);

  const getBackgroundColor = (proj_status) => {
    switch (proj_status) {
      case 1:
        return '#ADD8E6';
      case 2:
        return '#ffff00ad';
      case 3:
        return '#ff8d00b8';
      case 4:
        return '#04ff00b8';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <div>
      {dates.length > 0 && (
        <Navbar
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
        />
      )}
      <table className="table table-bordered text-dark" width="100%" cellSpacing="0" style={{ marginTop: '38px', fontFamily: "Nunito" }}>
        <thead className="text-white" id="theader">
          <tr className="text-center small">
            <th style={{ width: '20rem', verticalAlign: 'revert', color: 'white' }}>Projects</th>
            <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ flexGrow: 1, textAlign: 'center' }}>Task Details</span>
                <div className="taskEye" style={{ position: 'absolute', right: '1rem' }}>
                  <FontAwesomeIcon
                    icon={showComplete ? faEye : faEyeSlash}
                    className="eyeicon"
                    style={{ cursor: 'pointer', color: 'white' }}
                    onClick={toggleShowComplete}
                  />
                </div>
              </div>
            </th>
            {dates.map((date, index) => {
              const currentDate = new Date(date.date);
              const isSunday = currentDate.getDay() === 0;
              return (
                <th
                  key={index}
                  className={isSunday ? 'th1th' : `th${date.day}`}
                  style={{ backgroundColor: isSunday ? 'red' : '', color: 'white' }}
                >
                  {currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}
                  <br />
                  [ {currentDate.toLocaleString('default', { weekday: 'short' })} ]
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody id="projectviewtbody">
          {projects.map((project, index) => (
            <tr key={index}>
              <td className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', padding: '0 0 0 0.5rem', fontSize: '13.44px' }}>
                {project.assigntaskpresent && (<FontAwesomeIcon icon={faPlus} style={{ cursor: 'pointer' }} />)} [{project.projectSalesOrder}]
                <a className="deleteproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Delete project" name={project.proid}>
                  <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                </a>
                <a className="editproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Edit project" id={project.proid} name={project.projectName} value={project.proj_status}>
                  <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                </a>
                <br />
                {project.projectName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}

export default TaskOverview;
