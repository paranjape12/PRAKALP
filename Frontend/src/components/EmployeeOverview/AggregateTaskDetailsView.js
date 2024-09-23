import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import { getUserDataFromToken } from '../../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask';

function AggregateTaskDetailsView({ project, employee, dates, localShowTimeDetails, handleToggleShowTimeComplete, seconds2dayhrmin, columnWidths }) {
    const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectName, setProjectName] = useState(null);
    const [projects, setProjects] = useState(null);
    const [projectTimeDetails, setProjectTimeDetails] = useState({});
    const [taskDetails, setTaskDetails] = useState({ tasks: 0, required: 0, taken: 0 });

    const fetchTaskDetails = async (assignBy, projectName) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewTaskDtlsIndAggView`, {
                params: { assignBy, projectName }
            });
            setTaskDetails(response.data);
        } catch (error) {
            console.error('Error fetching task details:', error);
        }
    };

    const fetchProjectTimeDetails = async (projectName, userId, startDate, userRole, userNickname) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewIndAggPATimes`, {
                params: { projectName, userId, startDate, userRole, userNickname }
            });

            const updatedProjectTimeDetails = { planned: {}, actual: {}, projectName: response.data.data[0]?.projectName || '' };
            response.data.data.forEach(row => {
                updatedProjectTimeDetails.planned[row.taskDate] = row.planned || 0;
                updatedProjectTimeDetails.actual[row.taskDate] = row.actual || 0;
            });

            // Set project-specific time details
            setProjectTimeDetails(prevState => ({
                ...prevState,
                [project.projectId]: updatedProjectTimeDetails,
            }));
        } catch (error) {
            console.error('Error fetching project time details:', error);
        }
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

    const decrypToken = getUserDataFromToken();

    useEffect(() => {
        const assignBy = decrypToken.id;
        const projectName = project.projectName;
        const startDate = dates[0]?.ymdDate;
        const userRole = decrypToken.Type;
        const userNickname = decrypToken.Nickname;
        fetchTaskDetails(assignBy, projectName);
        fetchProjectTimeDetails(projectName, assignBy, startDate, userRole, userNickname);
    }, [employee.id, project.projectName, dates]);


    function getTaskStatusColor(requiredTime, takenTime) {
        if (requiredTime < takenTime) {
            return "bg-danger border border-danger";
        } else if (takenTime === 0) {
            return "bg-warning border border-warning";
        } else {
            return "bg-success border border-success";
        }
    }

    const handleOpenEditProjectDialog = (project) => {
        setSelectedProject({
            salesOrder: project.projectSalesOrder,
            projectName: project.projectName,
            projectStatus: project.proj_status,
            projectId: project.projectId,
        });
        setEditProjectDialogOpen(true);
    };

    const handleCloseEditProjectDialog = () => {
        setEditProjectDialogOpen(false);
        setSelectedProject(null);
    };

    const handleSaveEditProject = async (updatedProject) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/updateProject`,
                {
                    ProjectName: updatedProject.projectName,
                    Projectid: updatedProject.projectId,
                    projstatus: updatedProject.projectStatus,
                    editprojmodalisalesval: updatedProject.salesOrder,
                }
            );

            if (response.data === "Success") {
                setProjects((prevProjects) =>
                    prevProjects.map((proj) =>
                        proj.projectSalesOrder === updatedProject.salesOrder
                            ? {
                                ...proj,
                                projectName: updatedProject.projectName,
                                proj_status: updatedProject.projectStatus,
                            }
                            : proj
                    )
                );
            } else {
                console.error("Failed to update project:", response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleOpenDeleteProjectDialog = (projectId, projectName) => {
        setSelectedProjectId(projectId);
        setDeleteProjectDialogOpen(true);
        setProjectName(projectName);
    };

    const handleCloseDeleteProjectDialog = () => {
        setSelectedProjectId(null);
        setDeleteProjectDialogOpen(false);
    };

    const handleOpenAddTaskDialog = () => {
        setAddTaskDialogOpen(true);
    };

    const handleCloseAddTaskDialog = () => {
        setAddTaskDialogOpen(false);
    };    

    return (
        <div style={{ width: '100%' }}>
            <td style={{ minWidth: `${columnWidths.taskDetailsWidth * 0.93}px`, padding: '0', border: 'none' }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className={`text-center ${getTaskStatusColor(project.requiredTime, project.takenTime)}`} style={{ paddingRight: '4rem', paddingLeft: '0.3rem' }}>
                        <div style={{ fontSize: '14px' }} className="m-0 font-weight-bold text-left text-light">
                            Total Task Assign: {taskDetails.tasks}
                            <a className="show p-0" style={{ float: 'right' }} title="Show/Hide Time">
                                <div className="taskEye" style={{ position: 'absolute', right: '0.5rem' }}>
                                    <FontAwesomeIcon
                                        icon={localShowTimeDetails ? faEyeSlash : faEye}
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
                                <div title="Required">R: {seconds2dayhrmin(taskDetails.required) || '00 : 00 : 00'}</div>
                                <div title="Taken">T: {seconds2dayhrmin(taskDetails.taken) || '00 : 00 : 00'}</div>
                            </>
                        )}
                    </div>
                </div>
            </td>
            <td style={{ padding: '0', width: '6.5rem' }}>
                <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div title='Planned Timings' style={{ padding: '0.4rem 0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none none none solid' }}>P</div>
                    <div title='Actual Timings' style={{ padding: '0.4rem 0.4rem', fontSize: '13.44px', borderStyle: 'solid none none none', borderWidth: 'thin' }}>A</div>
                </div>
            </td>
            {dates.map((date, i) => (
                <td key={i} style={{ padding: '0', fontSize: '15px', width: `${(columnWidths.dateWidth)*0.99}px`, overflow: 'hidden' }}>
                    <div
                        title='Create New Task'
                        style={{
                            cursor: 'pointer',
                            paddingTop: '0.2rem',
                            width: `${(columnWidths.dateWidth)*0.99}px`,
                            display: 'block',
                            backgroundColor: 'gray',
                            color: 'white',
                            border: 'none',
                            textAlign: 'center',
                            height: '2rem',
                            verticalAlign: 'middle',
                        }}
                        onClick={handleOpenAddTaskDialog}
                    >
                        {seconds2hrmin(projectTimeDetails[project.projectId]?.planned[date.ymdDate] || 0)}
                    </div>
                    <div
                        style={{
                            paddingTop: '0.2rem',
                            width: `${(columnWidths.dateWidth)*0.99}px`,
                            display: 'block',
                            borderStyle: 'solid none none none',
                            textAlign: 'center',
                            height: '2rem',
                            verticalAlign: 'middle',
                            borderWidth: 'thin',
                        }}
                    >
                        {seconds2hrmin(projectTimeDetails[project.projectId]?.actual[date.ymdDate] || 0)}
                    </div>
                </td>
            ))}

            {<AddTaskModal projectName={project.projectName} open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} />}
        </div>
    );
}

export default AggregateTaskDetailsView;
