import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskInfoDialog from '../TaskOverview/TaskInfoPopup';
import EditTaskTeamLeadVersion from './EditTaskTeamLeadVersion';
import DeleteTaskPopup from '../TaskOverview/DeleteTaskPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCopyright, faPencilAlt, faCircleInfo, faTrashAlt, faL } from '@fortawesome/free-solid-svg-icons';
import AssignTaskDialog from '../Navbar/Dropdown/Assign Task/AssignTask';
import TaskCompletePopup from '../TaskOverview/TaskCompletePopup';
import { CircularProgress } from '@mui/material';


function GradientCircularProgress() {
    return (
        <td colSpan={8} style={{ padding: '1% 10%', minWidth: 'auto' }}>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff9900" />
                        <stop offset="50%" stopColor="#0099cc" />
                        <stop offset="100%" stopColor="#009933" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
        </td>
    );
}

function IndividualTaskDetailsView({ project, employee, dates, localShowTimeDetails, handleToggleShowTimeComplete, seconds2dayhrmin, columnWidths }) {
    const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskDetails, setTaskDetails] = useState({ tasks: [], taskemps: [] });
    const [taskInfoDetails, setTaskInfoDetails] = useState({});
    const [taskInfoDialogOpen, setTaskInfoDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskTimings, setTaskTimings] = useState([]);
    const [assignTaskOpen, setAssignTaskOpen] = useState(false);
    const [taskCompleteOpen, setTaskCompleteOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [taskCompletionTime, setTaskCompletionTime] = useState(null);
    const [selectedTimingId, setSelectedTimingId] = useState(null);


    const cache = {
        taskDetails: null,
        taskInfoDetails: {},
    };

    const seconds2hrmin = (ss) => {

        if (ss == 0) { return ` `; }
        const h = Math.floor(ss / 3600); // Total hours
        const m = Math.floor((ss % 3600) / 60); // Remaining minutes

        const formattedH = h < 10 ? '0' + h : h;
        const formattedM = m < 10 ? '0' + m : m;

        return `${formattedH} : ${formattedM}`;
    };

    const handleOpenDeleteTaskDialog = (task) => {
        setTaskToDelete(task);
        setDeleteTaskDialogOpen(true);
    };

    const handleCloseDeleteTaskDialog = () => {
        setTaskToDelete(null);
        setDeleteTaskDialogOpen(false);
    };

    const handleOpenTaskCompleteDialog = (time, timingId) => {
        setTaskCompletionTime(time);
        setSelectedTimingId(timingId);
        setTaskCompleteOpen(true);
    };

    const handleCloseTaskCompleteDialog = () => {
        setTaskCompleteOpen(false);
    };

    const fetchTaskDetails = async (assignBy, projectName) => {
        if (cache.taskDetails) {
            setTaskDetails(cache.taskDetails);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewTaskDtlsIndIndView`, {
                params: { assignBy, projectName }
            });
            cache.taskDetails = response.data;
            setTaskDetails(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task details:', error);
        }
    };

    const fetchTaskTimings = async (assignBy, projectName, taskDate) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewIndIndPATimes`, {
                params: { assignedTo: assignBy, projectName, taskDates: taskDate }
            });

            // Extract the new timings from the response
            const newTimings = response.data;

            // Combine existing timings with new timings
            setTaskTimings(prevTimings => {
                // Filter out duplicates based on timing properties (e.g., taskDate and taskid)
                const uniqueTimings = [...prevTimings, ...newTimings].filter((timing, index, self) =>
                    index === self.findIndex((t) => (
                        t.taskDate === timing.taskDate && t.taskid === timing.taskid && t.id === timing.id
                    ))
                );

                return uniqueTimings;
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task timings:', error);
        }
    };


    useEffect(() => {
        const assignBy = employee.id;
        const projectName = project.projectName;
        fetchTaskDetails(assignBy, projectName);
        dates.forEach(date => fetchTaskTimings(assignBy, projectName, date.ymdDate));
    }, [employee.id, project.projectName, dates]);

    const transformTimingsData = (timings) => {
        const groupedTimings = {};

        timings.forEach(timing => {
            const key = `${timing.id}_${timing.taskid}_${timing.taskDate}`;
            if (!groupedTimings[key]) {
                groupedTimings[key] = timing;
            }
        });

        return groupedTimings;
    };

    const transformedTimings = transformTimingsData(taskTimings);

    const fetchTaskInfoDetails = async (taskId) => {
        if (cache.taskInfoDetails[taskId]) {
            setTaskInfoDetails(cache.taskInfoDetails[taskId]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/taskInfoDialog`, {
                token,
                taskId,
            });
            cache.taskInfoDetails[taskId] = response.data;
            setTaskInfoDetails(response.data);
        } catch (error) {
            console.error('Failed to fetch task details:', error);
        }
    };

    const handleOpenEditTaskDialog = (task) => {
        setSelectedTask(task);
        setEditTaskDialogOpen(true);
    };

    const handleCloseEditTaskDialog = () => {
        setSelectedTask(null);
        setEditTaskDialogOpen(false);
    };

    const handleTaskInfoDialogOpen = async (task) => {
        setSelectedTask(task);
        await fetchTaskInfoDetails(task.id);
        setTaskInfoDialogOpen(true);
    };

    const handleTaskInfoDialogClose = () => {
        setTaskInfoDialogOpen(false);
        setTaskInfoDetails({});
    };

    useEffect(() => {
    }, [taskTimings, dates]);

    const handleOpenAssignTaskDialog = () => {
        setAssignTaskOpen(true);
    };

    const handleCloseAssignTaskDialog = () => {
        setAssignTaskOpen(false);
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

    return (
        <>
            {loading ? (
                <GradientCircularProgress />
            ) : (
                <div className="task-container" style={{ display: 'flex', flexDirection: 'column' }}>
                    {taskDetails.tasks.map((task, index) => (
                        <div key={index} className="p-0" style={{ width: '100%', display: 'flex', flexDirection: 'row', border: 'none' }}>
                            {/* Task Detail Section */}
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', margin: '0', padding: '0', width: `${columnWidths.taskDetailsWidth * 0.9}px` }}>
                                <div style={{ height: '2rem', display: 'flex', flexDirection: 'column', width: 'auto' }}>
                                    <div style={{ height: '1.5rem', display: 'flex', flexDirection: 'column', width: '100%', border: 'none' }}>
                                        {/* Task title in its own line */}
                                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                            <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.Status, task.aproved)}`} style={{ width:'100%',fontSize: '11px', margin: '0' }}>
                                                {task.TaskName}
                                            </h6>
                                        </div>

                                        {/* Icons in the next line */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                                            <FontAwesomeIcon icon={faTrashAlt} title="Delete Task" style={{ cursor: 'pointer', color: 'red', paddingLeft: '0.5rem' }} onClick={() => handleOpenDeleteTaskDialog(task)} />
                                            <FontAwesomeIcon icon={faPencilAlt} title="Edit Task" style={{ cursor: 'pointer', color: '#4e73df', paddingLeft: '0.5rem' }} onClick={() => handleOpenEditTaskDialog(task)} />
                                            {task.Status === "1" && <FontAwesomeIcon icon={faCopyright} color="#1cc88a" title="Marked as Complete" style={{ paddingLeft: '0.5rem' }} />}
                                            <FontAwesomeIcon icon={faCircleInfo} title="Task Info" style={{ cursor: 'pointer', color: '#4e73df', paddingLeft: '0.5rem' }} onClick={() => handleTaskInfoDialogOpen(task)} />
                                            {project.projectLastTask === 1 && <FontAwesomeIcon icon={faL} title="Last Task" style={{ color: '#36b9cc', paddingLeft: '0.5rem' }} />}
                                            <FontAwesomeIcon title="Show/Hide Time" icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete} style={{ cursor: 'pointer', color: '#4e73df', paddingLeft: '0.5rem' }} />
                                        </div>
                                    </div>


                                    {/* Task Dialogs */}
                                    <TaskInfoDialog key={task.id} open={taskInfoDialogOpen && selectedTask?.id === task.id} project={project} task={task} taskDetails={taskInfoDetails} handleClose={handleTaskInfoDialogClose} />
                                    <TaskCompletePopup open={taskCompleteOpen} task={task} handleClose={handleCloseTaskCompleteDialog} completionTime={taskCompletionTime} timingId={selectedTimingId} />
                                    {selectedTask && selectedTask.id === task.id && (
                                        <EditTaskTeamLeadVersion open={editTaskDialogOpen} handleClose={handleCloseEditTaskDialog} projectDetails={selectedTask} />
                                    )}
                                    {deleteTaskDialogOpen && taskToDelete?.id === task.id && (
                                        <DeleteTaskPopup task={taskToDelete} open={deleteTaskDialogOpen} handleClose={handleCloseDeleteTaskDialog} />
                                    )}

                                    {/* Show Time Details */}
                                    {localShowTimeDetails && (
                                        <div className="card-body text-left" style={{ padding: '0', fontSize: '11px', marginTop: '1rem', marginLeft:'0.3rem'}}>
                                            R: {seconds2dayhrmin(task.timetocomplete || 0)}
                                            <br />
                                            T: {seconds2dayhrmin(taskDetails.taskemps.find(emp => Number(emp.taskid) === task.id)?.actual || 0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timing Table */}
                            <table style={{ margin: '0', padding: '0', borderSpacing: '0' }}>
                                <tbody>
                                    {/* Planned Timings */}
                                    <tr>
                                        <td title="Planned Timings" style={{ padding: '0.5rem', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', border: 'none' }}>P</td>
                                        {dates.map((date, i) => (
                                            <td key={i} onClick={handleOpenAssignTaskDialog} title="Assign New Task" style={{ cursor: 'pointer', minWidth: `${(columnWidths.dateWidth / 16)}rem`, padding:'0.5rem', backgroundColor: 'gray', color: 'white', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                                                {loading ? '' : (
                                                    taskTimings.filter(timing => timing.taskDate === date.ymdDate && timing.taskid === task.id).map(timing => (
                                                        <span key={timing.taskid} style={{ fontWeight: '700' }}>{employee.Nickname} : {seconds2hrmin(timing.planned || 0)}</span>
                                                    ))
                                                )}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Actual Timings */}
                                    <tr>
                                        <td title="Actual Timings" style={{ padding: '0.5rem', fontSize: '13.44px' }}>A</td>
                                        {dates.map((date, i) => (
                                            <td key={i} style={{ minWidth: `${(columnWidths.dateWidth / 16)}rem`, backgroundColor: 'white', border: '1px solid gray', padding:'0.5rem', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                                                {loading ? '' : (
                                                    taskTimings.filter(timing => timing.taskDate === date.ymdDate && timing.taskid === task.id).map(timing => (
                                                        <><span key={timing.id} style={{ fontWeight: '700', color: '#1cc88a', cursor: 'pointer' }} onClick={() => handleOpenTaskCompleteDialog(timing.actual, timing.id)}>
                                                            {employee.Nickname} :</span> {seconds2hrmin(timing.actual || 0)}
                                                        </>
                                                    ))
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    {assignTaskOpen && (
                                        <AssignTaskDialog open={assignTaskOpen} onClose={handleCloseAssignTaskDialog} />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default IndividualTaskDetailsView;
