import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../cssfiles/TaskOverview2.css'; 
import Footer from '../components/Footer';
import eyeIcon from '../assets/eye.svg';
import eyeIconSlash from '../assets/eye-slash.svg';

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

function TaskOverview2() {
  const [showComplete, setShowComplete] = useState(document.cookie.includes('ShowComplete'));
  const toggleShowComplete = () => {
    const newValue = showComplete ? '1' : '0';
    document.cookie = `ShowComplete=${newValue};`;
    setShowComplete(!showComplete);
  };

  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    const startIndex = startDateIndex; // Start index for the new dates array
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startIndex + i)); // Adjusted date calculation
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
          <tr className="text-center small" style={{}}>
            <th style={{ width: '20rem', color: 'white' }}>Projects</th>
            <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white', alignItems: 'center' }}>
              Task Details
              <i className="taskEye" src={showComplete ? eyeIcon : eyeIconSlash} alt="Toggle Complete" style={{ paddingLeft: '60px', cursor: 'pointer', width: '20px', color: 'white' }} onClick={toggleShowComplete} />
            </th>
            {dates.slice(startDateIndex, startDateIndex + 7).map((date, index) => {
            const currentDate = new Date(date.date);
            const isSunday = currentDate.getDay() === 0;
            return (
              <th
                key={index} // Use index as key since dates may repeat across different weeks
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

export default TaskOverview2;
