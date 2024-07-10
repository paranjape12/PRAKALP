import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function AggregateTableCellsView({ employee, isComplete, dates }) {
    const [localShowTimeDetails, setLocalShowTimeDetails] = useState(true);
    const [projectsCount, setProjectsCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [averageCompletedTasks, setAverageCompletedTasks] = useState(0);
    const [projectTimeDetails, setProjectTimeDetails] = useState({
        required: 0,
        taken: 0,
        planned: 0,
        actual: 0 
    });
    const empId = employee.id;

    const handleToggleShowTimeComplete = (e) => {
        e.stopPropagation();
        setLocalShowTimeDetails(prev => !prev);
    };

    const seconds2dayhrmin = (ss) => {
        const h = Math.floor((ss % 28800) / 3600); // 8 hours = 28,800 seconds
        const d = Math.floor((ss % 230400) / 28800); // 8 hours * 30 days = 230,400 seconds
        const m = Math.floor((ss % 3600) / 60);

        const formattedH = h < 10 ? '0' + h : h;
        const formattedM = m < 10 ? '0' + m : m;
        const formattedD = d < 10 ? '0' + d : d;

        return ` ${formattedD} : ${formattedH} : ${formattedM} `;
    };

    useEffect(() => {
        axios.post('http://localhost:3001/api/empOverviewPrjIndividual', { employeeid: empId })
            .then(response => {
                const { projectsCount, totalTasks, approvedTaskCount } = response.data;
                setProjectsCount(projectsCount);
                setTotalTasks(totalTasks);
                setCompletedTasks(approvedTaskCount);
                setAverageCompletedTasks(totalTasks ? (approvedTaskCount / totalTasks) * 100 : 0);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, [empId]);

    useEffect(() => {
        axios.post('http://localhost:3001/api/EmpOverviewtaskDtlsAggView', { empid: empId, iscomplete: isComplete })
            .then(response => {
                const tasksResult = response.data;
                const totalTasks = tasksResult.reduce((acc, task) => acc + 1, 0);
                setTotalTasks(totalTasks);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, [empId, isComplete]);

    useEffect(() => {
        axios.post('http://localhost:3001/api/emptaskDtlsAggTimes', { empid: empId, iscomplete: isComplete })
            .then(response => {
                const { required, taken } = response.data;
                setProjectTimeDetails({ ...projectTimeDetails, required, taken });
            })
            .catch(error => {
                console.error('There was an error fetching the time details!', error);
            });
    }, [empId, isComplete]);

    useEffect(() => {
        // Format dates as an array of strings (YYYY-MM-DD)
        const formattedDates = dates.map(date => new Date(date.date).toISOString().slice(0, 10));

        // Fetch data for all dates at once
        axios.get('http://localhost:3001/api/empAggtasktimes', {
            params: {
                taskDate: formattedDates,
                assignedTo: empId
            }
        })
        .then(response => {
            const data = response.data.reduce((acc, { taskDate, planned, actual }) => {
                acc[taskDate] = { planned, actual };
                return acc;
            }, {});
            setProjectTimeDetails(prevDetails => ({ ...prevDetails, ...data }));
        })
        .catch(error => {
            console.error('Error fetching data for dates:', error);
        });
    }, [empId, dates]);


    return (
        <>
            <td style={{ fontSize: '13.5px' }}>
                <div>Total Projects Assigned: {projectsCount}</div>
                <div>Completed Tasks: {completedTasks}</div>
                <div>Average Completed Tasks: {averageCompletedTasks.toFixed(2)} %</div>
            </td>
            <td style={{ display: 'flex', padding: '0', borderStyle: 'none' }}>
                <div className="card">
                    <div className="card-header text-light" style={{ paddingRight: '3.7rem', paddingLeft: '0.3rem' }}>
                        <div style={{ fontSize: '14px' }} className="m-0 font-weight-bold text-left text-dark">
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
                <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <td title='Planned Timings' style={{ padding: '0.8rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none none none solid' }}>P</td>
                    <td title='Actual Timings' style={{ padding: '0.8rem 0.5rem', fontSize: '13.44px', borderStyle: 'solid none none solid' }}>A</td>
                </div>
            </td>
            {dates.map((_, i) => (
                <td key={i} style={{ padding: '0', fontSize: '14px' }}>
                    <tr
                        style={{ padding: '1.4rem 0.2rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '1.9rem' }}
                    >
                        {seconds2dayhrmin(projectTimeDetails.planned)}
                    </tr>
                    <tr style={{ padding: '1.4rem 0.17rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '1.9rem' }}>
                        {seconds2dayhrmin(projectTimeDetails.actual)}
                    </tr>
                </td>
            ))}
        </>
    );
}

export default AggregateTableCellsView;
