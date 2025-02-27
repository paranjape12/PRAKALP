import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';
import Disableemp from "../../assets/images/icons/letter-d.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AggregateTableCellsView from '../../components/EmployeeOverview/AggregateTableCellsView';
import IndividualTableCellsView from '../../components/EmployeeOverview/IndividualTableCellsView';
import axios from 'axios';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus, faMinus, faCircleInfo, faD } from '@fortawesome/free-solid-svg-icons';

import '../../pages/TaskOverview/TaskOverview.css';
import LogsPopup from '../../components/EmployeeOverview/LogsPopup';
import DeleteEmployeePopup from '../../components/EmployeeOverview/DeleteEmployeePopup';
import EnableEmployee from '../../components/EmployeeOverview/EnableEmployee';
import { useNavigate } from 'react-router-dom';
import EditEmployee from '../../components/Navbar/Dropdown/Manage Employee/EditEmployee';

function EmployeeOverview() {

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);
  const [showComplete, setShowComplete] = useState(() => {
    const storedValue = localStorage.getItem("showEmpCompletedTasks");
    return JSON.parse(storedValue) || false; // Ensure a default value
  });



  const [showExpand, setShowExpand] = useState({});
  const [projects, setProjects] = useState([]);
  const [showTimeDetails, setShowTimeDetails] = useState(true);
  const [projectTimeDetails, setProjectTimeDetails] = useState({});
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [menuicons, setMenuicons] = useState(false);
  const [logsPopupOpen, setLogsPopupOpen] = useState(false);
  const [deleteEmployeeOpen, setDeleteEmployeeOpen] = useState(false);
  const [enableEmployeeOpen, setEnableEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // Add state to track the selected employee ID for deletion
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false); // Manage dialog open/close
  const [settingsValue, setSettingsValue] = useState(""); // Store settings (Yes/No)
  const projectRef = useRef(null);
  const taskDetailsRef = useRef(null);
  const dateRef = useRef(null);
  const [projectsCount, setProjectsCount] = useState({});

  const onProjectsCountUpdate = useCallback((empId, projectsCount) => {
    setProjectsCount((prevState) => ({
      ...prevState,
      [empId]: projectsCount,
    }));
  }, []);


  const [columnWidths, setColumnWidths] = useState({
    projectWidth: 0,
    taskDetailsWidth: 0,
    dateWidth: 0,
  });

  const updateColumnWidths = () => {
    const projectWidth = projectRef.current ? projectRef.current.getBoundingClientRect().width : 0;
    const taskDetailsWidth = taskDetailsRef.current ? taskDetailsRef.current.getBoundingClientRect().width : 0;
    const dateWidth = dateRef.current ? dateRef.current.getBoundingClientRect().width : 0;

    setColumnWidths({
      projectWidth: projectWidth,
      taskDetailsWidth: taskDetailsWidth,
      dateWidth: dateWidth,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateColumnWidths);
    return () => {
      window.removeEventListener('resize', updateColumnWidths);
    };
  }, []);

  // Navbar

  const today = new Date();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(
        currentDate.setDate(currentDate.getDate() + startDateIndex + i)
      );
      const formattedDate = newDate.toISOString().slice(0, 10); // Format as "YYYY-MM-DD"
      newDates.push({
        date: newDate,
        ymdDate: formattedDate,
        dateString: newDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);

  const handleExpandTasks = (id) => {
    setShowExpand((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
    updateColumnWidths();
  };

  const seconds2hrmin = (ss) => {
    if (ss == 0) {
      return ` `;
    }
    const h = Math.floor(ss / 3600); // Total hours
    const m = Math.floor((ss % 3600) / 60); // Remaining minutes

    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;

    return `${formattedH} : ${formattedM}`;
  };

  const handleTodayClick = () => {
    setStartDateIndex(0);
  };

  const handleNextDayClick = () => {
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };

  // Table
  const toggleShowComplete = (e) => {
    e.stopPropagation();
    setShowComplete((prevShowComplete) => {
      const newValue = !prevShowComplete;
      // Store new value in localStorage
      localStorage.setItem("showEmpCompletedTasks", JSON.stringify(newValue));
      return newValue;
    });
  };

  // tbody
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const apiUrl = settingsValue === "yes"
          ? `${process.env.REACT_APP_API_BASE_URL}/allEmployeeOverview`
          : `${process.env.REACT_APP_API_BASE_URL}/empDropdown`;

        const response = await axios.post(apiUrl, {
          token: localStorage.getItem("token"),
        });

        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error("Error: Expected an array but got", response.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [settingsValue, showComplete]);



  useEffect(() => {
    const initialProjectTimeDetails = {};
    projects.forEach((project) => {
      initialProjectTimeDetails[project.projectId] = showTimeDetails;
    });
    setProjectTimeDetails(initialProjectTimeDetails);
  }, [projects, showTimeDetails]);


  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/taskOverview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: localStorage.getItem('token'),
          is_complete: showComplete ? '1' : '0',
        }),
      });

      const contentType = response.headers.get('Content-Type');

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle "No Task Assign" case
      if (data.message === 'No Task Assign') {
        setProjects([]); // Clear projects
      } else {
        setProjects(data); // If valid data, update projects
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showComplete]);

  const handleOpenLogsDialog = (employee) => {
    setSelectedEmployee(employee);
    setLogsPopupOpen(true);
  };

  const handleCloseLogsDialog = () => {
    setLogsPopupOpen(false);
    setSelectedEmployee(null);
  };


  // Define the callback function to handle successfully deletion
  const handleEmployeeDeleted = () => {
    // Fetch updated employees list

    // Fetch employees
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/empDropdown`, {
        token: localStorage.getItem("token"),
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error("Error: Expected an array but got", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  };


  // Delete employee popup
  const handleOpenDeleteEmployeeDialog = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setDeleteEmployeeOpen(true);
  };

  const handleCloseDeleteEmployeeDialog = () => {
    setSelectedEmployeeId(null);
    setDeleteEmployeeOpen(false);
  };

  const handleEmployeeEnable = () => {
    // Fetch updated employees list after enabling the employee
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/empDropdown`, {
        token: localStorage.getItem('token'),
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error('Error: Expected an array but got', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
      });
  };


  // Enable employee popup
  const handleOpenEnableEmployeeDialog = (employeeId) => {
    setSelectedEmployeeId(employeeId);  // Set the employee ID to enable
    setEnableEmployeeOpen(true);        // Open the dialog
  };

  const handleCloseEnableEmployeeDialog = () => {
    setSelectedEmployeeId(null);        // Reset employee ID
    setEnableEmployeeOpen(false);       // Close the dialog
  };

  //Setting filter Yes/No
  // Handler to open/close the SettingsDialog
  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
  };
  const handleCloseSettingsDialog = () => {
    setSettingsDialogOpen(false);
  };

  // Handler to get settings from SettingsDialog (onApply)
  const handleSettingsApply = (value) => {
    setSettingsValue(value); // Save the Yes/No value
    // console.log(settingsValue);
    setSettingsDialogOpen(false); // Close the dialog after applying settings
  };


  const handleOpenEditEmployeeDialog = () => {
    setEditEmployeeOpen(true);
  };

  const handleCloseEditEmployeeDialog = () => {
    setEditEmployeeOpen(false);
  };

  return (
    <>
      {dates.length > 0 && (
        <Navbar
          onTodayClick={handleTodayClick}
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
          settingsDialogOpen={settingsDialogOpen} // Pass open state to Navbar
          onSettingsApply={handleSettingsApply} // Pass apply handler to Navbar
          onSettingsClose={handleCloseSettingsDialog} // Pass close handler to Navbar
          onOpenSettingsDialog={handleOpenSettingsDialog} // Pass open handler to Navbar
        />
      )}
      <table className="table table-bordered text-dark" width="100%" cellSpacing="0" style={{ marginTop: '38px', fontFamily: "Nunito", tableLayout: 'fixed' }}>
        <thead className="text-white" id="theader" style={{ fontSize: '13px' }}>
          <tr className="text-center small" style={{ position: 'sticky', top: '2.45rem', zIndex: '5' }}>
            <th style={{ width: '12%', verticalAlign: 'revert', color: 'white' }}>Employee Name</th>
            <th ref={projectRef} style={{ width: '16%', verticalAlign: 'revert', color: 'white' }}>Projects</th>
            <th ref={taskDetailsRef} style={{ width: '16.5%', verticalAlign: 'revert', color: 'white', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ flexGrow: 1, textAlign: 'center' }}>Task Details</span>
                <div className="taskEye" style={{ position: 'absolute', right: '1rem' }}>
                  <FontAwesomeIcon
                    icon={showComplete ? faEye : faEyeSlash}
                    className="eyeicon"
                    style={{ cursor: "pointer", color: "white" }}
                    onClick={toggleShowComplete}
                  />
                </div>
              </div>
            </th>
            {dates.map((date, index) => {
              const currentDate = new Date(date.date);
              const isSunday = currentDate.getDay() === 0;
              return (
                <th ref={index === 0 ? dateRef : null}
                  key={index}
                  className={isSunday ? "th1th" : `th${date.day}`}
                  style={{
                    backgroundColor: isSunday ? "red" : "",
                    color: "white",
                  }}
                >
                  {currentDate.toLocaleString("default", {
                    month: "short",
                    day: "numeric",
                  })}
                  <br />[{" "}
                  {currentDate.toLocaleString("default", { weekday: "short" })}{" "}
                  ]
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="projectviewtbody">
          {employees.map((employee) => (
            <>
              <tr className="text-center small" key={employee.id}>
                <td className="p-1">
                  <div>
                    {projectsCount[employee.id] > 0 && (
                      <FontAwesomeIcon
                        className="text-primary"
                        icon={showExpand[employee.id] ? faMinus : faPlus} // Replace with appropriate icon
                        style={{ float: 'left', cursor: 'pointer', paddingTop: '0.2rem', paddingLeft: '0.3rem' }}
                        onClick={() => handleExpandTasks(employee.id)}
                      />
                    )}
                    {!showExpand[employee.id] && (
                      <>
                        {employee.disableemp === 1 ? (
                          <img
                            className="font-weight-bold"
                            src={Disableemp}
                            style={{ float: 'right', cursor: 'pointer', width: '18px', marginRight: '0.4rem' }}
                            onClick={() => handleOpenEnableEmployeeDialog(employee.id)}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            className="text-danger"
                            style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight: '0.5rem' }}
                            onClick={() => handleOpenDeleteEmployeeDialog(employee.id)}
                          />
                        )}
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          className="text-primary"
                          style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight: '0.5rem' }}
                          onClick={handleOpenEditEmployeeDialog}
                        />
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className="text-primary"
                          style={{ float: 'right', cursor: 'pointer', paddingTop: '0.2rem', paddingRight: '0.5rem' }}
                          onClick={() => handleOpenLogsDialog(employee)}
                        />
                      </>
                    )}
                    <br />
                    <div id="selempdrop" label="Select Employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                      <span key={employee.id} value={employee.Name} style={{ fontSize: '14px' }}>
                        {employee.Name}
                      </span>
                    </div>
                  </div>
                </td>
                {showExpand[employee.id] ? (
                  <IndividualTableCellsView seconds2hrmin={seconds2hrmin} employee={employee} isComplete={showComplete} dates={dates} columnWidths={columnWidths} />
                ) : (
                  <AggregateTableCellsView onProjectsCountUpdate={onProjectsCountUpdate} seconds2hrmin={seconds2hrmin} employee={employee} isComplete={showComplete} dates={dates} />
                )}
              </tr>
              {logsPopupOpen && (
                <LogsPopup
                  open={logsPopupOpen}
                  handleClose={handleCloseLogsDialog}
                  employee={selectedEmployee}
                />
              )}
            </>
          ))}

        </tbody>

      </table>
      {editEmployeeOpen && (
        <EditEmployee
          openFromEmployeeOverview={editEmployeeOpen}
          handleCloseFromEmployeeOverview={handleCloseEditEmployeeDialog} // Ensure this function exists
        />
      )}
      {deleteEmployeeOpen && (
        <DeleteEmployeePopup
          open={deleteEmployeeOpen}
          handleClose={handleCloseDeleteEmployeeDialog}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeDeleted={handleEmployeeDeleted} // Pass the callback function

        />
      )}
      {enableEmployeeOpen && (
        <EnableEmployee
          openEnableEmp={enableEmployeeOpen}
          CloseEnableEmp={handleCloseEnableEmployeeDialog} // Fixed prop name
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeEnabled={handleEmployeeEnable} // Callback for updating employee list after enabling
        />
      )}


      <Footer />
    </>
  );
}

export default EmployeeOverview;
 