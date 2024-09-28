import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getUserDataFromToken } from '../../utils/tokenUtils';

function AggregateTableCellsView({ employee, isComplete, dates, onProjectsCountUpdate }) {
    const [localShowTimeDetails, setLocalShowTimeDetails] = useState(true);
    const [projectsCount, setProjectsCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [averageCompletedTasks, setAverageCompletedTasks] = useState(0);
    const [projectTimeDetails, setProjectTimeDetails] = useState({
        required: 0,
        taken: 0,
        planned: {},
        actual: {}
    });
    const empId = employee.id;

    const handleToggleShowTimeComplete = (e) => {
        e.stopPropagation();
        setLocalShowTimeDetails(prev => !prev);
    };
    const userData = getUserDataFromToken();

    const seconds2dayhrmin = (ss) => {
        if (ss === 0) {
            return '';
        }

        const h = Math.floor((ss % 28800) / 3600); // 8 hours = 28,800 seconds
        const d = Math.floor((ss % 230400) / 28800); // 8 hours * 30 days = 230,400 seconds
        const m = Math.floor((ss % 3600) / 60);

        const formattedH = h < 10 ? '0' + h : h;
        const formattedM = m < 10 ? '0' + m : m;
        const formattedD = d < 10 ? '0' + d : d;

        return `${formattedD} : ${formattedH} : ${formattedM}`;
    };

    useEffect(() => {
        const filterState = JSON.parse(localStorage.getItem(
            userData.Type === "Employee" ? 'filterState' : 'filterStateAdmin'
        ));
        const projStates = filterState?.ev; // Default to [1,2,3,4] if ev is not found

        axios.post(`${process.env.REACT_APP_API_BASE_URL}/empOverviewPrjIndividual`, {
            employeeid: empId,
            projStates // Assuming projStates is defined earlier
        })
            .then(response => {
                const { projectsCount } = response.data;
                setProjectsCount(projectsCount);
                onProjectsCountUpdate(empId, projectsCount); // Update parent state
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, [employee.id, onProjectsCountUpdate]);


    useEffect(() => {
        // Function to fetch tasks data
        const fetchTasksData = async () => {
            try {
                const filterState = JSON.parse(localStorage.getItem(
                    userData.Type === "Employee" ? 'filterState' : 'filterStateAdmin'
                ));

                // Check if filterState exists and has 'ev' property
                const status = filterState?.ev;

                // Make the API call with the empId, isComplete, and status parameters
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/EmpOverviewtaskDtlsAggView`, {
                    empid: empId,
                    iscomplete: isComplete,
                    status
                });

                // Set the total tasks count from the response
                setTotalTasks(response.data.taskCount);
            } catch (error) {
                console.error('There was an error fetching the data!', error);
            }
        };

        // Call the fetch function
        fetchTasksData();

    }, [empId, isComplete]); // Dependency array, triggers on empId or isComplete changes



    useEffect(() => {
        // Function to fetch time details data
        const fetchTimeDetails = async () => {
            try {
                const filterState = JSON.parse(localStorage.getItem(
                    userData.Type === "Employee" ? 'filterState' : 'filterStateAdmin'
                ));

                // Check if filterState exists and has 'ev' property
                const status = filterState?.ev;

                if (!Array.isArray(status)) {
                    console.error('Invalid status format. Expected an array.');
                    return;
                }

                // Make the API call with the empId, isComplete, and status array
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/emptaskDtlsAggTimes`, {
                    empid: empId,
                    iscomplete: isComplete,
                    status
                });

                // Extract required and taken from response
                const { required, taken } = response.data;

                // Update projectTimeDetails with the response data
                setProjectTimeDetails(prevDetails => ({
                    ...prevDetails,
                    required,
                    taken
                }));
            } catch (error) {
                console.error('There was an error fetching the time details!', error);
            }
        };

        fetchTimeDetails();
    }, [empId, isComplete]);

    useEffect(() => {
        const fetchAggTaskTimes = async () => {
            try {
                const filterState = JSON.parse(localStorage.getItem(
                    userData.Type === "Employee" ? 'filterState' : 'filterStateAdmin'
                ));
    
                // Check if filterState exists and has 'ev' property
                const status = filterState?.ev;
    
                if (!Array.isArray(status)) {
                    console.error('Invalid status format. Expected an array.');
                    return;
                }
    
                // Convert dates to the required format (YYYY-MM-DD)
                const startDate = new Date(dates[0].date).toISOString().slice(0, 10);
                const endDate = new Date(dates[dates.length - 1].date).toISOString().slice(0, 10);
    
                // Make the API call to empAggtasktimes, passing the status array in params
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empAggtasktimes`, {
                    params: {
                        startDate: startDate,
                        endDate: endDate,
                        assignedToEmp: empId,
                        status: status // Pass status array here
                    }
                });
    
                // Process the response data
                const data = response.data.reduce((acc, { taskDate, planned, actual }) => {
                    const dateObject = new Date(taskDate);
                    const formattedDateStr = dateObject.toLocaleDateString();
                    const [day, month, year] = formattedDateStr.split("/").map(Number);
                    const convertedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
                    acc.planned[convertedDateStr] = planned;
                    acc.actual[convertedDateStr] = actual;
                    return acc;
                }, { planned: {}, actual: {} });
    
                // Update projectTimeDetails with the new data
                setProjectTimeDetails(prevDetails => ({ ...prevDetails, ...data }));
            } catch (error) {
                console.error('Error fetching data for dates:', error);
            }
        };
    
        fetchAggTaskTimes();
    }, [empId, dates]);
    

    return (
        <>
            {projectsCount > 0 && (
                <>
                    <td style={{ fontSize: '13.5px', padding: '0.2rem' }}>
                        <div>Total Projects Assigned: {projectsCount}</div>
                        <div>Completed Tasks: {completedTasks}</div>
                        <div>Average Completed Tasks: {averageCompletedTasks.toFixed(0)} %</div>
                    </td>
                    <td style={{ display: 'flex', padding: '0', borderStyle: 'none' }}>
                        <div className="card" style={{ minWidth: '90%' }}>
                            <div className="card-header text-light" style={{ paddingTop: '0', paddingBottom: '0' }}>
                                <div style={{ fontSize: '12.5px' }} className="m-0 font-weight-bold text-left text-dark">
                                    Total Task Assign: {totalTasks}
                                    <a className="show p-0" style={{ float: 'right' }} title="Show/Hide Time">
                                        <div className="taskEye" style={{ position: 'absolute', right: '0.5rem' }}>
                                            <FontAwesomeIcon
                                                icon={localShowTimeDetails ? faEye : faEyeSlash}
                                                className="eyeicon"
                                                style={{ cursor: 'pointer', color: '#1e7ee4' }}
                                                onClick={handleToggleShowTimeComplete}
                                            />
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="card-body text-left p-1">
                                {localShowTimeDetails && (
                                    <>
                                        <div title="Required">R: {seconds2dayhrmin(projectTimeDetails.required) || '00:00:00'}</div>
                                        <div title="Taken">T: {seconds2dayhrmin(projectTimeDetails.taken) || '00:00:00'}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ width: '10%', verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <td title='Planned Timings' style={{ padding: '0.4rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none none none solid' }}>P</td>
                            <td title='Actual Timings' style={{ padding: '0.4rem 0.5rem', fontSize: '13.44px', borderStyle: 'solid none none solid' }}>A</td>
                        </div>
                    </td>
                    {
                        dates.map((date, i) => (
                            <td key={i} style={{ padding: '0', fontSize: '15px', width: '7rem' }}>
                                <tr style={{ paddingTop: '0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                                    {seconds2dayhrmin(projectTimeDetails.planned[date.ymdDate] || 0)}
                                </tr>
                                <tr style={{ paddingTop: '0.4rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                                    {seconds2dayhrmin(projectTimeDetails.actual[date.ymdDate] || 0)}
                                </tr>
                            </td>
                        ))
                    }
                </>
            )}

            {!projectsCount && (
                <td style={{ textAlign: 'center' }} colSpan={9}>No Projects Assigned.</td>
            )}
        </>
    );
}

export default AggregateTableCellsView;
