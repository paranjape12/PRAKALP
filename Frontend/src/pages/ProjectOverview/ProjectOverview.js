import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./ProjectOverview.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faTrashAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { Buffer } from "buffer";
import "../../pages/TaskOverview/TaskOverview.css";
import { getUserDataFromToken } from '../../utils/tokenUtils';
import EditProjectPopup from "../../components/TaskOverview/EditProjectPopup";
import DeleteProjectPopup from "../../components/TaskOverview/DeleteProjectPopup";

const ProjectOverview = (project,employee) => {
  const today = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [dates, setDates] = useState([]);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [startDateIndex, setStartDateIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectDetails, setProjectDetails] = useState({});
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [totalPlannedSum, setTotalPlannedSum] = useState(0);
  const [totalActualSum, setTotalActualSum] = useState(0);
  const [totalYTSNosSum, setTotalYTSNosSum] = useState(0);
  const [totalYTSPlannedSum, setTotalYTSPlannedSum] = useState(0);
  const [totalWIPNosSum, setTotalWIPNosSum] = useState(0);
  const [totalWIPPlannedSum, setTotalWIPPlannedSum] = useState(0);
  const [totalWIPActualSum, setTotalWIPActualSum] = useState(0);
  const [totalCMPNosSum, setTotalCMPNosSum] = useState(0);
  const [totalCMPPlannedSum, setTotalCMPPlannedSum] = useState(0);
  const [totalCMPActualSum,setTotalCMPActualSum]= useState(0);
  const [projectTimeDetails, setProjectTimeDetails] = useState({});
  const decrypToken = getUserDataFromToken();
  const [taskDetails, setTaskDetails] = useState({ tasks: 0, required: 0, taken: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    const startIndex = startDateIndex;
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(
        currentDate.setDate(currentDate.getDate() + startIndex + i)
      );
      const formattedDate = newDate.toISOString().slice(0, 10);
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
        return "#ADD8E6";
      case 2:
        return "#ffff00ad";
      case 3:
        return "#ff8d00b8";
      case 4:
        return "#04ff00b8";
      default:
        return "#FFFFFF";
    }
  };

  const seconds2hrmin = (ss) => {
    if (ss === 0) {
        return '-'; // Return '-' if the input is zero seconds
    }
    
    const hours = ss / 3600; // Convert seconds to hours
    const formattedHours = Math.round(hours * 10) / 10; // Round to one decimal place

    // Check if the decimal part is zero
    if (formattedHours % 1 === 0) {
        return `${formattedHours.toFixed(0)}`; // Return as integer
    } else {
        return `${formattedHours.toFixed(1)}`; // Return as decimal
    }
};
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


const fetchProjectTimeDetails = async (projectName, userId, startDate) => {
  try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/empOverviewIndAggPATimes`, {
          params: { projectName, userId, startDate }
      });

      const updatedProjectTimeDetails = { planned: {}, actual: {}, projectName: response.data.data[0]?.projectName || '' };
      response.data.data.forEach(row => {
          updatedProjectTimeDetails.planned[row.taskDate] = row.planned || 0;
          updatedProjectTimeDetails.actual[row.taskDate] = row.actual || 0;
      });

      // Set 3-specific time details
      setProjectTimeDetails(prevState => ({
          ...prevState,
          [project.projectId]: updatedProjectTimeDetails,
      }));
  } catch (error) {
      console.error('Error fetching project time details:', error);
  }
};

useEffect(() => {
  const assignBy = employee.id;
  const projectName = project.projectName;
  const startDate = dates[0]?.ymdDate;
  fetchTaskDetails(assignBy, projectName);
  fetchProjectTimeDetails(projectName, assignBy, startDate);
}, [employee.id, project.projectName, dates]);

const handleOpenSettingsDialog = () => {
  setSettingsDialogOpen(true);
};
const handleCloseSettingsDialog = () => {
  setSettingsDialogOpen(false);
};

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/projectOverview`, {
        params: { token } // Send token as query parameter
      });
      setProjects(response.data.projects); // Set projects state with the response data
      setTotalProjects(response.data.totalProjects); // Set total projects count
      fetchProjectDetails(response.data.projects);
      
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projects) => {
    const userData = getUserDataFromToken();
    try {
      const projectNames = projects.map(project => project.ProjectName);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/totalHrs`, {
        params: {
          employeeId: userData.id,
          projectNames,
          token: localStorage.getItem('token')
        }
      });
  
      console.log('Project Details Response:', response.data);
      console.log('Total Task Count from Project Details:', response.data.totalTaskCount);
  
      const totalPlannedSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.planned || 0),
        0
      );
  
      const totalActualSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.actual || 0),
        0
      );
      const totalYTSNosSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.YTSnos || 0),
        0
      );
      const totalYTSPlannedSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.YTSplanned || 0),
        0
      );
      const totalWIPNosSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.WIPnos || 0),
        0
      );
      const totalWIPPlannedSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.WIPplanned || 0),
        0
      );
      const totalWIPActualSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.WIPactual || 0),
        0
      );
      const totalCMPNosSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.CMPnos || 0),
        0
      );
      const totalCMPPlannedSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.CMPplanned || 0),
        0
      );
  
      setProjectDetails(response.data.projects);
      setTotalTaskCount(response.data.totalTaskCount);
      setTotalPlannedSum(totalPlannedSum);
      setTotalActualSum(totalActualSum);
      setTotalYTSNosSum(totalYTSNosSum);
      setTotalYTSPlannedSum(totalYTSPlannedSum);
      setTotalWIPNosSum(totalWIPNosSum);
      setTotalWIPPlannedSum(totalWIPPlannedSum);
      setTotalWIPActualSum(totalWIPActualSum);
      setTotalCMPNosSum(totalCMPNosSum);
      setTotalCMPPlannedSum(totalCMPPlannedSum);
      setTotalCMPActualSum(totalCMPActualSum);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };
  
  
  useEffect(() => {
    console.log("Fetching projects...");
    fetchProjects();
  }, []);
 
  useEffect(() => {
    console.log("Projects state:", projects);
  }, [projects]);

  // Fetch projects initially and every 4 seconds
  useEffect(() => {
    fetchProjects();
    const intervalId = setInterval(() => {
      fetchProjects();
    }, 4000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleOpenEditProjectDialog = (project) => {
    setSelectedProject({
      salesOrder: project.sales_order,
      projectName: project.ProjectName,
      projectStatus: project.Status,
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
    <div>
      {dates.length > 0 && (
        <Navbar
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
          settingsDialogOpen={settingsDialogOpen} 
          onSettingsClose={handleCloseSettingsDialog} 
          onOpenSettingsDialog={handleOpenSettingsDialog}
        />
      )}
      <div className="container-fluid p-0" style={{ marginTop: "2.5rem" }}>
        <div className="card shadow">
          <div className="card-body p-0">
            <div className="table-responsive text-dark" id="tb1respon">
              <table
                id="sum_table"
                className="table table-bordered text-dark"
                width="100%"
                cellSpacing="0"
              >
                <thead className="text-white" id="theaderproject">
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th rowSpan="4" style={{ width: "20rem" }}>
                      Projects
                    </th>
                    <th colSpan="11">Task Status</th>
                    {dates.map((date, index) => (
                      <th
                        key={index}
                        colSpan="2"
                        rowSpan="3"
                        style={{
                          backgroundColor: date.isSunday ? "red" : "",
                          color: "white",
                        }}
                      >
                        {date.dateString}
                        <br />[ {date.day} ]
                      </th>
                    ))}
                  </tr>
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th className="text-light" colSpan="3">
                      Total
                    </th>
                    <th className="text-light" colSpan="2">
                      YTS
                    </th>
                    <th className="text-light" colSpan="3">
                      WIP
                    </th>
                    <th className="text-light" colSpan="3">
                      CMP
                    </th>
                  </tr>
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                    <th className="text-light">Nos</th>
                    <th className="text-light">Hrs</th>
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                  </tr>
                  <tr className="text-center small totalColumn">
                    <th className="bg-total text-dark" style={{background:'#dda5e7'}}></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark"style={{background:'#c6e6eb'}}>A</th>
                    <th className="bg-total text-dark" style={{background:'#dda5e7'}}></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-total text-dark"style={{background:'#dda5e7'}}></th>
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
                  <tr className="text-center small totalColumn" id="totalCol1">
                    <th
                      className="pname_total_count"
                      style={{ textAlign: "left" }}
                    >
                      Total Project : {projects.length} / {totalProjects}
                    </th>
                    <th className="totalCol">{totalTaskCount} </th>
                    <th className="totalCol">{seconds2hrmin(totalPlannedSum)} </th>
                    <th className="totalCol">{seconds2hrmin(totalActualSum)} </th>
                    <th className="totalCol">{(totalYTSNosSum)} </th>
                    <th className="totalCol">{seconds2hrmin(totalYTSPlannedSum)} </th>
                    <th className="totalCol">{(totalWIPNosSum)} </th>
                    <th className="totalCol">{seconds2hrmin(totalWIPPlannedSum)} </th>
                    <th className="totalCol">{seconds2hrmin(totalWIPActualSum)} </th>
                    <th className="totalCol">{totalCMPNosSum}</th>
                    <th className="totalCol">{seconds2hrmin(totalCMPPlannedSum)}</th>
                    <th className="totalCol">{seconds2hrmin(totalCMPActualSum)}</th>
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
                  {projects.map((project, index) => {
                    const projectDetail = projectDetails[project.ProjectName] || {};
                    const taskCount = projectDetail.task_count || 0;
                    const planned = projectDetail.planned || 0;
                    const actual = projectDetail.actual || 0;
                    const YTSnos = projectDetail.YTSnos || 0;
                    const YTSplanned = projectDetail.YTSplanned || 0;
                    const WIPnos = projectDetail.WIPnos || 0;
                    const WIPplanned = projectDetail.WIPplanned || 0;
                    const WIPactual = projectDetail.WIPactual || 0;
                    const CMPnos = projectDetail.CMPnos || 0;
                    const CMPplanned  = projectDetail.CMPplanned || 0;
                    const CMPactual  = projectDetail.CMPactual || 0;


                    return (
                      <tr key={index}>
                        <td
                          className="text-left"
                          style={{
                            backgroundColor: getBackgroundColor(project.Status),
                            color: "black",
                            padding: "0 0 0 0.5rem",
                            fontSize: "13.44px",
                          }}
                        >
                          [{project.sales_order}]
                          <a
                            className="deleteproj p-1"
                            style={{ float: "right", cursor: "pointer" }}
                            title="Delete project"
                            name={project.sales_order}
                            onClick={() =>
                              handleOpenDeleteProjectDialog(project.projectId, project.ProjectName)
                            }
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                          </a>
                          <a
                            className="editproj p-1"
                            style={{ float: "right", cursor: "pointer" }}
                            title="Edit project"
                            name={project.ProjectName}
                            value={project.Status}
                            onClick={() => handleOpenEditProjectDialog(project)}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                          </a>
                          <br />
                          {project.ProjectName}
                        </td>
                        
                        {taskCount > 0 ? (
                          <>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#dda5e7'}}>{taskCount}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle' ,background:'#858796'}}>{seconds2hrmin(planned)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#c6e6eb'}}>{seconds2hrmin(actual)}</td>
                           
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#dda5e7'}}>{YTSnos}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#858796'}}>{seconds2hrmin(YTSplanned)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#dda5e7'}}>{WIPnos}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#858796'}}>{seconds2hrmin(WIPplanned)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#c6e6eb'}}>{seconds2hrmin(WIPactual)}</td>
                            
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#dda5e7'}}>{(CMPnos)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#858796'}}>{seconds2hrmin(CMPplanned)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#c6e6eb'}}>{seconds2hrmin(CMPactual)}</td>


                            {dates.map((date, i) => (
                              <>
                              <td  key={i} style={{
                                            cursor: 'pointer',
                                            backgroundColor: '#858796',
                                            textAlign: 'center',
                                            height: '2rem',
                                            verticalAlign: 'middle',
                                        }}>{seconds2hrmin(projectTimeDetails[project.projectId]?.planned[date.ymdDate] || 0)}</td>

                              <td key={i} style={{ borderStyle: 'solid none none none',
                                            textAlign: 'center',
                                            height: '2rem',
                                            verticalAlign: 'middle',
                                            borderWidth: 'thin',}}>
                                             {seconds2hrmin(projectTimeDetails[project.projectId]?.actual[date.ymdDate] || 0)}</td>
                               
                               
                                {/* <td key={i} style={{ padding: '0', fontSize: '15px',  overflow: 'hidden' }}>
                                    <div
                                        title='Create New Task'
                                        style={{
                                            cursor: 'pointer',
                                            paddingTop: '0.2rem',
                                            
                                            display: 'block',
                                            backgroundColor: 'gray',
                                            color: 'white',
                                            border: 'none',
                                            textAlign: 'center',
                                            height: '2rem',
                                            verticalAlign: 'middle',
                                        }}
                                        
                                    >
                                        {seconds2hrmin(projectTimeDetails[project.projectId]?.planned[date.ymdDate] || 0)}
                                    </div>
                                    <div
                                        style={{
                                            paddingTop: '0.2rem',
                                            
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
                                </td> */}
                                </>
                            ))}


                            {/* <td>1</td>
                            <td>1</td>
                            <td>2</td>
                            <td>2</td>
                            <td>3</td>
                            <td>3</td>
                            <td>4</td>
                            <td>4</td>
                            <td>5</td>
                            <td>5</td>
                            <td>6</td>
                            <td>6</td>
                            <td>7</td>
                            <td>7</td> */}
                            {/* <td
                              className="text-center addtask"
                              style={{ fontSize: "13.44px", verticalAlign: "middle" }}
                              colSpan="15"
                            >
                              test
                            </td> */}
                          </>
                        ) : (
                          <td
                            title='Create new Task'
                            className="text-center addtask"
                            name={project.ProjectName}
                            style={{
                              fontSize: '13.44px',
                              verticalAlign: 'middle',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                            colSpan="25"
                          >
                            No Task Found.
                          </td>
                        )}
                      </tr>
                    );
                  })}
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
                  projectName={projectName}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
