import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function AggregateTaskDetailsView({ project, employee, dates, localShowTimeDetails, handleToggleShowTimeComplete, seconds2dayhrmin, projectTimeDetails }) {
    const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectName, setProjectName] = useState(null);
    const [projects, setProjects] = useState(null);
    const [taskDetails, setTaskDetails] = useState({ tasks: 0, required: 0, taken: 0 });

    const fetchTaskDetails = async (assignBy, projectName) => {
        try {
            const response = await axios.get('http://localhost:3001/api/empOverviewTaskDtlsIndAggView', {
                params: { assignBy, projectName }
            });
            setTaskDetails(response.data);
        } catch (error) {
            console.error('Error fetching task details:', error);
        }
    };

    useEffect(() => {
        const assignBy = employee.id;
        const projectName = project.projectName;
        fetchTaskDetails(assignBy, projectName);
    }, []);

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
                "http://localhost:3001/api/updateProject",
                {
                    ProjectName: updatedProject.projectName,
                    Projectid: updatedProject.projectId,
                    projstatus: updatedProject.projectStatus,
                    editprojmodalisalesval: updatedProject.salesOrder,
                }
            );

            if (response.data === "Success") {
                // Update the projects state after saving
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

    return (
        <div style={{ width: '14rem' }}>
            <td style={{ minWidth: '14rem', padding: '0' }}>
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
                                <div title="Required">R: {seconds2dayhrmin(taskDetails.required)  || '00 : 00 : 00'}</div>
                                <div title="Taken">T: {seconds2dayhrmin(taskDetails.taken) || '00 : 00 : 00'}</div>
                            </>
                        )}
                    </div>
                </div>
            </td>
            <td style={{ padding: '0', width: '7rem' }}>
                <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div title='Planned Timings' style={{ padding: '0.4rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none none none solid' }}>P</div>
                    <div title='Actual Timings' style={{ padding: '0.4rem 0.5rem', fontSize: '13.44px', borderStyle: 'solid none none none' }}>A</div>
                </div>
            </td>
            {dates.map((date, i) => (
                <td key={i} style={{ padding: '0', fontSize: '15px', width: '7rem', overflow: 'hidden' }}>
                    <div style={{ paddingTop: '0.2rem', paddingRight: '7.68rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                        {seconds2dayhrmin(projectTimeDetails.planned[date.ymdDate] || 0)}
                    </div>
                    <div style={{ paddingTop: '0.2rem', paddingRight: '7.68rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                        {seconds2dayhrmin(projectTimeDetails.actual[date.ymdDate] || 0)}
                    </div>
                </td>
            ))}
        </div>
    );
}

export default AggregateTaskDetailsView;
