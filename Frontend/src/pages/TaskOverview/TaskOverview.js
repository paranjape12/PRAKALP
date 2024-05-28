import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import '../../pages/TaskOverview/TaskOverview.css';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
          {/* Your logic for populating the table body with task data */}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}

export default TaskOverview;
