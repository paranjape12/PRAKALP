import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './ProjectOverview.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import {  faTrashAlt, faPencilAlt, } from '@fortawesome/free-solid-svg-icons';

import '../../pages/TaskOverview/TaskOverview.css';
import EditProjectPopup from '../../components/TaskOverview/EditProjectPopup';
import DeleteProjectPopup from '../../components/TaskOverview/DeleteProjectPopup';

function ProjectOverview() {
    const today = new Date();
    const daysOfWeek = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
    ];

    const [dates, setDates] = useState([]);
    const [startDateIndex, setStartDateIndex] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/'); 
        }
    }, [navigate]);

    useEffect(() => {
        const newDates = [];
        let currentDate = new Date(today);
        const startIndex = startDateIndex;
        for (let i = 0; i < 7; i++) {
            const newDate = new Date(currentDate.setDate(currentDate.getDate() + startIndex + i));
            newDates.push({
                date: newDate,
                dateString: newDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                day: daysOfWeek[newDate.getDay()],
                isSunday: newDate.getDay() === 0,
            });
            currentDate = new Date(today);
        }
        setDates(newDates);
    }, [startDateIndex]);

    const handleNextDayClick = () => {
        const nextIndex = startDateIndex + 7;
        setStartDateIndex(nextIndex);
    };

    const handlePreviousDayClick = () => {
        const previousIndex = startDateIndex - 7;
        setStartDateIndex(previousIndex);
    };

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
     

      
    //Calculate project
    // const [projects, setProjects] = useState([]);
    // const [totalProjects, setTotalProjects] = useState(0);
  
    // useEffect(() => {
    //   // Fetch projects
    //   axios.get('http://localhost:3001/api/projectview')
    //     .then(response => {
    //       if (response.data.result === 'projectfound') {
    //         const projectData = response.data.data;
    //         setProjects(projectData);
    //         setTotalProjects(projectData.length); // Update total project count
    //       } else {
    //         console.error('No projects found');
    //       }
    //     })
    //     .catch(error => {
    //       console.error('Error fetching projects:', error);
    //     });
    // }, []);


    // const [projects, setProjects] = useState([]);

    
   
     
    // useEffect(() => {
    //     // Replace this with your actual data fetching logic
    //     fetch('/api/projects')
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.result === 'projectfound') {
    //                 setProjects(data.data);
    //             }
    //         })
    //         .catch(error => console.error('Error fetching projects:', error));
    // }, []);

    // const getStatusStyle = (status) => {
    //     switch(status) {
    //         case "1":
    //             return { backgroundColor: '#ADD8E6', color: 'black' };
    //         case "2":
    //             return { backgroundColor: '#ffff00ad', color: 'black' };
    //         case "3":
    //             return { backgroundColor: '#ff8d00b8', color: 'black' };
    //         case "4":
    //             return { backgroundColor: '#04ff00b8', color: 'black' };
    //         default:
    //             return { backgroundColor: '#FFFFFF', color: 'black' };
    //     }
    // };

    //Taskoverview
    const [showComplete, setShowComplete] = useState(() => {
        // Get initial state from localStorage or set default value to true
        const storedValue = localStorage.getItem('showComplete');
        return storedValue ? JSON.parse(storedValue) : true;
        
    });
    
    //   const [expandedProjects, setExpandedProjects] = useState({});
      const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
      const [selectedProject, setSelectedProject] = useState(null);
      const [projects, setProjects] = useState([]);
      const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
      const [selectedProjectId, setSelectedProjectId] = useState(null);
      const [projectName, setProjectName] = useState(null);
      const [showTimeDetails, setShowTimeDetails] = useState(true);
      const [projectTimeDetails, setProjectTimeDetails] = useState({});
    
      useEffect(() => {
        const initialProjectTimeDetails = {};
        projects.forEach((project) => {
          initialProjectTimeDetails[project.projectId] = showTimeDetails;
        });
        setProjectTimeDetails(initialProjectTimeDetails);
      }, [projects, showTimeDetails]);
    

      const fetchProjects = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/taskOverview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: localStorage.getItem('token'),
              is_complete: showComplete ? '1' : '0'
            })
          });
    
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
          } else {
            console.error('Failed to fetch projects');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
      useEffect(() => {
        fetchProjects();
      }, [showComplete]);
    
      // Fetch projects every 4 second to update colors
      useEffect(() => {
        const intervalId = setInterval(() => {
          fetchProjects();
        }, 4000);
    
        return () => clearInterval(intervalId);
      }, []);
    
     
    
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
          const response = await axios.post('http://localhost:3001/api/updateProject', {
            ProjectName: updatedProject.projectName,
            Projectid: updatedProject.projectId,
            projstatus: updatedProject.projectStatus,
            editprojmodalisalesval: updatedProject.salesOrder
          });
    
          if (response.data === 'Success') {
            // Update the projects state after saving
            setProjects((prevProjects) =>
              prevProjects.map((proj) =>
                proj.projectSalesOrder === updatedProject.salesOrder
                  ? { ...proj, projectName: updatedProject.projectName, proj_status: updatedProject.projectStatus }
                  : proj
              )
            );
          } else {
            console.error('Failed to update project:', response.data);
          }
        } catch (error) {
          console.error('Error:', error);
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
        <div>
            {dates.length > 0 && (
                <Navbar
                    onPreviousDayClick={handlePreviousDayClick}
                    onNextDayClick={handleNextDayClick}
                    dates={dates}
                />
            )}
            <div className="container-fluid p-0 mt-5">
                <div className="card shadow">
                    <div className="card-body p-0">
                        <div className="table-responsive text-dark" id="tb1respon">
                            <table id="sum_table" className="table table-bordered text-dark" width="100%" cellSpacing="0">
                                <thead className="text-white" id="theaderproject" >
                                    <tr className="text-center small totalColumn" id='totalColumn1'>
                                        <th rowSpan="4" style={{ width: '20rem' }}>Projects</th>
                                        <th colSpan="11">Task Status</th>
                                        {dates.map((date, index) => (
                                            <th
                                                key={index}
                                                colSpan="2"
                                                rowSpan="3"
                                                style={{ backgroundColor: date.isSunday ? 'red' : '', color: 'white' }}
                                            >
                                                {date.dateString}<br />
                                                [ {date.day} ]
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="text-center small totalColumn" id='totalColumn1'>
                                        <th className="text-light" colSpan="3">To tal</th>
                                        <th className="text-light" colSpan="2">YTS</th>
                                        <th className="text-light" colSpan="3">WIP</th>
                                        <th className="text-light" colSpan="3">CMP</th>
                                    </tr>
                                    <tr className="text-center small totalColumn"  id='totalColumn1'>
                                        <th className="text-light">Nos</th>
                                        <th className="text-light" colSpan="2">Hrs</th>
                                        <th className="text-light">Nos</th>
                                        <th className="text-light">Hrs</th>
                                        <th className="text-light">Nos</th>
                                        <th className="text-light" colSpan="2">Hrs</th>
                                        <th className="text-light">Nos</th>
                                        <th className="text-light" colSpan="2">Hrs</th>
                                    </tr>
                                    <tr className="text-center small totalColumn">
                                        <th className="bg-total text-dark"></th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-total text-dark"></th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-total text-dark"></th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-total text-dark"></th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                        <th className="bg-secondary text-dark">P</th>
                                        <th className="bg-actual text-dark">A</th>
                                    </tr>
                                    <tr className="text-center small totalColumn" id='totalCol1' >
                                        <th className="pname_total_count" style={{ textAlign: 'left' }}>Total </th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                        <th className="totalCol"></th>
                                    </tr>
                                </thead>
                                 <tbody id="projectviewtbody">
                                {projects.map((project, index) => (
                                <tr key={index}>
                                    
                                <td className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', padding: '0 0 0 0.5rem', fontSize: '13.44px' }}>
                                    
                                    [{project.projectSalesOrder}]
                                    <a className="deleteproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Delete project" name={project.proid} onClick={() => handleOpenDeleteProjectDialog(project.projectId, project.projectName)}>
                                    <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                                    </a>
                                    <a className="editproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Edit project" id={project.projectId} name={project.projectName} value={project.proj_status} onClick={() => handleOpenEditProjectDialog(project)}>
                                    <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                                    </a>
                                    <br />
                                    {project.projectName}
                                    
                                </td>
                                
                                <td className="text-center addtask" name={project.projectName} style={{ fontSize: '13.44px', verticalAlign: 'middle' }} colSpan="9">
                                         No Task Found 
                                </td>
                 
              
              
            </tr>
             ))} 
             
            
            {/* <tbody id="projectviewtbody">
                {projects.map((valueproject, index) => (
                    <React.Fragment key={index}>
                        {valueproject.task_details_count === "0" ? (
                            <tr className="small">
                                <td className="text-left pname_total" style={{ verticalAlign: 'top', ...getStatusStyle(valueproject.Status) }}>
                                    [ {valueproject.sales_order} ]
                                    <button className="deleteproj p-1" value="2" title="" name={valueproject.id} style={{ float: 'right' }}><i className="fas fa-trash-alt text-danger"></i></button>
                                    <button className="editproj p-1" value={valueproject.Status} title={valueproject.sales_order} name={valueproject.ProjectName} id={valueproject.id} style={{ float: 'right' }}><i className="fas fa-pencil-alt text-primary"></i></button>
                                    <br />
                                    {valueproject.ProjectName}
                                </td>
                                <td className="text-center small" colSpan="28">No Task Found</td>
                            </tr>
                        ) : (
                            <tr className="small">
                                <td className="text-left pname_total" style={{ verticalAlign: 'top', ...getStatusStyle(valueproject.Status) }}>
                                    [ {valueproject.sales_order} ]
                                    <button className="deleteproj p-1" value="2" title="" name={valueproject.id} style={{ float: 'right' }}><i className="fas fa-trash-alt text-danger"></i></button>
                                    <button className="editproj p-1" value={valueproject.Status} title={valueproject.sales_order} name={valueproject.ProjectName} id={valueproject.id} style={{ float: 'right' }}><i className="fas fa-pencil-alt text-primary"></i></button>
                                    <br />
                                    {valueproject.ProjectName}
                                </td>
                                <td className="rowDataSd bg-total">{valueproject.task_details_count}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.Total_Hrs_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.Total_Hrs_A}</td>
                                <td className="rowDataSd bg-total">{valueproject.Total_YTC}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.YTS_Hrs_P}</td>
                                <td className="rowDataSd bg-total">{valueproject.total_wip_comp_task}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.WIP_Hrs_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.WIP_Hrs_A}</td>
                                <td className="rowDataSd bg-total">{valueproject.total_comp_task}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.COMP_Hrs_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.COMP_Hrs_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d1_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d1_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d2_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d2_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d3_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d3_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d4_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d4_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d5_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d5_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d6_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d6_A}</td>
                                <td className="rowDataSd bg-secondary">{valueproject.total_d7_P}</td>
                                <td className="rowDataSd bg-actual">{valueproject.total_d7_A}</td>
                            </tr>
                        )}
                    </React.Fragment>
                ))} */}
            </tbody>




                
            </table>
        {selectedProject && (
        <EditProjectPopup
          open={editProjectDialogOpen}
          handleClose={handleCloseEditProjectDialog}
          projectDetails={selectedProject}
          onSave={handleSaveEditProject}
        />
      )}
      {selectedProjectId && (
        <DeleteProjectPopup
          open={deleteProjectDialogOpen}
          handleClose={handleCloseDeleteProjectDialog}
          selectedProjectId={selectedProjectId}
        />
      )}
      
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        
    );
}

export default ProjectOverview;
