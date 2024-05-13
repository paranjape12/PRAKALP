import React, { useState, useEffect } from 'react';
import axios from 'axios';
import deletebtn from '../../assets/delete.png';
import editbtn from '../../assets/edit-text.png';
import infobtn from '../../assets/information-sign.png';
import '../TaskOverview/TaskOverviewGJC.css';
import TaskDetailsPopup from '../../components/TaskDetailsPopup';
import EditTask from '../../components/EditTask';
import AssignTask from '../../components/AssignTask';

function TaskOverview({ isPopupVisible, selectedProjectName }) {
  const [tasksData, setTasksData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const backgroundClass = isPopupVisible ? 'blurred-background' : '';
  const [editMode, setEditMode] = useState(false); // State for edit mode
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isConfirmDialogActive, setIsConfirmDialogActive] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAssignTask, setShowAssignTask] = useState(false);

  // Function to get the start and end dates of the current week
  const getWeekStartEndDates = (selectedDate) => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1));

    const weekEnd = new Date(selectedDate);
    weekEnd.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? 0 : 7));

    return {
      start: weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      end: weekEnd.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    };
  };

  const { start, end } = getWeekStartEndDates(selectedDate);
  const [weekDates, setWeekDates] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (selectedProjectName) {
      axios.get(`http://localhost:3001/tasksByProject/${selectedProjectName}`)
        .then((response) => {
          setTasksData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [selectedProjectName]);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('http://localhost:3001/getTasks')
      .then((response) => {
        setTasksData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  // Function to format date in a human-readable format
  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format date according to user's locale
  };

  const toggleTaskDetails = (taskId) => {
    setExpandedTasks(prevExpandedTasks => {
      if (prevExpandedTasks.includes(taskId)) {
        return prevExpandedTasks.filter(id => id !== taskId);
      } else {
        return [...prevExpandedTasks, taskId];
      }
    });
  };

  const isTaskExpanded = (taskId) => {
    return expandedTasks.includes(taskId);
  };

  const showTaskDetails = (task) => {
    setSelectedTask(task); // Set the selected task when the button is clicked
  };

  const hideTaskDetails = () => {
    setSelectedTask(null); // Reset selected task to hide the popup
  };

  const handleEditTask = (task) => {
    setEditTaskData(task);
  };

  const handleDeleteTask = (taskId) => {
    setTaskIdToDelete(taskId);
    setShowDeleteModal(true);
    setIsConfirmDialogActive(false);
  };

  const cancelDeleteTask = () => {
    setTaskIdToDelete(null);
    setShowDeleteModal(false);
    setIsConfirmDialogActive(false);
  };

  const confirmDeleteTask = () => {
    axios.delete(`http://localhost:3001/deleteTask/${taskIdToDelete}`)
      .then((response) => {
        console.log('Task deleted successfully');
        // Remove the deleted task from tasksData state
        setTasksData(tasksData.filter(task => task.id_t !== taskIdToDelete));
        setShowDeleteModal(false);
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
      });
  };

  const handleAddTask = (newTaskData) => {
    axios.post('http://localhost:3001/addTask', newTaskData)
      .then((response) => {
        console.log('Task added successfully');
        setTasksData([...tasksData, response.data]); // Add the new task to the tasksData state
        // Close the form/modal if needed
      })
      .catch((error) => {
        console.error('Error adding task:', error);
        // Handle error
      });
  };

  // Function to handle navigation to the next week
  const handleNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(selectedDate.getDate() + 7);
    setSelectedDate(nextWeek);
  };

  // Function to handle navigation to the previous week
  const handlePrevWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prevWeek);
  };

  useEffect(() => {
    // Set initial weekDates and rowData
    setWeekData(selectedDate);
  }, [selectedDate]);

  // Function to set the weekDates and rowData for the selected date
  const setWeekData = (date) => {
    setWeekDates(getWeekDates(date));
    fetchTaskData(date);
  };

  // Function to get an array of dates for the week corresponding to the selected date
  const getWeekDates = (selectedDate) => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1)); // Set to the first day of the week (Monday)
    const dates = [...Array(7)].map((_, index) => {
      const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
      return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' });
    });
    return dates;
  };

  // Fetch task data for the selected date
  const fetchTaskData = async (date) => {
    try {
      const response = await axios.get(`http://localhost:3001/tasksByDate/${date}`);
      const taskData = response.data;
      setRowData(taskData);
    } catch (error) {
      console.error('Error fetching task data:', error);
    }
  };


  const handleAssignTask = () => {
    setShowAssignTask(true); // Set the state to show the AssignTask component
  };

  return (
    <div className={`taskoverview ${backgroundClass}`}>
      {showAssignTask && <AssignTask onClose={() => setShowAssignTask(false)} />} {/* Render AssignTask component if showAssignTask is true */}

      <div className='task-overview-heading'><h2>Task Details</h2></div>
      <div className='total-t'>
        <div className='name-of-project'>
          Project Name:
          <div className='name-proj'>{selectedProjectName} </div>
        </div> {/* Display project name outside the table */}
        <div className='task-count'>Total tasks:
          <div className='name-proj'>{tasksData.length}</div>
        </div>
        {/* <div className="navigation-buttons">
          <button className="nav-button" onClick={handlePrevWeek}>Previous Week</button>
          <div className="navigation-dates">
            <div>{start} - {end}</div>
          </div>
          <button className="nav-button" onClick={handleNextWeek}>Next Week</button>
        </div> */}
      </div>

      <div className='table-container'>
        <div className="project-table-scroll">
          <table className="task-table">
            <thead>
              <tr>
                <th className="task-name-column">Task Details</th>

                {weekDates.map((date, index) => (
                  <th key={date} className={index === 6 ? 'sunday-cell' : ''}>{date}</th>
                ))}

              </tr>
            </thead>
            <tbody>
              {tasksData.map((task, index) => (
                <tr key={`${task.id_t}_${index}`} className="task-row">
                  <td className="task-name-column">
                    <div className='btn-pos'>
                      <div className="task-name" onClick={() => toggleTaskDetails(task.id_t)}>
                        <strong>{task.taskName}</strong>

                      </div>

                      <div className='action-buttons'>
                        <button className="show-task-details-button" onClick={() => showTaskDetails(task)}>
                          <img src={infobtn} alt="Edit" className='infoimg' />
                        </button>
                        <button className="edit-button-task" onClick={() => handleEditTask(task)}>
                          <img src={editbtn} alt="Edit" className='editimg' />
                        </button>
                        <button className="del-button-task" onClick={() => handleDeleteTask(task.id_t)}>
                          <img src={deletebtn} alt="Delete" className='delimg' />
                        </button>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((weekDate, index) => {
                    const taskDate = new Date(task.date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    });
                    const isMatchedDate = weekDate === taskDate;
                    return (
                      <td key={index} >
                        {isMatchedDate && (
                          <div>
                            <strong onClick={handleAssignTask} style={{ cursor: 'pointer' }}>P:</strong> {task.timeRequired}<br />
                            <div className="line"></div>
                            <strong>A:</strong> {task.timeTaken}
                          </div>
                        )}
                        {!isMatchedDate && (
                          <div>
                            <strong>P:</strong> <br />
                            <div className="line"></div>
                            <strong>A:</strong>
                          </div>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsPopup task={selectedTask} onClose={hideTaskDetails} />
      )}


      {editTaskData && (
        <EditTask taskData={editTaskData} onClose={() => setEditTaskData(null)} />
      )}


      {/* Delete Task Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal">
          <p>Are you sure you want to delete this task?</p>
          <div>
            <button onClick={confirmDeleteTask}>Yes</button>
            <button onClick={cancelDeleteTask}>No</button>
          </div>
        </div>
      )}

      {isConfirmDialogActive && ( // Render overlay only if confirm dialog is active
        <div className="overlay"></div>
      )}



    </div>
  );
}

export default TaskOverview;
