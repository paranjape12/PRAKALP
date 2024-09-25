const db = require('../config/db');
const decryptToken = require('../middleware/decryptToken');

exports.addProject = (req, res) => {
  const { ProjectName, sales_order } = req.body;
  const sql = 'INSERT INTO projects (ProjectName, sales_order) VALUES (?, ?)';
  db.query(sql, [ProjectName, sales_order], (err, result) => {
    if (err) {
      console.error('Error adding project to database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Project added successfully');
    }
  });
};
// FAMT API Endpoint for deleting project and associated tasks
exports.deleteProject = (req, res) => {
  const projid = req.body.projid;

  // Fetch project details
  db.query(
    'SELECT * FROM `projects` WHERE `id` = ?',
    [projid],
    (error, results) => {
      if (error) {
        console.error('Error fetching project: ' + error);
        return res.status(500).json({ message: 'Error fetching project' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const proname = results[0].ProjectName;

      // Delete project and associated tasks
      db.beginTransaction(error => {
        if (error) {
          console.error('Error starting transaction: ' + error);
          return res.status(500).json({ message: 'Error starting transaction' });
        }

        db.query(
          'DELETE FROM `projects` WHERE `id` = ?',
          [projid],
          error => {
            if (error) {
              return db.rollback(() => {
                console.error('Error deleting project: ' + error);
                res.status(500).json({ message: 'Error deleting project' });
              });
            }

            db.query(
              'DELETE FROM `Task` WHERE `projectName` = ?',
              [proname],
              error => {
                if (error) {
                  return db.rollback(() => {
                    console.error('Error deleting tasks: ' + error);
                    res.status(500).json({ message: 'Error deleting tasks' });
                  });
                }

                db.query(
                  'DELETE FROM `Taskemp` WHERE `taskid` IN (SELECT DISTINCT `id` FROM `Task` WHERE `projectName` = ?)',
                  [proname],
                  error => {
                    if (error) {
                      return db.rollback(() => {
                        console.error('Error deleting task employees: ' + error);
                        res.status(500).json({ message: 'Error deleting task employees' });
                      });
                    }

                    db.commit(error => {
                      if (error) {
                        return db.rollback(() => {
                          console.error('Error committing transaction: ' + error);
                          res.status(500).json({ message: 'Error committing transaction' });
                        });
                      }

                      res.status(200).send({ message: 'Success' });
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
};

exports.getProjectNames = (req, res) => {
  const sql = 'SELECT projectName FROM projects ORDER BY `projectName` ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project names:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const projectNames = results.map((row) => row.projectName);
    res.json(projectNames);
  });
};

exports.empOverviewPrjIndividual = (req, res) => {
  const { employeeid, projStates } = req.body;

  if (!employeeid) {
    return res.status(400).send('employeeid is required');
  }

  // projStates should be an array of statuses. If not provided, default to all valid statuses.
  const validProjStates = projStates;

  const query1 = `SELECT DISTINCT te.taskid 
       FROM Taskemp te
       JOIN Task t ON te.taskid = t.id
       JOIN projects p ON t.projectName = p.ProjectName
       WHERE te.AssignedTo_emp = ? AND p.Status IN (?)`;

  db.query(query1, [employeeid, projStates], (err, result) => {
    if (err) return res.status(500).send(err);

    const taskIds = result.map(row => row.taskid);

    if (taskIds.length === 0) {
      return res.status(200).send('No tasks found for this employee');
    }

    const placeholders = taskIds.map(() => '?').join(',');  // Create the correct number of placeholders

    // Updated query2 with dynamic project statuses
    const query2 = `
      SELECT DISTINCT p.ProjectName 
      FROM \`Task\` t
      JOIN \`projects\` p ON t.projectName = p.ProjectName
      WHERE t.id IN (${placeholders}) 
      AND p.Status IN (${validProjStates.map(() => '?').join(',')})
    `;

    // Use taskIds for placeholders and projStates for project status
    db.query(query2, [...taskIds, ...validProjStates], (err, projects) => {
      if (err) {
        console.error("Error in Query2: ", err);
        return res.status(500).send(err);
      }
      const projectsCount = projects.length;

      const query3 = `  
        SELECT t.*, p.ProjectName, p.Status 
        FROM \`Task\` t
        JOIN \`projects\` p ON t.projectName = p.ProjectName
        WHERE t.id IN (${placeholders}) 
        AND p.Status IN (${validProjStates.map(() => '?').join(',')})
      `;
      const query4 = `SELECT * FROM \`Task\` WHERE id IN (${placeholders}) AND aproved = '1'`;

      db.query(query3, [...taskIds, ...validProjStates], (err, allTasks) => {
        if (err) return res.status(500).send(err);

        const totalTasks = allTasks.length;

        db.query(query4, taskIds, (err, approvedTasks) => {
          if (err) return res.status(500).send(err);

          const approvedTaskCount = approvedTasks.length;

          res.json({
            projectsCount,
            totalTasks,
            approvedTaskCount
          });
        });
      });
    });
  });
};




function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}


//original api 
// exports.EmpOverviewPlusMinus = async(req, res ) => {
//   const { empid, U_type } = req.query;

//   if (!empid) {
//     return res.status(400).send('Employee ID is required');
//   }

//   try {
//     // Get the distinct task IDs
//     const taskIdsResult = await query(`SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`, [empid]);

//     if (!Array.isArray(taskIdsResult) || taskIdsResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     const taskIds = taskIdsResult.map(row => row.taskid);

//     // Get the distinct project names
//     const projectNamesResult = await query(`SELECT DISTINCT projectName FROM Task WHERE id IN (?)`, [taskIds]);

//     if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     const projectNames = projectNamesResult.map(row => row.projectName);

//     // Fetch project details for each project name
//     const projectDetailsQuery = `SELECT * FROM projects WHERE ProjectName IN (?)`;
//     const projectDetailsResult = await query(projectDetailsQuery, [projectNames]);

//     if (projectDetailsResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     let response = [];
//     let count = 0;
//     projectDetailsResult.forEach(project => {
//       const projectId = project.id;
//       const projectName = project.ProjectName;
//       const projectSalesOrder = project.sales_order;
//       const proj_status = project.Status;
//       const projectLastTask = project.lasttask;

//       let selcttask;
//       if (U_type !== 'Admin' && U_type !== 'Team Leader') {
//         selcttask = `SELECT te.id, te.taskid, p.TaskName, te.timetocomplete_emp, p.timetocomplete, SUM(te.actualtimetocomplete_emp) AS total_actual_time, p.taskDetails, p.Status, p.aproved FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ? GROUP BY te.taskid, p.TaskName ORDER BY te.taskid;`;
//       } else {
//         selcttask = `SELECT * FROM Task WHERE projectName = ?`;
//       }

//       db.query(selcttask, [empid, projectName], (err, taskResults) => {
//         if (err) {
//           console.error('Error executing task query:', err.stack);
//           return res.status(500).send('Database query error');
//         }

//         let assigntaskpresent = taskResults.length > 0;
//         let noofassigntasks = taskResults.length;
//         // Prepare task details for each task
//         const tasks = taskResults.map(task => ({
//           taskId: task.taskid,
//           taskempId: task.id,
//           taskName: task.TaskName,
//           taskGivenTime: task.timetocomplete_emp,
//           taskRequiredTime: task.timetocomplete,
//           taskActualTime: task.total_actual_time,
//           taskDetails: task.taskDetails,
//           taskStatus: task.Status,
//           taskAproved: task.aproved
//         }));

//         const timeQuery = `SELECT sum(p.timetocomplete) as required, sum(te.actualtimetocomplete_emp) as taken FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ?`;
//         db.query(timeQuery, [empid, projectName], (err, timeResults) => {
//           if (err) {
//             console.error('Error executing time query:', err.stack);
//             return res.status(500).send('Database query error');
//           }

//           const requiredTime = timeResults[0].required || 0;
//           const takenTime = timeResults[0].taken || 0;

//           response.push({
//             projectId,
//             projectName,
//             projectSalesOrder,
//             assigntaskpresent,
//             noofassigntasks,
//             proj_status,
//             projectLastTask,
//             requiredTime,
//             takenTime,
//             tasks
//           });

//           count++;
//           if (count === projectDetailsResult.length) {
//             res.json(response);
//           }
//         });
//       });
//     });
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).send('Internal server error');
//   }
// };

//New project not use future 
// exports.EmpOverviewPlusMinus = async (req, res) => {
//   const { empid, U_type } = req.query;

//   if (!empid) {
//     return res.status(400).send('Employee ID is required');
//   }

//   try {
//     // Get the distinct task IDs
//     const taskIdsResult = await query(`SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`, [empid]);

//     if (!Array.isArray(taskIdsResult) || taskIdsResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     const taskIds = taskIdsResult.map(row => row.taskid);

//     // Get the distinct project names with the required statuses
//     const projectNamesResult = await query(
//       `SELECT DISTINCT projectName FROM Task WHERE id IN (?) AND Status IN (1, 2, 3, 4)`, 
//       [taskIds]
//     );

//     if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     const projectNames = projectNamesResult.map(row => row.projectName);

//     // Fetch project details for each project name with the required statuses
//     const projectDetailsQuery = `SELECT * FROM projects WHERE ProjectName IN (?) AND Status IN (1, 2, 3, 4)`;
//     const projectDetailsResult = await query(projectDetailsQuery, [projectNames]);

//     if (projectDetailsResult.length === 0) {
//       return res.status(200).send({ projectNames: [], salesOrders: [] });
//     }

//     let response = [];
//     let count = 0;
//     projectDetailsResult.forEach(project => {
//       const projectId = project.id;
//       const projectName = project.ProjectName;
//       const projectSalesOrder = project.sales_order;
//       const proj_status = project.Status;
//       const projectLastTask = project.lasttask;

//       let selcttask;
//       if (U_type !== 'Admin' && U_type !== 'Team Leader') {
//         selcttask = `SELECT te.id, te.taskid, p.TaskName, te.timetocomplete_emp, p.timetocomplete, SUM(te.actualtimetocomplete_emp) AS total_actual_time, p.taskDetails, p.Status, p.aproved 
//                      FROM Taskemp te 
//                      JOIN Task p ON te.taskid = p.id 
//                      WHERE te.AssignedTo_emp = ? AND p.ProjectName = ? 
//                      GROUP BY te.taskid, p.TaskName 
//                      ORDER BY te.taskid;`;
//       } else {
//         selcttask = `SELECT * FROM Task WHERE projectName = ?`;
//       }

//       db.query(selcttask, [empid, projectName], (err, taskResults) => {
//         if (err) {
//           console.error('Error executing task query:', err.stack);
//           return res.status(500).send('Database query error');
//         }

//         let assigntaskpresent = taskResults.length > 0;
//         let noofassigntasks = taskResults.length;
//         // Prepare task details for each task
//         const tasks = taskResults.map(task => ({
//           taskId: task.taskid,
//           taskempId: task.id,
//           taskName: task.TaskName,
//           taskGivenTime: task.timetocomplete_emp,
//           taskRequiredTime: task.timetocomplete,
//           taskActualTime: task.total_actual_time,
//           taskDetails: task.taskDetails,
//           taskStatus: task.Status,
//           taskAproved: task.aproved
//         }));

//         const timeQuery = `SELECT sum(p.timetocomplete) as required, sum(te.actualtimetocomplete_emp) as taken 
//                            FROM Taskemp te 
//                            JOIN Task p ON te.taskid = p.id 
//                            WHERE te.AssignedTo_emp = ? AND p.ProjectName = ?`;
//         db.query(timeQuery, [empid, projectName], (err, timeResults) => {
//           if (err) {
//             console.error('Error executing time query:', err.stack);
//             return res.status(500).send('Database query error');
//           }

//           const requiredTime = timeResults[0].required || 0;
//           const takenTime = timeResults[0].taken || 0;

//           response.push({
//             projectId,
//             projectName,
//             projectSalesOrder,
//             assigntaskpresent,
//             noofassigntasks,
//             proj_status,
//             projectLastTask,
//             requiredTime,
//             takenTime,
//             tasks
//           });

//           count++;
//           if (count === projectDetailsResult.length) {
//             res.json(response);
//           }
//         });
//       });
//     });
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     res.status(500).send('Internal server error');
//   }
// };

//filter add getProjSortingAndProjects
exports.EmpOverviewPlusMinus = async (req, res) => {
  const { empid, U_type } = req.query;

  if (!empid) {
    return res.status(400).send('Employee ID is required');
  }

  try {
    // Get the distinct task IDs
    const taskIdsResult = await query(`SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`, [empid]);

    if (!Array.isArray(taskIdsResult) || taskIdsResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    const taskIds = taskIdsResult.map(row => row.taskid);

    // Get the distinct project names
    const projectNamesResult = await query(`SELECT DISTINCT projectName FROM Task WHERE id IN (?)`, [taskIds]);

    if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    const projectNames = projectNamesResult.map(row => row.projectName);

    // Fetch project details for each project name
    const projectDetailsQuery = `SELECT * FROM projects WHERE ProjectName IN (?)`;
    const projectDetailsResult = await query(projectDetailsQuery, [projectNames]);

    if (projectDetailsResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    let response = [];
    let count = 0;

    // Call the getProjSortingAndProjects function
    getProjSortingAndProjects(empid, projectDetailsResult, async (sortedProjects) => {
      for (const project of sortedProjects) {
        const projectId = project.id;
        const projectName = project.ProjectName;
        const projectSalesOrder = project.sales_order;
        const proj_status = project.Status;
        const projectLastTask = project.lasttask;

        let selcttask;
        if (U_type !== 'Admin' && U_type !== 'Team Leader') {
          selcttask = `SELECT te.id, te.taskid, p.TaskName, te.timetocomplete_emp, p.timetocomplete, SUM(te.actualtimetocomplete_emp) AS total_actual_time, p.taskDetails, p.Status, p.aproved FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ? GROUP BY te.taskid, p.TaskName ORDER BY te.taskid;`;
        } else {
          selcttask = `SELECT * FROM Task WHERE projectName = ?`;
        }

        const taskResults = await query(selcttask, [empid, projectName]);

        let assigntaskpresent = taskResults.length > 0;
        let noofassigntasks = taskResults.length;
        // Prepare task details for each task
        const tasks = taskResults.map(task => ({
          taskId: task.taskid,
          taskempId: task.id,
          taskName: task.TaskName,
          taskGivenTime: task.timetocomplete_emp,
          taskRequiredTime: task.timetocomplete,
          taskActualTime: task.total_actual_time,
          taskDetails: task.taskDetails,
          taskStatus: task.Status,
          taskAproved: task.aproved
        }));

        const timeQuery = `SELECT sum(p.timetocomplete) as required, sum(te.actualtimetocomplete_emp) as taken FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ?`;
        const timeResults = await query(timeQuery, [empid, projectName]);

        const requiredTime = timeResults[0].required || 0;
        const takenTime = timeResults[0].taken || 0;

        response.push({
          projectId,
          projectName,
          projectSalesOrder,
          assigntaskpresent,
          noofassigntasks,
          proj_status,
          projectLastTask,
          requiredTime,
          takenTime,
          tasks
        });

        count++;
        if (count === sortedProjects.length) {
          res.json(response);
        }
      }
    });

    function getProjSortingAndProjects(empid, projectDetails, callback) {
      const loginQuerySort = `SELECT projsorting_pv FROM Logincrd WHERE id = ?`;
      db.query(loginQuerySort, [empid], (err, loginResults) => {
        if (err) {
          console.error('Error executing login query:', err.stack);
          return res.status(500).send('Database query error');
        }

        const proj_sort_str = loginResults.length > 0 ? loginResults[0].projsorting_pv : '';
        const proj_sort = proj_sort_str ? proj_sort_str.split(' ') : [];

        let sortedProjectQuery;
        if (proj_sort_str === '') {
          sortedProjectQuery = `SELECT * FROM projects WHERE ProjectName IN (?)`;
        } else {
          const sort_Status = proj_sort.map(status => `'${status}'`).join(',');
          sortedProjectQuery = `SELECT * FROM projects WHERE ProjectName IN (?) AND Status IN (${sort_Status})`;
        }

        db.query(sortedProjectQuery, [projectDetails.map(proj => proj.ProjectName)], (err, sortedProjects) => {
          if (err) {
            console.error('Error executing sorted project query:', err.stack);
            return res.status(500).send('Database query error');
          }

          callback(sortedProjects);
        });
      });
    }

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal server error');
  }
};

//navbar
exports.createCopyProject = async (req, res) => {
  const { projectName, salesOrder, taskNames, taskValues } = req.body;

  if (!projectName || !salesOrder) {
    return res.status(400).send('Project name and sales order are required');
  }

  const checkProjectQuery = 'SELECT * FROM projects WHERE ProjectName = ? OR sales_order = ?';
  db.query(checkProjectQuery, [projectName, salesOrder], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      return res.status(200).send('Project exist');
    }

    const insertProjectQuery = 'INSERT INTO projects (ProjectName, sales_order) VALUES (?, ?)';
    db.query(insertProjectQuery, [projectName, salesOrder], (err, result) => {
      if (err) {
        console.error('Error inserting into the database:', err);
        return res.status(500).send('Database error');
      }

      const projectId = result.insertId;
      const insertTaskQueries = taskNames.map((taskName, index) => {
        const taskValue = taskValues[index];
        return new Promise((resolve, reject) => {
          const insertTaskQuery = 'INSERT INTO Task (projectName, TaskName, timetocomplete) VALUES (?, ?, ?)';
          db.query(insertTaskQuery, [projectName, taskName, taskValue], (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      });

      Promise.all(insertTaskQueries)
        .then(() => res.status(200).send('Success'))
        .catch(err => {
          console.error('Error inserting tasks into the database:', err);
          res.status(500).send('Database error');
        });
    });
  });
};

//navbar
exports.updateProjectSorting = (req, res) => {
  const { token, projshowval, projshowval2, projshowval_pv } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  const userData = decryptToken(token);
  const userId = userData.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Function to update project sorting in the database
  const updateProjectSorting = (column, value) => {
    let projshowvalFinal = '';
    if (value && !value.includes("-")) {
      projshowvalFinal = value.join(' ');
    }

    const query = `UPDATE Logincrd SET ${column} = ? WHERE id = ?`;
    db.query(query, [projshowvalFinal, userId], (err) => {
      if (err) {
        console.error('Error updating database: ', err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: 'Success' });
      }
    });
  };

  // Determine which sorting value to update
  if (projshowval) {
    updateProjectSorting('projsorting', projshowval);
  } else if (projshowval2) {
    updateProjectSorting('projsorting2', projshowval2);
  } else if (projshowval_pv) {
    updateProjectSorting('projsorting_pv', projshowval_pv);
  } else {
    res.status(400).json({ error: 'Bad Request' });
  }
};

//projectoverview Project fectching api original
// exports.projectOverview = (req, res) => {
//   const token = req.query.token; // Use query parameter for GET request

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   const userData = decryptToken(token);
//   const AssignBy = userData.Type;

//   let selectProjectQuery;

//   if (AssignBy === 'Employee') {
//     selectProjectQuery = `
//       SELECT id, ProjectName, sales_order, Status 
//       FROM projects 
//       WHERE complete_status = 0 AND Status IN (1, 2, 3, 4)`;
//   } else if (AssignBy === 'Team Leader' || AssignBy === 'Admin') {
//     selectProjectQuery = `SELECT id, ProjectName, sales_order, Status FROM projects`;
//   } else {
//     return res.status(403).send('Unauthorized user type');
//   }

//   db.query(selectProjectQuery, (err, projectResults) => {
//     if (err) {
//       console.error('Error executing project query:', err.stack);
//       return res.status(500).send('Database query error');
//     }

//     const projectCountQuery = `SELECT COUNT(*) as totalProjects FROM projects`;

//     db.query(projectCountQuery, (err, countResult) => {
//       if (err) {
//         console.error('Error executing count query:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const totalProjects = countResult[0].totalProjects;

//       const response = {
//         projects: projectResults.map(project => ({
//           ProjectName: project.ProjectName,
//           sales_order: project.sales_order,
//           Status: project.Status,
//           projectId: project.id
//         })),
//         totalProjects
//       };

//       res.json(response);
//     });
//   });
// };

//add filtering project colour waves and setting popup mdun 
// exports.projectOverview = (req, res) => {
//   const token = req.query.token; // Use query parameter for GET request

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   const userData = decryptToken(token);
//   const AssignBy = userData.Type;
//   const u_id = userData.id;

//   let selectProjectQuery;

//   if (AssignBy === 'Employee') {
//     selectProjectQuery = `
//       SELECT id, ProjectName, sales_order, Status 
//       FROM projects 
//       WHERE complete_status = 0 AND Status IN (1, 2, 3, 4)`;
//   } else if (AssignBy === 'Team Leader' || AssignBy === 'Admin') {
//     selectProjectQuery = `SELECT id, ProjectName, sales_order, Status FROM projects`;
//   } else {
//     return res.status(403).send('Unauthorized user type');
//   }

//   db.query(selectProjectQuery, (err, projectResults) => {
//     if (err) {
//       console.error('Error executing project query:', err.stack);
//       return res.status(500).send('Database query error');
//     }

//     getProjSortingAndProjects();

//     function getProjSortingAndProjects() {
//       const loginQuerySort = `SELECT projsorting FROM Logincrd WHERE id = ?`;
//       db.query(loginQuerySort, [u_id], (err, loginResults) => {
//         if (err) {
//           console.error('Error executing login query:', err.stack);
//           return res.status(500).send('Database query error');
//         }

//         const proj_sort_str = loginResults.length > 0 ? loginResults[0].projsorting : '';
//         const proj_sort = proj_sort_str ? proj_sort_str.split(' ') : [];

//         let sortedProjectQuery;
//         if (proj_sort_str === '') {
//           sortedProjectQuery = `SELECT * FROM projects`;
//         } else {
//           const sort_Status = proj_sort.map(status => `'${status}'`).join(',');
//           sortedProjectQuery = `SELECT * FROM projects WHERE Status IN (${sort_Status})`;
//         }

//         db.query(sortedProjectQuery, (err, sortedProjects) => {
//           if (err) {
//             console.error('Error executing sorted project query:', err.stack);
//             return res.status(500).send('Database query error');
//           }

//           const projectCountQuery = `SELECT COUNT(*) as totalProjects FROM projects`;

//           db.query(projectCountQuery, (err, countResult) => {
//             if (err) {
//               console.error('Error executing count query:', err.stack);
//               return res.status(500).send('Database query error');
//             }

//             const totalProjects = countResult[0].totalProjects;

//             const response = {
//               projects: sortedProjects.map(project => ({
//                 ProjectName: project.ProjectName,
//                 sales_order: project.sales_order,
//                 Status: project.Status,
//                 projectId: project.id
//               })),
//               totalProjects
//             };

//             res.json(response);
//           });
//         });
//       });
//     }
//   });
// };

// this propre working but all project fetch this problem
exports.projectOverview = (req, res) => {
  const token = req.query.token; // Use query parameter for GET request

  if (!token) {
    return res.status(400).send('Token is required');
  }

  const userData = decryptToken(token);
  const AssignBy = userData.Type;
  const u_id = userData.id;

  let selectProjectQuery;

  if (AssignBy === 'Employee') {
    selectProjectQuery = `
      SELECT id, ProjectName, sales_order, Status 
      FROM projects 
      WHERE complete_status = 0 AND Status IN (1, 2, 3, 4)`;
  } else if (AssignBy === 'Team Leader' || AssignBy === 'Admin') {
    selectProjectQuery = `SELECT id, ProjectName, sales_order, Status FROM projects`;
  } else {
    return res.status(403).send('Unauthorized user type');
  }

  db.query(selectProjectQuery, (err, projectResults) => {
    if (err) {
      console.error('Error executing project query:', err.stack);
      return res.status(500).send('Database query error');
    }

    getProjSortingAndProjects();

    function getProjSortingAndProjects() {
      const loginQuerySort = `SELECT projsorting2 FROM Logincrd WHERE id = ?`;
      db.query(loginQuerySort, [u_id], (err, loginResults) => {
        if (err) {
          console.error('Error executing login query:', err.stack);
          return res.status(500).send('Database query error');
        }

        const proj_sort_str = loginResults.length > 0 ? loginResults[0].projsorting2 : '';
        const proj_sort = proj_sort_str ? proj_sort_str.split(' ') : [];

        let sortedProjectQuery;
        if (proj_sort_str === '') {
          sortedProjectQuery = `SELECT * FROM projects`;
        } else {
          const sort_Status = proj_sort.map(status => `'${status}'`).join(',');
          sortedProjectQuery = `SELECT * FROM projects WHERE Status IN (${sort_Status})`;
        }

        db.query(sortedProjectQuery, (err, sortedProjects) => {
          if (err) {
            console.error('Error executing sorted project query:', err.stack);
            return res.status(500).send('Database query error');
          }

          const projectCountQuery = `SELECT COUNT(*) as totalProjects FROM projects`;

          db.query(projectCountQuery, (err, countResult) => {
            if (err) {
              console.error('Error executing count query:', err.stack);
              return res.status(500).send('Database query error');
            }

            const totalProjects = countResult[0].totalProjects;

            const response = {
              projects: sortedProjects.map(project => ({
                ProjectName: project.ProjectName,
                sales_order: project.sales_order,
                Status: project.Status,
                projectId: project.id
              })),
              totalProjects
            };

            res.json(response);
          });
        });
      });
    }
  });
};

exports.updateProject = async (req, res) => {
  const { ProjectName, Projectid, projstatus, editprojmodalisalesval } = req.body;

  if (!projstatus) {
    return res.status(400).send('Project status is missing');
  }

  const status = projstatus.planning ? 1 :
    projstatus.execution ? 2 :
      projstatus.lastLap ? 3 :
        projstatus.complete ? 4 : 0;

  // Check if the sales order exists in other projects
  const query = "SELECT * FROM `projects` WHERE `sales_order` = ?";
  db.query(query, [editprojmodalisalesval], (err, result) => {
    if (err) {
      return res.status(500).send('Error querying database');
    }

    // Get the current project details
    const query2 = "SELECT * FROM `projects` WHERE `id` = ?";
    db.query(query2, [Projectid], (err, result2) => {
      if (err) {
        return res.status(500).send('Error querying database');
      }

      if (result2.length === 0) {
        return res.status(404).send('Project not found');
      }

      const ProjectNameold = result2[0].ProjectName;
      const sid_old = result2[0].sales_order;

      if ((result.length > 0 && ProjectName !== ProjectNameold) && sid_old !== editprojmodalisalesval) {
        return res.status(400).send('Project exists');
      } else if (result.length > 0 && editprojmodalisalesval !== sid_old) {
        return res.status(400).send('Project exists');
      } else {
        const query3 = "SELECT * FROM `Task` WHERE `projectName` = ?";
        db.query(query3, [ProjectNameold], (err, result3) => {
          if (err) {
            return res.status(500).send('Error querying database');
          }

          if (result3.length > 0) {
            const updateQuery1 = "UPDATE `projects` SET `ProjectName` = ?, `sales_order` = ?, `Status` = ? WHERE `id` = ?";
            const updateQuery2 = "UPDATE `Task` SET `projectName` = ? WHERE `projectName` = ?";
            db.query(updateQuery1, [ProjectName, editprojmodalisalesval, status, Projectid], (err, result1) => {
              if (err) {
                return res.status(500).send('Error updating project');
              }
              db.query(updateQuery2, [ProjectName, ProjectNameold], (err, result2) => {
                if (err) {
                  return res.status(500).send('Error updating tasks');
                }
                return res.send('Success');
              });
            });
          } else {
            const updateQuery1 = "UPDATE `projects` SET `ProjectName` = ?, `sales_order` = ?, `Status` = ? WHERE `id` = ?";
            db.query(updateQuery1, [ProjectName, editprojmodalisalesval, status, Projectid], (err, result1) => {
              if (err) {
                return res.status(500).send('Error updating project');
              }
              return res.send('Success');
            });
          }
        });
      }
    });
  });
};

// exports.totalHrs = (req, res) => {
//   const employeeId = req.query.employeeId;
//   const projectNames = req.query.projectNames; 
//   const token = req.query.token; 

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   let userRole;
//   try {
//     const decryptedToken = decryptToken(token);
//     userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
//   } catch (error) {
//     console.error('Error decrypting token:', error);
//     return res.status(400).send('Invalid token');
//   }

//   if (!employeeId || !projectNames || !Array.isArray(projectNames)) {
//     return res.status(400).send('employeeId and projectNames are required, and projectNames should be an array');
//   }

//   // If the user role is "Employee", proceed with the original logic
//   if (userRole === 'Employee') {
//     const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;

//     db.query(query1, (err, taskIdsResult) => {
//       if (err) {
//         console.error('Error executing query 1:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const taskIds = taskIdsResult.map(row => row.taskid).join(',');

//       if (!taskIds.length) {
//         return res.status(200).json({
//           projects: projectNames.reduce((acc, projectName) => {
//             acc[projectName] = { planned: 0, task_count: 0, actual: 0 };
//             return acc;
//           }, {}),
//           totalTaskCount: 0 // Return 0 if no tasks are found
//         });
//       }

//       const projectQueries = projectNames.map(projectName => {
//         return new Promise((resolve, reject) => {
//           const taskIdsQuery = `
//             SELECT id 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${taskIds});
//           `;

//           db.query(taskIdsQuery, (err, taskIdResults) => {
//             if (err) {
//               console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const projectTaskIds = taskIdResults.map(row => row.id).join(',');

//             if (!projectTaskIds.length) {
//               resolve({
//                 projectName,
//                 planned: 0,
//                 taskCount: 0,
//                 actual: 0
//               });
//               return;
//             }

//             const plannedQuery = `
//               SELECT SUM(timetocomplete) as planned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const taskCountQuery = `
//               SELECT COUNT(*) as task_count 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const actualQuery = `
//               SELECT SUM(actualtimetocomplete_emp) as actual 
//               FROM Taskemp 
//               WHERE taskid IN (${projectTaskIds});
//             `;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.planned || 0;

//               db.query(taskCountQuery, (err, taskCountResult) => {
//                 if (err) {
//                   console.error(`Error executing task count query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const taskCount = taskCountResult[0]?.task_count || 0;

//                 db.query(actualQuery, (err, actualResult) => {
//                   if (err) {
//                     console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const actual = actualResult[0]?.actual || 0;

//                   resolve({
//                     projectName,
//                     planned,
//                     taskCount,
//                     actual
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });

//       Promise.all(projectQueries)
//         .then(results => {
//           const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);

//           const response = results.reduce((acc, result) => {
//             acc[result.projectName] = {
//               planned: result.planned,
//               task_count: result.taskCount,
//               actual: result.actual
//             };
//             return acc;
//           }, {});

//           res.json({ projects: response, totalTaskCount }); // Include totalTaskCount in the response
//         })
//         .catch(error => {
//           console.error('Error processing project queries:', error);
//           res.status(500).send(error);
//         });
//     });

//   } else { // If the user role is not "Employee"
//     const projectQueries = projectNames.map(projectName => {
//       return new Promise((resolve, reject) => {
//         const taskIdsQuery = `
//           SELECT id 
//           FROM Task 
//           WHERE projectName='${projectName}';
//         `;

//         db.query(taskIdsQuery, (err, taskIdResults) => {
//           if (err) {
//             console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//             return reject('Database query error');
//           }

//           const projectTaskIds = taskIdResults.map(row => row.id).join(',');
//           const taskCount = taskIdResults.length;

//           if (!projectTaskIds.length) {
//             resolve({
//               projectName,
//               planned: 0,
//               taskCount: 0,
//               actual: 0
//             });
//             return;
//           }

//           const actualQuery = `
//             SELECT SUM(actualtimetocomplete_emp) as TLTotalActual 
//             FROM Taskemp 
//             WHERE taskid IN (${projectTaskIds});
//           `;

//           const plannedQuery = `
//             SELECT SUM(timetocomplete) as TLTotalPlanned 
//             FROM Task 
//             WHERE projectName='${projectName}';
//           `;

//           db.query(actualQuery, (err, actualResult) => {
//             if (err) {
//               console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const actual = actualResult[0]?.TLTotalActual || 0;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.TLTotalPlanned || 0;

//               resolve({
//                 projectName,
//                 planned,
//                 actual,
//                 taskCount,
//               });
//             });
//           });
//         });
//       });
//     });

//     Promise.all(projectQueries)
//       .then(results => {
//         const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);
//         const response = results.reduce((acc, result) => {
//           acc[result.projectName] = {
//             planned: result.planned,
//             actual: result.actual,
//             task_count: result.taskCount,
//           };
//           return acc;
//         }, {});

//         res.json({ projects: response, totalTaskCount });
//       })
//       .catch(error => {
//         console.error('Error processing project queries:', error);
//         res.status(500).send(error);
//       });
//   }
// };


//   exports.YTSWIPhrs = (req, res) => {
//   const employeeId = req.query.employeeId;
//   const projectNames = req.query.projectNames?.split(','); // Expecting a comma-separated list of project names
//   const token = req.query.token;

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   let userRole;
//   try {
//     const decryptedToken = decryptToken(token);
//     userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
//   } catch (error) {
//     console.error('Error decrypting token:', error);
//     return res.status(400).send('Invalid token');
//   }

//   if (!employeeId || !projectNames || !projectNames.length) {
//     return res.status(400).send('employeeId and projectNames are required');
//   }

//   if (userRole === 'Employee') {
//     const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;

//     db.query(query1, (err, taskIdsResult) => {
//       if (err) {
//         console.error('Error executing query 1:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const taskIds = taskIdsResult.map(row => row.taskid).join(',');
//       if (!taskIds.length) {
//         return res.status(200).json({
//           projects: projectNames.reduce((acc, projectName) => {
//             acc[projectName] = { YTSnos:0, YTSplanned:0,WIPnos:0, WIPplanned:0, WIPactual:0};
//             return acc;
//           }, {}),
//           totalTaskCount: 0
//         });
//       }

//       const projectQueries = projectNames.map((projectName) => {
//         return new Promise((resolve, reject) => {
//           const YTSQuery = `
//             SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${taskIds}) AND Status=1;
//           `;

//           const WIPQuery = `
//             SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${taskIds}) AND Status=2;
//           `;

//           db.query(YTSQuery, (err, YTSResult) => {
//             if (err) {
//               console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const { YTSnos = 0, YTSplanned = 0 } = YTSResult[0] || {};

//             db.query(WIPQuery, (err, WIPResult) => {
//               if (err) {
//                 console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const { WIPnos = 0, WIPplanned = 0 } = WIPResult[0] || {};

//               const WIPTaskIdsQuery = `
//                 SELECT id 
//                 FROM Task 
//                 WHERE projectName='${projectName}' AND id IN (${taskIds}) AND Status=2;
//               `;

//               db.query(WIPTaskIdsQuery, (err, WIPTaskIdsResult) => {
//                 if (err) {
//                   console.error(`Error executing WIP Task IDs query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const WIPTaskIds = WIPTaskIdsResult.map(row => row.id).join(',');

//                 if (!WIPTaskIds.length) {
//                   return resolve({
//                     projectName,
//                     YTSnos,
//                     YTSplanned,
//                     WIPnos,
//                     WIPplanned,
//                     WIPactual: 0
//                   });
//                 }

//                 const WIPActualQuery = `
//                   SELECT SUM(actualtimetocomplete_emp) as WIPactual 
//                   FROM Taskemp 
//                   WHERE taskid IN (${WIPTaskIds});
//                 `;

//                 db.query(WIPActualQuery, (err, WIPActualResult) => {
//                   if (err) {
//                     console.error(`Error executing WIP Actual query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const WIPactual = WIPActualResult[0]?.WIPactual || 0;

//                   resolve({
//                     projectName,
//                     YTSnos,
//                     YTSplanned,
//                     WIPnos,
//                     WIPplanned,
//                     WIPactual
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });

//       Promise.all(projectQueries)
//         .then(results => {
//           const totalTaskCount = results.reduce((acc, result) => acc + (result.YTSnos || 0) + (result.WIPnos || 0), 0);

//           const response = results.reduce((acc, result) => {
//             acc[result.projectName] = {
//               YTSnos: result.YTSnos ,
//               YTSplanned: result.YTSplanned,
//               WIPnos: result.WIPnos ,
//               WIPplanned: result.WIPplanned ,
//               WIPactual: result.WIPactual
//             };
//             return acc;
//           }, {});

//           res.json({ projects: response, totalTaskCount });
//         })
//         .catch(error => {
//           console.error('Error in processing projects:', error);
//           res.status(500).send('Error processing projects');
//         });
//     });
//   } else {
//     res.status(403).send('Access forbidden: User role not authorized');
//   }
// };


// exports.totalHrs = (req, res) => {
//   const employeeId = req.query.employeeId;
//   const projectNames = req.query.projectNames;
//   const token = req.query.token;

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   let userRole;
//   try {
//     const decryptedToken = decryptToken(token);
//     userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
//   } catch (error) {
//     console.error('Error decrypting token:', error);
//     return res.status(400).send('Invalid token');
//   }

//   if (!employeeId || !projectNames || !Array.isArray(projectNames)) {
//     return res.status(400).send('employeeId and projectNames are required, and projectNames should be an array');
//   }

//   if (userRole === 'Employee') {
//     const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;

//     db.query(query1, (err, taskIdsResult) => {
//       if (err) {
//         console.error('Error executing query 1:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const taskIds = taskIdsResult.map(row => row.taskid).join(',');

//       if (!taskIds.length) {
//         return res.status(200).json({
//           projects: projectNames.reduce((acc, projectName) => {
//             acc[projectName] = { planned: 0, task_count: 0, actual: 0, YTSnos: 0, YTSplanned: 0, WIPnos: 0, WIPplanned: 0 };
//             return acc;
//           }, {}),
//           totalTaskCount: 0 // Return 0 if no tasks are found
//         });
//       }

//       const projectQueries = projectNames.map(projectName => {
//         return new Promise((resolve, reject) => {
//           const taskIdsQuery = `
//             SELECT id 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${taskIds});
//           `;

//           db.query(taskIdsQuery, (err, taskIdResults) => {
//             if (err) {
//               console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const projectTaskIds = taskIdResults.map(row => row.id).join(',');

//             if (!projectTaskIds.length) {
//               resolve({
//                 projectName,
//                 planned: 0,
//                 taskCount: 0,
//                 actual: 0,
//                 YTSnos: 0,
//                 YTSplanned: 0,
//                 WIPnos: 0,
//                 WIPplanned: 0
//               });
//               return;
//             }

//             const plannedQuery = `
//               SELECT SUM(timetocomplete) as planned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const taskCountQuery = `
//               SELECT COUNT(*) as task_count 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const actualQuery = `
//               SELECT SUM(actualtimetocomplete_emp) as actual 
//               FROM Taskemp 
//               WHERE taskid IN (${projectTaskIds});
//             `;

//             const YTSQuery = `
//               SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
//             `;

//             const WIPQuery = `
//               SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
//             `;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.planned || 0;

//               db.query(taskCountQuery, (err, taskCountResult) => {
//                 if (err) {
//                   console.error(`Error executing task count query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const taskCount = taskCountResult[0]?.task_count || 0;

//                 db.query(actualQuery, (err, actualResult) => {
//                   if (err) {
//                     console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const actual = actualResult[0]?.actual || 0;

//                   db.query(YTSQuery, (err, YTSResult) => {
//                     if (err) {
//                       console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
//                       return reject('Database query error');
//                     }

//                     const YTSnos = YTSResult[0]?.YTSnos || 0;
//                     const YTSplanned = YTSResult[0]?.YTSplanned || 0;

//                     db.query(WIPQuery, (err, WIPResult) => {
//                       if (err) {
//                         console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
//                         return reject('Database query error');
//                       }

//                       const WIPnos = WIPResult[0]?.WIPnos || 0;
//                       const WIPplanned = WIPResult[0]?.WIPplanned || 0;

//                       resolve({
//                         projectName,
//                         planned,
//                         taskCount,
//                         actual,
//                         YTSnos,
//                         YTSplanned,
//                         WIPnos,
//                         WIPplanned
//                       });
//                     });
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });

//       Promise.all(projectQueries)
//         .then(results => {
//           const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);

//           const response = results.reduce((acc, result) => {
//             acc[result.projectName] = {
//               planned: result.planned,
//               task_count: result.taskCount,
//               actual: result.actual,
//               YTSnos: result.YTSnos,
//               YTSplanned: result.YTSplanned,
//               WIPnos: result.WIPnos,
//               WIPplanned: result.WIPplanned
//             };
//             return acc;
//           }, {});

//           res.json({ projects: response, totalTaskCount }); // Include totalTaskCount in the response
//         })
//         .catch(error => {
//           console.error('Error processing project queries:', error);
//           res.status(500).send(error);
//         });
//     });

//   } else { // If the user role is not "Employee"
//     const projectQueries = projectNames.map(projectName => {
//       return new Promise((resolve, reject) => {
//         const taskIdsQuery = `
//           SELECT id 
//           FROM Task 
//           WHERE projectName='${projectName}';
//         `;

//         db.query(taskIdsQuery, (err, taskIdResults) => {
//           if (err) {
//             console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//             return reject('Database query error');
//           }

//           const projectTaskIds = taskIdResults.map(row => row.id).join(',');
//           const taskCount = taskIdResults.length;

//           if (!projectTaskIds.length) {
//             resolve({
//               projectName,
//               planned: 0,
//               taskCount: 0,
//               actual: 0,
//               YTSnos: 0,
//               YTSplanned: 0,
//               WIPnos: 0,
//               WIPplanned: 0
//             });
//             return;
//           }

//           const actualQuery = `
//             SELECT SUM(actualtimetocomplete_emp) as TLTotalActual 
//             FROM Taskemp 
//             WHERE taskid IN (${projectTaskIds});
//           `;

//           const plannedQuery = `
//             SELECT SUM(timetocomplete) as TLTotalPlanned 
//             FROM Task 
//             WHERE projectName='${projectName}';
//           `;

//           const YTSQuery = `
//             SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
//           `;

//           const WIPQuery = `
//             SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
//           `;

//           db.query(actualQuery, (err, actualResult) => {
//             if (err) {
//               console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const actual = actualResult[0]?.TLTotalActual || 0;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.TLTotalPlanned || 0;

//               db.query(YTSQuery, (err, YTSResult) => {
//                 if (err) {
//                   console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const YTSnos = YTSResult[0]?.YTSnos || 0;
//                 const YTSplanned = YTSResult[0]?.YTSplanned || 0;

//                 db.query(WIPQuery, (err, WIPResult) => {
//                   if (err) {
//                     console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const WIPnos = WIPResult[0]?.WIPnos || 0;
//                   const WIPplanned = WIPResult[0]?.WIPplanned || 0;

//                   resolve({
//                     projectName,
//                     planned,
//                     actual,
//                     taskCount,
//                     YTSnos,
//                     YTSplanned,
//                     WIPnos,
//                     WIPplanned
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });
//     });

//     Promise.all(projectQueries)
//       .then(results => {
//         const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);
//         const response = results.reduce((acc, result) => {
//           acc[result.projectName] = {
//             planned: result.planned,
//             actual: result.actual,
//             task_count: result.taskCount,
//             YTSnos: result.YTSnos,
//             YTSplanned: result.YTSplanned,
//             WIPnos: result.WIPnos,
//             WIPplanned: result.WIPplanned
//           };
//           return acc;
//         }, {});

//         res.json({ projects: response, totalTaskCount });
//       })
//       .catch(error => {
//         console.error('Error processing project queries:', error);
//         res.status(500).send(error);
//       });
//   }
// };

//original
exports.totalHrs = (req, res) => {
  const employeeId = req.query.employeeId;
  const projectNames = req.query.projectNames;
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Token is required');
  }

  let userRole;
  try {
    const decryptedToken = decryptToken(token);
    userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
  } catch (error) {
    console.error('Error decrypting token:', error);
    return res.status(400).send('Invalid token');
  }

  if (!employeeId || !projectNames || !Array.isArray(projectNames)) {
    return res.status(400).send('employeeId and projectNames are required, and projectNames should be an array');
  }

  if (userRole === 'Employee') {
    const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;

    db.query(query1, (err, taskIdsResult) => {
      if (err) {
        console.error('Error executing query 1:', err.stack);
        return res.status(500).send('Database query error');
      }

      const taskIds = taskIdsResult.map(row => row.taskid).join(',');

      if (!taskIds.length) {
        return res.status(200).json({
          projects: projectNames.reduce((acc, projectName) => {
            acc[projectName] = { planned: 0, task_count: 0, actual: 0, YTSnos: 0, YTSplanned: 0, WIPnos: 0, WIPplanned: 0, WIPactual: 0 };
            return acc;
          }, {}),
          totalTaskCount: 0 // Return 0 if no tasks are found
        });
      }

      const projectQueries = projectNames.map(projectName => {
        return new Promise((resolve, reject) => {
          const taskIdsQuery = `
            SELECT id 
            FROM Task 
            WHERE projectName='${projectName}' AND id IN (${taskIds});
          `;

          db.query(taskIdsQuery, (err, taskIdResults) => {
            if (err) {
              console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
              return reject('Database query error');
            }

            const projectTaskIds = taskIdResults.map(row => row.id).join(',');

            if (!projectTaskIds.length) {
              resolve({
                projectName,
                planned: 0,
                taskCount: 0,
                actual: 0,
                YTSnos: 0,
                YTSplanned: 0,
                WIPnos: 0,
                WIPplanned: 0,
                WIPactual: 0
              });
              return;
            }

            const plannedQuery = `
              SELECT SUM(timetocomplete) as planned 
              FROM Task 
              WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
            `;

            const taskCountQuery = `
              SELECT COUNT(*) as task_count 
              FROM Task 
              WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
            `;

            const actualQuery = `
              SELECT SUM(actualtimetocomplete_emp) as actual 
              FROM Taskemp 
              WHERE taskid IN (${projectTaskIds});
            `;

            const YTSQuery = `
              SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
              FROM Task 
              WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
            `;

            const WIPQuery = `
              SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
              FROM Task 
              WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
            `;

            // New WIPactual query
            const WIPActualQuery = `
              SELECT SUM(actualtimetocomplete_emp) as WIPactual 
              FROM Taskemp 
              WHERE taskid IN (${projectTaskIds}) AND taskid IN (
                SELECT id FROM Task WHERE Status=2 AND projectName='${projectName}'
              );
            `;

            db.query(plannedQuery, (err, plannedResult) => {
              if (err) {
                console.error(`Error executing planned query for project ${projectName}:`, err.stack);
                return reject('Database query error');
              }

              const planned = plannedResult[0]?.planned || 0;

              db.query(taskCountQuery, (err, taskCountResult) => {
                if (err) {
                  console.error(`Error executing task count query for project ${projectName}:`, err.stack);
                  return reject('Database query error');
                }

                const taskCount = taskCountResult[0]?.task_count || 0;

                db.query(actualQuery, (err, actualResult) => {
                  if (err) {
                    console.error(`Error executing actual query for project ${projectName}:`, err.stack);
                    return reject('Database query error');
                  }

                  const actual = actualResult[0]?.actual || 0;

                  db.query(YTSQuery, (err, YTSResult) => {
                    if (err) {
                      console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
                      return reject('Database query error');
                    }

                    const YTSnos = YTSResult[0]?.YTSnos || 0;
                    const YTSplanned = YTSResult[0]?.YTSplanned || 0;

                    db.query(WIPQuery, (err, WIPResult) => {
                      if (err) {
                        console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
                        return reject('Database query error');
                      }

                      const WIPnos = WIPResult[0]?.WIPnos || 0;
                      const WIPplanned = WIPResult[0]?.WIPplanned || 0;

                      db.query(WIPActualQuery, (err, WIPActualResult) => {
                        if (err) {
                          console.error(`Error executing WIPActual query for project ${projectName}:`, err.stack);
                          return reject('Database query error');
                        }

                        const WIPactual = WIPActualResult[0]?.WIPactual || 0;

                        resolve({
                          projectName,
                          planned,
                          taskCount,
                          actual,
                          YTSnos,
                          YTSplanned,
                          WIPnos,
                          WIPplanned,
                          WIPactual
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });

      Promise.all(projectQueries)
        .then(results => {
          const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);

          const response = results.reduce((acc, result) => {
            acc[result.projectName] = {
              planned: result.planned,
              task_count: result.taskCount,
              actual: result.actual,
              YTSnos: result.YTSnos,
              YTSplanned: result.YTSplanned,
              WIPnos: result.WIPnos,
              WIPplanned: result.WIPplanned,
              WIPactual: result.WIPactual
            };
            return acc;
          }, {});

          res.json({ projects: response, totalTaskCount }); // Include totalTaskCount in the response
        })
        .catch(error => {
          console.error('Error processing project queries:', error);
          res.status(500).send(error);
        });
    });

  } else { // If the user role is not "Employee"
    const projectQueries = projectNames.map(projectName => {
      return new Promise((resolve, reject) => {
        const taskIdsQuery = `
          SELECT id 
          FROM Task 
          WHERE projectName='${projectName}';
        `;

        db.query(taskIdsQuery, (err, taskIdResults) => {
          if (err) {
            console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
            return reject('Database query error');
          }

          const projectTaskIds = taskIdResults.map(row => row.id).join(',');
          const taskCount = taskIdResults.length;

          if (!projectTaskIds.length) {
            resolve({
              projectName,
              planned: 0,
              taskCount: 0,
              actual: 0,
              YTSnos: 0,
              YTSplanned: 0,
              WIPnos: 0,
              WIPplanned: 0,
              WIPactual: 0
            });
            return;
          }

          const actualQuery = `
            SELECT SUM(actualtimetocomplete_emp) as TLTotalActual 
            FROM Taskemp 
            WHERE taskid IN (${projectTaskIds});
          `;

          const plannedQuery = `
            SELECT SUM(timetocomplete) as TLTotalPlanned 
            FROM Task 
            WHERE projectName='${projectName}';
          `;

          const YTSQuery = `
            SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
            FROM Task 
            WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
          `;

          const WIPQuery = `
            SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
            FROM Task 
            WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
          `;

          // New WIPactual query
          const WIPActualQuery = `
            SELECT SUM(actualtimetocomplete_emp) as WIPactual 
            FROM Taskemp 
            WHERE taskid IN (${projectTaskIds}) AND taskid IN (
              SELECT id FROM Task WHERE Status=2 AND projectName='${projectName}'
            );
          `;

          db.query(actualQuery, (err, actualResult) => {
            if (err) {
              console.error(`Error executing actual query for project ${projectName}:`, err.stack);
              return reject('Database query error');
            }

            const actual = actualResult[0]?.TLTotalActual || 0;

            db.query(plannedQuery, (err, plannedResult) => {
              if (err) {
                console.error(`Error executing planned query for project ${projectName}:`, err.stack);
                return reject('Database query error');
              }

              const planned = plannedResult[0]?.TLTotalPlanned || 0;

              db.query(YTSQuery, (err, YTSResult) => {
                if (err) {
                  console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
                  return reject('Database query error');
                }

                const YTSnos = YTSResult[0]?.YTSnos || 0;
                const YTSplanned = YTSResult[0]?.YTSplanned || 0;

                db.query(WIPQuery, (err, WIPResult) => {
                  if (err) {
                    console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
                    return reject('Database query error');
                  }

                  const WIPnos = WIPResult[0]?.WIPnos || 0;
                  const WIPplanned = WIPResult[0]?.WIPplanned || 0;

                  db.query(WIPActualQuery, (err, WIPActualResult) => {
                    if (err) {
                      console.error(`Error executing WIPActual query for project ${projectName}:`, err.stack);
                      return reject('Database query error');
                    }

                    const WIPactual = WIPActualResult[0]?.WIPactual || 0;

                    resolve({
                      projectName,
                      planned,
                      actual,
                      taskCount,
                      YTSnos,
                      YTSplanned,
                      WIPnos,
                      WIPplanned,
                      WIPactual
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    Promise.all(projectQueries)
      .then(results => {
        const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);
        const response = results.reduce((acc, result) => {
          acc[result.projectName] = {
            planned: result.planned,
            actual: result.actual,
            task_count: result.taskCount,
            YTSnos: result.YTSnos,
            YTSplanned: result.YTSplanned,
            WIPnos: result.WIPnos,
            WIPplanned: result.WIPplanned,
            WIPactual: result.WIPactual
          };
          return acc;
        }, {});

        res.json({ projects: response, totalTaskCount });
      })
      .catch(error => {
        console.error('Error processing project queries:', error);
        res.status(500).send(error);
      });
  }
};

//nos and planned
// exports.CMP = (req, res) => {
//   const employeeId = req.query.employeeId;
//   const projectNames = req.query.projectNames?.split(','); // Expecting a comma-separated list of project names
//   const token = req.query.token;

//   console.log('Received Request:', { employeeId, projectNames, token });

//   if (!token) {
//     console.log('Token is missing');
//     return res.status(400).send('Token is required');
//   }

//   let userRole;
//   try {
//     const decryptedToken = decryptToken(token);
//     userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
//     console.log('Decrypted Token:', decryptedToken);
//   } catch (error) {
//     console.error('Error decrypting token:', error);
//     return res.status(400).send('Invalid token');
//   }

//   if (!employeeId || !projectNames || !projectNames.length) {
//     console.log('Missing employeeId or projectNames');
//     return res.status(400).send('employeeId and projectNames are required');
//   }

//   if (userRole === 'Employee') {
//     console.log('User is authorized as Employee');

//     // Step 1: Get the task IDs assigned to the employee
//     const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;
//     console.log('Executing Query 1:', query1);

//     db.query(query1, (err, taskIdsResult) => {
//       if (err) {
//         console.error('Error executing query 1:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const taskIds = taskIdsResult.map(row => row.taskid);
//       console.log('Task IDs Retrieved:', taskIds);

//       if (!taskIds.length) {
//         console.log('No task IDs found for the given employee');
//         return res.status(200).json({
//           projects: projectNames.reduce((acc, projectName) => {
//             acc[projectName] = { CMPnos: 0, CMPplanned: 0 };
//             return acc;
//           }, {}),
//           totalTaskCount: 0
//         });
//       }

//       const projectQueries = projectNames.map((projectName) => {
//         return new Promise((resolve, reject) => {
//           // Get CMP Planned Hours
//           const getSortingPVQuery = `SELECT projsorting_pv FROM Logincrd WHERE id='${employeeId}'`;
//           console.log(`Executing Get Sorting PV Query for ${projectName}:`, getSortingPVQuery);

//           db.query(getSortingPVQuery, (err, sortingPVResult) => {
//             if (err) {
//               console.error(`Error executing sorting PV query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const sortingPV = sortingPVResult[0]?.projsorting_pv || 0;
//             console.log(`Sorting PV for ${projectName}:`, sortingPV);

//             const CMPplannedQuery = `
//               SELECT SUM(timetocomplete) as CMPplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${taskIds.join(',')}) AND aproved=1
//             `;
//             console.log(`Executing CMP Planned Query for ${projectName}:`, CMPplannedQuery);

//             db.query(CMPplannedQuery, (err, CMPplannedResult) => {
//               if (err) {
//                 console.error(`Error executing CMP planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const CMPplanned = CMPplannedResult[0]?.CMPplanned || 0;
//               console.log(`CMP Planned for ${projectName}:`, CMPplanned);

//               // Get CMP Nos
//               const CMPnosQuery = `
//                 SELECT COUNT(*) as CMPnos 
//                 FROM Task 
//                 WHERE projectName='${projectName}' AND id IN (${taskIds.join(',')}) AND aproved=1
//               `;
//               console.log(`Executing CMP Nos Query for ${projectName}:`, CMPnosQuery);

//               db.query(CMPnosQuery, (err, CMPnosResult) => {
//                 if (err) {
//                   console.error(`Error executing CMP nos query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const CMPnos = CMPnosResult[0]?.CMPnos || 0;
//                 console.log(`CMP Nos for ${projectName}:`, CMPnos);

//                 resolve({
//                   projectName,
//                   CMPnos,
//                   CMPplanned
//                 });
//               });
//             });
//           });
//         });
//       });

//       Promise.all(projectQueries)
//         .then(results => {
//           const totalTaskCount = results.reduce((acc, result) => acc + (result.CMPnos || 0), 0);
//           console.log('Total Task Count:', totalTaskCount);

//           const response = results.reduce((acc, result) => {
//             acc[result.projectName] = {
//               CMPnos: result.CMPnos,
//               CMPplanned: result.CMPplanned
//             };
//             return acc;
//           }, {});

//           console.log('Final Response:', { projects: response, totalTaskCount });
//           res.json({ projects: response, totalTaskCount });
//         })
//         .catch(error => {
//           console.error('Error in processing projects:', error);
//           res.status(500).send('Error processing projects');
//         });
//     });
//   } else {
//     console.log('Access forbidden: User role not authorized');
//     res.status(403).send('Access forbidden: User role not authorized');
//   }
// };



//CMP add 
// exports.totalHrs = (req, res) => {
//   const employeeId = req.query.employeeId;
//   const projectNames = req.query.projectNames;
//   const token = req.query.token;

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   let userRole;
//   try {
//     const decryptedToken = decryptToken(token);
//     userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
//   } catch (error) {
//     console.error('Error decrypting token:', error);
//     return res.status(400).send('Invalid token');
//   }

//   if (!employeeId || !projectNames || !Array.isArray(projectNames)) {
//     return res.status(400).send('employeeId and projectNames are required, and projectNames should be an array');
//   }

//   // Query to get the sorting PV
//   const getSortingPVQuery = `SELECT projsorting_pv FROM Logincrd WHERE id='${employeeId}'`;

//   if (userRole === 'Employee') {
//     const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;

//     db.query(query1, (err, taskIdsResult) => {
//       if (err) {
//         console.error('Error executing query 1:', err.stack);
//         return res.status(500).send('Database query error');
//       }

//       const taskIds = taskIdsResult.map(row => row.taskid).join(',');

//       if (!taskIds.length) {
//         return res.status(200).json({
//           projects: projectNames.reduce((acc, projectName) => {
//             acc[projectName] = { planned: 0, task_count: 0, actual: 0, YTSnos: 0, YTSplanned: 0, WIPnos: 0, WIPplanned: 0, WIPactual: 0, CMPnos: 0, CMPplanned: 0 };
//             return acc;
//           }, {}),
//           totalTaskCount: 0
//         });
//       }

//       const projectQueries = projectNames.map(projectName => {
//         return new Promise((resolve, reject) => {
//           const taskIdsQuery = `
//             SELECT id 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${taskIds});
//           `;

//           db.query(taskIdsQuery, (err, taskIdResults) => {
//             if (err) {
//               console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const projectTaskIds = taskIdResults.map(row => row.id).join(',');

//             if (!projectTaskIds.length) {
//               resolve({
//                 projectName,
//                 planned: 0,
//                 taskCount: 0,
//                 actual: 0,
//                 YTSnos: 0,
//                 YTSplanned: 0,
//                 WIPnos: 0,
//                 WIPplanned: 0,
//                 WIPactual: 0,
//                 CMPnos: 0,
//                 CMPplanned: 0
//               });
//               return;
//             }

//             const plannedQuery = `
//               SELECT SUM(timetocomplete) as planned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const taskCountQuery = `
//               SELECT COUNT(*) as task_count 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds});
//             `;

//             const actualQuery = `
//               SELECT SUM(actualtimetocomplete_emp) as actual 
//               FROM Taskemp 
//               WHERE taskid IN (${projectTaskIds});
//             `;

//             const YTSQuery = `
//               SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
//             `;

//             const WIPQuery = `
//               SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
//             `;

//             const WIPActualQuery = `
//               SELECT SUM(actualtimetocomplete_emp) as WIPactual 
//               FROM Taskemp 
//               WHERE taskid IN (${projectTaskIds}) AND taskid IN (
//                 SELECT id FROM Task WHERE Status=2 AND projectName='${projectName}'
//               );
//             `;

//             // New CMPplanned query
//             const CMPplannedQuery = `
//               SELECT SUM(timetocomplete) as CMPplanned 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND aproved=1;
//             `;

//             // New CMPnos query
//             const CMPnosQuery = `
//               SELECT COUNT(*) as CMPnos 
//               FROM Task 
//               WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND aproved=1;
//             `;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.planned || 0;

//               db.query(taskCountQuery, (err, taskCountResult) => {
//                 if (err) {
//                   console.error(`Error executing task count query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const taskCount = taskCountResult[0]?.task_count || 0;

//                 db.query(actualQuery, (err, actualResult) => {
//                   if (err) {
//                     console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const actual = actualResult[0]?.actual || 0;

//                   db.query(YTSQuery, (err, YTSResult) => {
//                     if (err) {
//                       console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
//                       return reject('Database query error');
//                     }

//                     const YTSnos = YTSResult[0]?.YTSnos || 0;
//                     const YTSplanned = YTSResult[0]?.YTSplanned || 0;

//                     db.query(WIPQuery, (err, WIPResult) => {
//                       if (err) {
//                         console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
//                         return reject('Database query error');
//                       }

//                       const WIPnos = WIPResult[0]?.WIPnos || 0;
//                       const WIPplanned = WIPResult[0]?.WIPplanned || 0;

//                       db.query(WIPActualQuery, (err, WIPActualResult) => {
//                         if (err) {
//                           console.error(`Error executing WIPActual query for project ${projectName}:`, err.stack);
//                           return reject('Database query error');
//                         }

//                         const WIPactual = WIPActualResult[0]?.WIPactual || 0;

//                         db.query(CMPplannedQuery, (err, CMPplannedResult) => {
//                           if (err) {
//                             console.error(`Error executing CMPplanned query for project ${projectName}:`, err.stack);
//                             return reject('Database query error');
//                           }

//                           const CMPplanned = CMPplannedResult[0]?.CMPplanned || 0;

//                           db.query(CMPnosQuery, (err, CMPnosResult) => {
//                             if (err) {
//                               console.error(`Error executing CMPnos query for project ${projectName}:`, err.stack);
//                               return reject('Database query error');
//                             }

//                             const CMPnos = CMPnosResult[0]?.CMPnos || 0;

//                             resolve({
//                               projectName,
//                               planned,
//                               taskCount,
//                               actual,
//                               YTSnos,
//                               YTSplanned,
//                               WIPnos,
//                               WIPplanned,
//                               WIPactual,
//                               CMPnos,
//                               CMPplanned
//                             });
//                           });
//                         });
//                       });
//                     });
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });

//       Promise.all(projectQueries)
//         .then(results => {
//           const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);

//           const response = results.reduce((acc, result) => {
//             acc[result.projectName] = {
//               planned: result.planned,
//               task_count: result.taskCount,
//               actual: result.actual,
//               YTSnos: result.YTSnos,
//               YTSplanned: result.YTSplanned,
//               WIPnos: result.WIPnos,
//               WIPplanned: result.WIPplanned,
//               WIPactual: result.WIPactual,
//               CMPnos: result.CMPnos,
//               CMPplanned: result.CMPplanned
//             };
//             return acc;
//           }, {});

//           res.json({ projects: response, totalTaskCount });
//         })
//         .catch(error => {
//           console.error('Error processing project queries:', error);
//           res.status(500).send(error);
//         });
//     });

//   } else { // If the user role is not "Employee"
//     const projectQueries = projectNames.map(projectName => {
//       return new Promise((resolve, reject) => {
//         const taskIdsQuery = `
//           SELECT id 
//           FROM Task 
//           WHERE projectName='${projectName}';
//         `;

//         db.query(taskIdsQuery, (err, taskIdResults) => {
//           if (err) {
//             console.error(`Error executing task IDs query for project ${projectName}:`, err.stack);
//             return reject('Database query error');
//           }

//           const projectTaskIds = taskIdResults.map(row => row.id).join(',');
//           const taskCount = taskIdResults.length;

//           if (!projectTaskIds.length) {
//             resolve({
//               projectName,
//               planned: 0,
//               taskCount: 0,
//               actual: 0,
//               YTSnos: 0,
//               YTSplanned: 0,
//               WIPnos: 0,
//               WIPplanned: 0,
//               WIPactual: 0,
//               CMPnos: 0,
//               CMPplanned: 0
//             });
//             return;
//           }

//           const actualQuery = `
//             SELECT SUM(actualtimetocomplete_emp) as TLTotalActual 
//             FROM Taskemp 
//             WHERE taskid IN (${projectTaskIds});
//           `;

//           const plannedQuery = `
//             SELECT SUM(timetocomplete) as TLTotalPlanned 
//             FROM Task 
//             WHERE projectName='${projectName}';
//           `;

//           const YTSQuery = `
//             SELECT COUNT(*) as YTSnos, SUM(timetocomplete) as YTSplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=1;
//           `;

//           const WIPQuery = `
//             SELECT COUNT(*) as WIPnos, SUM(timetocomplete) as WIPplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND Status=2;
//           `;

//           const WIPActualQuery = `
//             SELECT SUM(actualtimetocomplete_emp) as WIPactual 
//             FROM Taskemp 
//             WHERE taskid IN (${projectTaskIds}) AND taskid IN (
//               SELECT id FROM Task WHERE Status=2 AND projectName='${projectName}'
//             );
//           `;

//           // New CMPplanned query
//           const CMPplannedQuery = `
//             SELECT SUM(timetocomplete) as CMPplanned 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND aproved=1;
//           `;

//           // New CMPnos query
//           const CMPnosQuery = `
//             SELECT COUNT(*) as CMPnos 
//             FROM Task 
//             WHERE projectName='${projectName}' AND id IN (${projectTaskIds}) AND aproved=1;
//           `;

//           db.query(actualQuery, (err, actualResult) => {
//             if (err) {
//               console.error(`Error executing actual query for project ${projectName}:`, err.stack);
//               return reject('Database query error');
//             }

//             const actual = actualResult[0]?.TLTotalActual || 0;

//             db.query(plannedQuery, (err, plannedResult) => {
//               if (err) {
//                 console.error(`Error executing planned query for project ${projectName}:`, err.stack);
//                 return reject('Database query error');
//               }

//               const planned = plannedResult[0]?.TLTotalPlanned || 0;

//               db.query(YTSQuery, (err, YTSResult) => {
//                 if (err) {
//                   console.error(`Error executing YTS query for project ${projectName}:`, err.stack);
//                   return reject('Database query error');
//                 }

//                 const YTSnos = YTSResult[0]?.YTSnos || 0;
//                 const YTSplanned = YTSResult[0]?.YTSplanned || 0;

//                 db.query(WIPQuery, (err, WIPResult) => {
//                   if (err) {
//                     console.error(`Error executing WIP query for project ${projectName}:`, err.stack);
//                     return reject('Database query error');
//                   }

//                   const WIPnos = WIPResult[0]?.WIPnos || 0;
//                   const WIPplanned = WIPResult[0]?.WIPplanned || 0;

//                   db.query(WIPActualQuery, (err, WIPActualResult) => {
//                     if (err) {
//                       console.error(`Error executing WIPActual query for project ${projectName}:`, err.stack);
//                       return reject('Database query error');
//                     }

//                     const WIPactual = WIPActualResult[0]?.WIPactual || 0;

//                     db.query(CMPplannedQuery, (err, CMPplannedResult) => {
//                       if (err) {
//                         console.error(`Error executing CMPplanned query for project ${projectName}:`, err.stack);
//                         return reject('Database query error');
//                       }

//                       const CMPplanned = CMPplannedResult[0]?.CMPplanned || 0;

//                       db.query(CMPnosQuery, (err, CMPnosResult) => {
//                         if (err) {
//                           console.error(`Error executing CMPnos query for project ${projectName}:`, err.stack);
//                           return reject('Database query error');
//                         }

//                         const CMPnos = CMPnosResult[0]?.CMPnos || 0;

//                         resolve({
//                           projectName,
//                           planned,
//                           actual,
//                           taskCount,
//                           YTSnos,
//                           YTSplanned,
//                           WIPnos,
//                           WIPplanned,
//                           WIPactual,
//                           CMPnos,
//                           CMPplanned
//                         });
//                       });
//                     });
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });
//     });

//     Promise.all(projectQueries)
//       .then(results => {
//         const totalTaskCount = results.reduce((acc, result) => acc + result.taskCount, 0);
//         const response = results.reduce((acc, result) => {
//           acc[result.projectName] = {
//             planned: result.planned,
//             actual: result.actual,
//             task_count: result.taskCount,
//             YTSnos: result.YTSnos,
//             YTSplanned: result.YTSplanned,
//             WIPnos: result.WIPnos,
//             WIPplanned: result.WIPplanned,
//             WIPactual: result.WIPactual,
//             CMPnos: result.CMPnos,
//             CMPplanned: result.CMPplanned
//           };
//           return acc;
//         }, {});

//         res.json({ projects: response, totalTaskCount });
//       })
//       .catch(error => {
//         console.error('Error processing project queries:', error);
//         res.status(500).send(error);
//       });
//   }
// };

exports.CMP = (req, res) => {
  const employeeId = req.query.employeeId;
  const projectNames = req.query.projectNames?.split(','); // Expecting a comma-separated list of project names
  const token = req.query.token;

  console.log('Received Request:', { employeeId, projectNames, token });

  if (!token) {
    console.log('Token is missing');
    return res.status(400).send('Token is required');
  }

  let userRole;
  try {
    const decryptedToken = decryptToken(token);
    userRole = decryptedToken?.Type; // Extract the user role from the decrypted token
    console.log('Decrypted Token:', decryptedToken);
  } catch (error) {
    console.error('Error decrypting token:', error);
    return res.status(400).send('Invalid token');
  }

  if (!employeeId || !projectNames || !projectNames.length) {
    console.log('Missing employeeId or projectNames');
    return res.status(400).send('employeeId and projectNames are required');
  }

  if (userRole === 'Employee') {
    console.log('User is authorized as Employee');

    // Step 1: Get the task IDs assigned to the employee
    const query1 = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp=${employeeId}`;
    console.log('Executing Query 1:', query1);

    db.query(query1, (err, taskIdsResult) => {
      if (err) {
        console.error('Error executing query 1:', err.stack);
        return res.status(500).send('Database query error');
      }

      const taskIds = taskIdsResult.map(row => row.taskid);
      console.log('Task IDs Retrieved:', taskIds);

      if (!taskIds.length) {
        console.log('No task IDs found for the given employee');
        return res.status(200).json({
          projects: projectNames.reduce((acc, projectName) => {
            acc[projectName] = { CMPnos: 0, CMPplanned: 0, CMPactual: 0 };
            return acc;
          }, {}),
          totalTaskCount: 0
        });
      }

      const projectQueries = projectNames.map((projectName) => {
        return new Promise((resolve, reject) => {
          // Get CMP Planned Hours
          const getSortingPVQuery = `SELECT projsorting_pv FROM indiscpx_taskdb_2.Logincrd WHERE id='${employeeId}'`;
          console.log(`Executing Get Sorting PV Query for ${projectName}:`, getSortingPVQuery);

          db.query(getSortingPVQuery, (err, sortingPVResult) => {
            if (err) {
              console.error(`Error executing sorting PV query for project ${projectName}:`, err.stack);
              return reject('Database query error');
            }

            const sortingPV = sortingPVResult[0]?.projsorting_pv || 0;
            console.log(`Sorting PV for ${projectName}:`, sortingPV);

            const CMPplannedQuery = `
              SELECT SUM(timetocomplete) as CMPplanned 
              FROM Task 
              WHERE projectName='${projectName}' AND id IN (${taskIds.join(',')}) AND aproved=1
            `;
            console.log(`Executing CMP Planned Query for ${projectName}:`, CMPplannedQuery);

            db.query(CMPplannedQuery, (err, CMPplannedResult) => {
              if (err) {
                console.error(`Error executing CMP planned query for project ${projectName}:`, err.stack);
                return reject('Database query error');
              }

              const CMPplanned = CMPplannedResult[0]?.CMPplanned || 0;
              console.log(`CMP Planned for ${projectName}:`, CMPplanned);

              // Get CMP Nos and store approved task IDs
              const CMPnosQuery = `
                SELECT id 
                FROM Task 
                WHERE projectName='${projectName}' AND id IN (${taskIds.join(',')}) AND aproved=1
              `;
              console.log(`Executing CMP Nos Query for ${projectName}:`, CMPnosQuery);

              db.query(CMPnosQuery, (err, CMPnosResult) => {
                if (err) {
                  console.error(`Error executing CMP nos query for project ${projectName}:`, err.stack);
                  return reject('Database query error');
                }

                const approvedTaskIds = CMPnosResult.map(row => row.id);
                const CMPnos = approvedTaskIds.length;
                console.log(`Approved Task IDs for ${projectName}:`, approvedTaskIds);

                if (approvedTaskIds.length === 0) {
                  console.log(`No approved tasks for ${projectName}, skipping CMPactualQuery`);
                  resolve({
                    projectName,
                    CMPnos,
                    CMPplanned,
                    CMPactual: 0 // No actual hours since there are no approved tasks
                  });
                } else {
                  // Get CMP Actual Hours using approved task IDs
                  const CMPactualQuery = `
                    SELECT SUM(actualtimetocomplete_emp) as CMPactual 
                    FROM Taskemp 
                    WHERE taskid IN (${approvedTaskIds.join(',')})
                  `;
                  console.log(`Executing CMP Actual Query for ${projectName}:`, CMPactualQuery);

                  db.query(CMPactualQuery, (err, CMPactualResult) => {
                    if (err) {
                      console.error(`Error executing CMP actual query for project ${projectName}:`, err.stack);
                      return reject('Database query error');
                    }

                    const CMPactual = CMPactualResult[0]?.CMPactual || 0;
                    console.log(`CMP Actual for ${projectName}:`, CMPactual);

                    resolve({
                      projectName,
                      CMPnos,
                      CMPplanned,
                      CMPactual
                    });
                  });
                }
              });
            });
          });
        });
      });

      Promise.all(projectQueries)
        .then(results => {
          const totalTaskCount = results.reduce((acc, result) => acc + (result.CMPnos || 0), 0);
          console.log('Total Task Count:', totalTaskCount);

          const response = results.reduce((acc, result) => {
            acc[result.projectName] = {
              CMPnos: result.CMPnos,
              CMPplanned: result.CMPplanned,
              CMPactual: result.CMPactual
            };
            return acc;
          }, {});

          console.log('Final Response:', { projects: response, totalTaskCount });
          res.json({ projects: response, totalTaskCount });
        })
        .catch(error => {
          console.error('Error in processing projects:', error);
          res.status(500).send('Error processing projects');
        });
    });
  } else {
    console.log('Access forbidden: User role not authorized');
    res.status(403).send('Access forbidden: User role not authorized');
  }
};