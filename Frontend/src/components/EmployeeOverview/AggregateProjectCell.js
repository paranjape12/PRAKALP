import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AggregateProjectCell({ employee }) {
    const [projectsCount, setProjectsCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [averageCompletedTasks, setAverageCompletedTasks] = useState(0);
    const empId = employee.id; 

    useEffect(() => {
        // Fetch data from the API
        axios.post('http://localhost:3001/api/empOverviewPrjIndividual', { employeeid: empId })
            .then(response => {
                const { projectsCount, totalTasks, approvedTaskCount } = response.data;
                setProjectsCount(projectsCount)
                setTotalTasks(totalTasks);
                setCompletedTasks(approvedTaskCount);
                setAverageCompletedTasks(totalTasks ? (approvedTaskCount / totalTasks)*100 : 0);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, [empId]);

    return (
        <>
            <div>Total Projects Assigned: {projectsCount}</div>
            <div>Completed Tasks: {completedTasks}</div>
            <div>Average Completed Tasks: {averageCompletedTasks.toFixed(2)} %</div>
        </>
    );
}

export default AggregateProjectCell;
