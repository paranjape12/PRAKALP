import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const getBackgroundColor = (proj_status) => {
    switch (proj_status) {
        case 1:
            return '#ADD8E6';
        case 2:
            return '#ffff00ad';
        case 3:
            return '#ff8d00b8';
        case 4:
            return '#04ff00b8';
        default:
            return '#FFFFFF';
    }
};

function IndividualTableCellsView({ employee, isComplete, dates }) {
    const [localShowTimeDetails, setLocalShowTimeDetails] = useState(true);
    const [totalTasks, setTotalTasks] = useState(0);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState(null);
    const [expandedProjects, setExpandedProjects] = useState({});
    const [projectTimeDetails, setProjectTimeDetails] = useState({
        required: 0,
        taken: 0,
        planned: {},
        actual: {}
    });
    const empId = employee.id;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/EmpOverviewPlusMinus', {
                    params: { empid: empId, U_type: 'User' } // Adjust U_type as necessary
                });
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching project data:', error);
            }
        };

        fetchProjects();
    }, [empId]);

    const handleExpandTasks = (projectId) => {
        setExpandedProjects((prevState) => ({
            ...prevState,
            [projectId]: !prevState[projectId],
        }));
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

    const handleToggleShowTimeComplete = (e) => {
        e.stopPropagation();
        setLocalShowTimeDetails(prev => !prev);
    };

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

    return (
        <>
            {projects.map((project) => (
                <React.Fragment key={project.projectId}>
                    <tr>
                    <td style={{ fontSize: '13.5px', padding: '0',minWidth:'15rem' }}>
                        <div className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', padding: '0.5rem', fontSize: '13.44px' }}>
                            {project.assigntaskpresent && (
                                <FontAwesomeIcon
                                    icon={expandedProjects[project.projectId] ? faMinus : faPlus}
                                    style={{ cursor: 'pointer' }}
                                    title='Expand/Collapse Tasks'
                                    onClick={() => handleExpandTasks(project.projectId)}
                                />
                            )}
                            [{project.projectSalesOrder}]
                            <a className="deleteproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Delete project" name={project.proid} onClick={() => handleOpenDeleteProjectDialog(project.projectId, project.projectName)}>
                                <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                            </a>
                            <a className="editproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Edit project" id={project.projectId} name={project.projectName} value={project.proj_status} onClick={() => handleOpenEditProjectDialog(project)}>
                                <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                            </a>
                            <br />
                            {project.projectName}
                        </div>
                    </td>
                    <td style={{minWidth:'14rem', padding:'0'}}>
                        <div className="card">
                            <div className="text-center" style={{paddingRight: '4rem', paddingLeft: '0.3rem', backgroundColor:'lavender' }}>
                                <div style={{ fontSize: '14px' }} className="m-0 font-weight-bold text-left text-dark">
                                    Total Task Assign: 555
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
                                        <div title="Required">R: TBD</div>
                                        <div title="Taken">T: TBD</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </td>
                    <td style={{padding:'0'}}>
                        <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <div title='Planned Timings' style={{ padding: '0.4rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none none none solid' }}>P</div>
                            <div title='Actual Timings' style={{ padding: '0.4rem 0.5rem', fontSize: '13.44px', borderStyle: 'solid none none solid' }}>A</div>
                        </div>
                    </td>
                    
                    {dates.map((date, i) => (
                        <td key={i} style={{ padding: '0', fontSize: '15px', width: '7rem' }}>
                            <div style={{ paddingTop: '0.2rem', paddingRight:'7.68rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                                {seconds2dayhrmin(projectTimeDetails.planned[date.ymdDate] || 0)}
                            </div>
                            <div style={{ paddingTop: '0.2rem', paddingRight:'7.68rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                                {seconds2dayhrmin(projectTimeDetails.actual[date.ymdDate] || 0)}
                            </div>
                        </td>
                    ))}
                    </tr>
                </React.Fragment>
            ))}
        </>
    );
}

export default IndividualTableCellsView;
