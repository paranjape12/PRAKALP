import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../cssfiles/TaskOverview2.css'; // Import your CSS file
import Footer from '../components/Footer';

const today = new Date(); // Get today's date

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
  const [showComplete, setShowComplete] = useState(
    // Check for cookie or default to 1 (show all tasks)
    document.cookie.includes('ShowComplete=0') ? 0 : 1
  );

  const [completeIconClass, setCompleteIconClass] = useState(
    showComplete ? 'fa fa-eye' : 'fa fa-eye-slash'
  );

  const [dates, setDates] = useState([]);

  useEffect(() => {
    const newDates = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(today.setDate(today.getDate() + i));
      newDates.push({
        dateString: newDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
    }
    setDates(newDates);
  }, []);

  const handleShowCompleteToggle = () => {
    setShowComplete((prevShowComplete) => !prevShowComplete);
    setCompleteIconClass((prevIconClass) =>
      prevIconClass === 'fa fa-eye' ? 'fa fa-eye-slash' : 'fa fa-eye'
    );
    // Update your logic for setting cookie or handling show/hide functionality
  };

  return (
    <div>
      <Navbar />
      <table className="table table-bordered text-dark" width="100%" cellspacing="0" style={{marginTop:'38px', fontFamily: "Nunito"}}>
        <thead className="text-white" id="theader">
          <tr className="text-center small" style={{}}>
            <th style={{ width: '20rem', color:'white' }}>Projects</th>
            <th colSpan="2" style={{ verticalAlign: 'revert', color:'white' }}>
              Task Details
              <input
                type="hidden"
                id="completeHiden"
                value={showComplete} // Set hidden input value
              />
              <a
                className="show_complete pr-2"
                style={{ float: 'right', color: 'white' }}
                title="Show/Hide Completed Task"
                onClick={handleShowCompleteToggle} // Handle toggle click
              >
                <i className={completeIconClass}></i>
              </a>
            </th>
            {dates.map((date) => (
              <th
                key={date.dateString}
                className={date.isSunday ? 'th1th' : `th${date.day}`}
                style={{ backgroundColor: date.isSunday ? 'red' : '',color:'white' }}
              >
                {date.dateString}
                <br />
                [ {date.day} ]
              </th>
            ))}
          </tr>
        </thead>
        <tbody id="projectviewtbody">
          {/* Your logic for populating the table body with task data */}
        </tbody>
      </table>
      <Footer/>
    </div>
  );
}

export default TaskOverview2;
