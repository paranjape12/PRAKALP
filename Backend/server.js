const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');


const app = express();
const port = 3001;

app.use(cors());


//Create a MySQL db
// const db = mysql.createConnection({
//   host: '103.195.185.168',
//   user: 'indiscpx_TASKDB_2',
//   password: 'Protovec123',
//   database: 'indiscpx_TASKDB_2',
// });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'indiscpx_taskdb_2',
});

/* remote DB dtls
  host: '103.195.185.168',
  user: 'indiscpx_TASKDB_2',
  password: 'Protovec123',
  database: 'indiscpx_TASKDB_2',*/

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Decrypt Token Function
function decryptToken(token) {
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  const userData = JSON.parse(decodedToken)[0];
  return userData;
}


// FAMT Profile Api
app.post('/api/profile', (req, res) => {
  const { U_id } = req.body;
  const query = "SELECT * FROM Logincrd WHERE id = ?";
  db.query(query, [U_id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length > 0) {
      const user = result[0];
      user.password = Buffer.from(user.Password, 'base64').toString('utf8');
      if (!user.Location) user.Location = 'Ratnagiri';
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Endpoint to update user profile
app.put('/api/profile', (req, res) => {
  const { U_id, name, email, password, location } = req.body;
  const encodedPassword = Buffer.from(password).toString('base64');
  const query = `
      UPDATE Logincrd
      SET Name = ?, Email = ?, Password = ?, Location = ?
      WHERE id = ?
  `;
  db.query(query, [name, email, encodedPassword, location, U_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Profile updated successfully');
  });
});



// FAMT API endpoint to handle createTask POST request
app.post('/api/createTask', (req, res) => {
  const { ProjectName, TaskName, Empname, islasttask, taskdetails, hr, min, assignDate, hrAssign, minAssign, token } = req.body;

  const userData = decryptToken(token);
  const AssignBy = userData.id;

  // Calculate task completion time in seconds
  const taskcompletedat = (parseInt(hr) * 3600) + (parseInt(min) * 60);
  const taskcompleteat_assign = (parseInt(hrAssign) * 3600) + (parseInt(minAssign) * 60);

  // SQL query to check if the last task exists
  let sql = `SELECT ProjectName FROM projects WHERE ProjectName = ? AND lasttask = '1'`;
  db.query(sql, [ProjectName], (err, result) => {
    if (err) {
      console.error('Error executing SQL:', err);
      res.status(500).send('Error');
    } else {
      if (result.length > 0) {
        const lasttaskchange = req.body.lasttaskchange || 0;
        if (lasttaskchange == 1) {
          let updateProjectSql = `UPDATE projects SET lasttask = ? WHERE ProjectName = ?`;
          db.query(updateProjectSql, [islasttask, ProjectName], (err, result) => {
            if (err) {
              console.error('Error updating project:', err);
              res.status(500).send('Error');
            } else {
              // Insert task details into Task table
              insertTask();
            }
          });
        } else {
          res.send('Last Task exist');
        }
      } else {
        // Update projects table if last task doesn't exist
        let updateProjectSql = `UPDATE projects SET lasttask = ? WHERE ProjectName = ?`;
        db.query(updateProjectSql, [islasttask, ProjectName], (err, result) => {
          if (err) {
            console.error('Error updating project:', err);
            res.status(500).send('Error');
          } else {
            insertTask();
          }
        });
      }
    }
  });

  function insertTask() {
    let insertTaskSql = `INSERT INTO Task (projectName, TaskName, TaskTime, taskDetails, AssignBy, timetocomplete) VALUES (?, ?, NOW(), ?, ?, ?)`;
    db.query(insertTaskSql, [ProjectName, TaskName, taskdetails, AssignBy, taskcompletedat], (err, result) => {
      if (err) {
        console.error('Error inserting task:', err);
        res.status(500).send('Error');
      } else {
        // Get the inserted task id
        const taskId = result.insertId;
        // Update projects table with the task id
        let updateProjectSql = `UPDATE projects SET lasttask = ?, taskid = ? WHERE ProjectName = ?`;
        db.query(updateProjectSql, [islasttask, taskId, ProjectName], (err, result) => {
          if (err) {
            console.error('Error updating project:', err);
            res.status(500).send('Error');
          } else {
            // Insert task employee details into Taskemp table if Empname is provided
            if (Empname !== 'Selectedemp') {
              let insertTaskEmpSql = `INSERT INTO Taskemp (taskid, tasktimeemp, AssignedTo_emp, timetocomplete_emp) VALUES (?, ?, ?, ?)`;
              db.query(insertTaskEmpSql, [taskId, assignDate, AssignBy, taskcompleteat_assign], (err, result) => {
                if (err) {
                  console.error('Error inserting task employee:', err);
                  res.status(500).send('Error');
                } else {
                  res.send('Success');
                }
              });
            } else {
              res.send('Success');
            }
          }
        });
      }
    });
  }
});

// FAMT API Endpoint for Decrypted Token
app.post('/api/empDropdown', (req, res) => {
  const { token } = req.body;
  const userData = decryptToken(token);
  if (userData.Type !== 'Admin' && userData.Type !== 'Team Leader') {
    const query = `SELECT * FROM Logincrd WHERE id='${userData.id}' AND disableemp!='1' ORDER BY Name ASC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(result);
      }
    });
  } else {
    const query = `SELECT * FROM Logincrd WHERE disableemp!='1' ORDER BY Name ASC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(result);
      }
    });
  }
});


// FAMT API to fetch task data 
app.get('/api/task', (req, res) => {
  const projectName = req.query.projectName;

  if (!projectName) {
    return res.status(400).send('Project name is required');
  }

  const query = 'SELECT * FROM `Task` WHERE `projectName` = ?';
  db.query(query, [projectName], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Error fetching tasks');
    }

    res.json(results);
  });
});


// FAMT API endpoint to register new user
app.post('/api/register', (req, res) => {
  const { email, fname, lname, slectedval, passwd } = req.body;
  console.log("req.body : ", req);
  const password = Buffer.from(passwd).toString('base64'); // Encrypting password

  const selectQuery = 'SELECT * FROM Logincrd WHERE Email=? OR Password=?';
  db.query(selectQuery, [email, password], (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Error occurred while executing query' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const insertQuery = 'INSERT INTO Logincrd (Name, Nickname, Email, Password, Type, Location) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [fname, lname, email, password, 'Employee', slectedval], (error, results) => {
      if (error) {
        res.status(500).json({ message: 'Error occurred while inserting data' });
        return;
      }

      res.status(200).json({ message: 'Success' });
    });
  });
});


///////Projects Table////////

//  FAMT API Endpoint to add a new project
app.post('/api/addProject', (req, res) => {
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
});


//FAMT API Save api 
app.post('/saveProject', (req, res) => {
  const { ProjectName, ProjectSalesOrder } = req.body;
  const firstchar = ProjectSalesOrder.charAt(0);
  const withSpace = ProjectSalesOrder.length;

  const query = 'INSERT INTO projects (name, sales_order, first_char, length_with_space) VALUES (?, ?, ?, ?)';
  db.query(query, [ProjectName, ProjectSalesOrder, firstchar, withSpace], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Project saved!');
  });
});


// FAMT API to fetch task data 
app.get('/api/task', (req, res) => {
  const projectName = req.query.projectName;

  if (!projectName) {
    return res.status(400).send('Project name is required');
  }

  const query = 'SELECT * FROM Task WHERE projectName = ?';
  db.query(query, [projectName], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Error fetching tasks');
    }

    res.json(results);
  });
});




// FAMT API endpoint to create Copy project
app.post('/api/createCopyProject', (req, res) => {
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
});


// FAMT API Endpoint to assign task to employee
app.post('/api/assignTask', (req, res) => {
  const {
    valuetask,
    inputminaray,
    inputhraray,
    Activity,
    Dateassign,
    token
  } = req.body;

  const userData = decryptToken(token);
  const empid = userData.id;

  const date = new Date(Dateassign);
  date.setHours(0, 0, 1); // Set hours, minutes, seconds to 00:00:01
  const todaydatetime = date.toISOString().split('T')[0] + ' 00:00:01';
  const todaydatetime2 = date.toISOString().replace('T', ' ').slice(0, 19);

  const selectQuery = `SELECT * FROM Taskemp WHERE DATE(tasktimeemp) = ? AND taskid = ? AND AssignedTo_emp = ?`;
  db.query(selectQuery, [todaydatetime.split(' ')[0], valuetask, empid], (err, result) => {
    if (err) throw err;

    const taskcomleteat = parseInt(inputhraray) * 3600 + parseInt(inputminaray) * 60;

    if (result.length > 0) {
      const updateQuery = `UPDATE Taskemp SET timetocomplete_emp = ?, Activity = ? WHERE DATE(tasktimeemp) = ? AND taskid = ? AND AssignedTo_emp = ?`;
      db.query(updateQuery, [taskcomleteat, Activity, todaydatetime.split(' ')[0], valuetask, empid], (err, result) => {
        if (err) throw err;

        const query = `SELECT * FROM Logincrd WHERE id = ?`;
        db.query(query, [empid], (err, queryResult) => {
          if (err) throw err;
          const rowqueryResult = queryResult[0];
          const finalmsg = 'Task already assigned to ' + rowqueryResult.Name + '.';
          res.send(finalmsg);
        });
      });
    } else {
      const insertQuery = `INSERT INTO Taskemp (taskid, tasktimeemp, timetocomplete_emp, taskDetails_emp, AssignedTo_emp, Activity) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(insertQuery, [valuetask, todaydatetime, taskcomleteat, '', empid, Activity], (err, result) => {
        if (err) throw err;

        const query = `SELECT * FROM Logincrd WHERE id = ?`;
        db.query(query, [empid], (err, queryResult) => {
          if (err) throw err;
          const rowqueryResult = queryResult[0];
          const finalmsg = 'Task assigned successfully to ' + rowqueryResult.Name + '.';
          res.send(finalmsg);
        });
      });
    }
  });
});


// FAMT API Endpoint to fetch project names 
app.get('/api/getProjectNames', (req, res) => {
  const sql = 'SELECT projectName FROM projects ORDER BY `projectName` ASC'; // Assuming 'projectName' is the column containing project names
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project names:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const projectNames = results.map((row) => row.projectName);
    res.json(projectNames);
  });
});



// Endpoint to fetch projects table data from the database
app.get('/api/getProjects', (req, res) => {
  const sql = 'SELECT * FROM projects';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching projects from database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Projects fetched from database');
      res.status(200).json(result);
    }
  });
});


// FAMT API for email login
app.post('/api/getLogin', (req, res) => {
  const { email, pass, rememberMe } = req.body;

  const selectlogin = `SELECT * FROM Logincrd WHERE Email=? AND Password=?`;

  db.query(selectlogin, [email, pass], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error');
      return;
    }

    if (result.length === 0) {
      return res.status(401).send('Error: Invalid credentials');
    }

    if (rememberMe === 'true') {
      res.cookie('username', email, { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true });
      res.cookie('password', pass, { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true });
    } else {
      res.clearCookie('username');
      res.clearCookie('password');
    }
    res.send({ message: 'Success', result: result });
  });
});

// FAMT API Endpoint to update user profile
app.post('/api/updateUser', (req, res) => {
  const { id, name, Email, Password, location } = req.body;
  const passwordBase64 = Buffer.from(Password).toString('base64');

  // Check if the user is trying to update with unchanged data
  const checkQuery = `SELECT * FROM Logincrd WHERE id='${id}'`;
  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error');
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      if (
        user.Name === name &&
        user.Email === Email &&
        user.Password === passwordBase64 &&
        user.Location === location
      ) {
        res.status(400).send('User already exists');
        return;
      }

      // Update query if data is changed
      const updateQuery = `UPDATE Logincrd SET Name='${name}', Email='${Email}', Password='${passwordBase64}', Location='${location}' WHERE id='${id}'`;
      db.query(updateQuery, (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).send('Error');
          return;
        }
        res.status(200).send('Success');
      });
    } else {
      res.status(404).send('User not found');
    }
  });
});


// FAMT API to handle project sorting
app.post('/api/updateProjectSorting', (req, res) => {
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
});


// FAMT API to fetch data displayed on task overview page
app.post('/api/taskOverview', (req, res) => {
  const token = req.body.token;
  const is_complete = req.body.is_complete;

  if (!token) {
    return res.status(400).send('Token is required');
  }

  const userData = decryptToken(token);
  const U_type = userData.Type;
  const u_id = userData.id;
  let arrselectemptask = [];

  if (U_type !== 'Admin' && U_type !== 'Team Leader') {
    const selectTaskEmpQuery = `SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`;
    db.query(selectTaskEmpQuery, [u_id], (err, taskResults) => {
      if (err) {
        console.error('Error executing task query:', err.stack);
        return res.status(500).send('Database query error');
      }

      arrselectemptask = taskResults.map(row => row.taskid);

      getProjSortingAndProjects();
    });
  } else {
    getProjSortingAndProjects();
  }

  function getProjSortingAndProjects() {
    const loginQuerySort = `SELECT projsorting FROM Logincrd WHERE id = ?`;
    db.query(loginQuerySort, [u_id], (err, loginResults) => {
      if (err) {
        console.error('Error executing login query:', err.stack);
        return res.status(500).send('Database query error');
      }

      const proj_sort_str = loginResults.length > 0 ? loginResults[0].projsorting : '';
      const proj_sort = proj_sort_str ? proj_sort_str.split(' ') : [];

      let selectProjectQuery;
      if (proj_sort_str === '') {
        selectProjectQuery = `SELECT * FROM projects`;
      } else {
        const sort_Status = proj_sort.map(status => `'${status}'`).join(',');
        selectProjectQuery = `SELECT * FROM projects WHERE Status IN (${sort_Status})`;
      }

      db.query(selectProjectQuery, (err, projectResults) => {
        if (err) {
          console.error('Error executing project query:', err.stack);
          return res.status(500).send('Database query error');
        }

        let response = [];
        let count = 0;
        projectResults.forEach(project => {
          const projectId = project.id;
          const projectName = project.ProjectName;
          const projectSalesOrder = project.sales_order;
          const proj_status = project.Status;
          const projectLastTask = project.lasttask;

          let selcttask;
          if (U_type !== 'Admin' && U_type !== 'Team Leader') {
            selcttask = `SELECT te.id, te.taskid, p.TaskName, te.timetocomplete_emp, p.timetocomplete, SUM(te.actualtimetocomplete_emp) AS total_actual_time,p.taskDetails,p.Status, p.aproved FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ? GROUP BY te.taskid, p.TaskName ORDER BY te.taskid;`;
          } else {
            selcttask = `SELECT * FROM Task WHERE projectName = ?`;
          }

          db.query(selcttask, [u_id, projectName], (err, taskResults) => {
            if (err) {
              console.error('Error executing task query:', err.stack);
              return res.status(500).send('Database query error');
            }

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
            db.query(timeQuery, [u_id, projectName], (err, timeResults) => {
              if (err) {
                console.error('Error executing time query:', err.stack);
                return res.status(500).send('Database query error');
              }

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
              if (count === projectResults.length) {
                res.json(response);
              }
            });
          });
        });
      });
    });
  }
});



// FAMT API to edit project details
app.post('/api/updateProject', async (req, res) => {
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
});


// FAMT API Endpoint for deleting project and associated tasks
app.post('/api/deleteProject', (req, res) => {
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
});

// FAMT API endpoint to display data in task info dialog
app.post('/api/taskInfoDialog', (req, res) => {
  const { token, taskId } = req.body;

  if (!token || !taskId) {
    return res.status(400).json({ error: 'Token and taskId are required' });
  }

  try {
    const userData = decryptToken(token);
    const userId = userData.id;
    const userType = userData.Type;
    const userName = userData.Name;

    let query = '';

    if (userType === 'Employee') {
      query = `SELECT * FROM Taskemp WHERE AssignedTo_emp = '${userId}' AND taskid = '${taskId}'`;
    } else {
      query = `SELECT * FROM Taskemp WHERE taskid = '${taskId}'`;
    }

    db.query(query, (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Database query failed' });
      }
      return res.status(200).json({ results, userName });
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token' });
  }
});

// FAMT API endpoint to save edited task details
app.post('/api/saveEditTask', (req, res) => {
  const {
    projectName,
    taskName,
    originalTaskName,
    lastTask,
    taskActualTime,
    taskDetails,
    approvalStatus = 0 // Set default value for approvalStatus
  } = req.body;

  const isLast = lastTask ? 1 : 0;

  // Fetch the task ID before performing updates
  const getTaskIdQuery = `SELECT id FROM Task WHERE projectName = ? AND TaskName = ?`;
  db.query(getTaskIdQuery, [projectName, originalTaskName], (err, results) => {
    if (err) {
      console.error('Error fetching task ID:', err);
      return res.status(500).send('Error fetching task ID');
    }

    if (results.length > 0) {
      const taskId = results[0].id;

      if (isLast === 1) {
        const isLastTaskExistQuery = `SELECT ProjectName FROM projects WHERE ProjectName = ? AND lasttask = '1'`;
        db.query(isLastTaskExistQuery, [projectName], (err, result) => {
          if (err) {
            console.error('Error checking last task existence:', err);
            return res.status(500).send('Error checking last task existence');
          }

          if (result.length > 0) {
            console.log('Last task already exists for project:', projectName);
            res.send('Last Task exists');
          } else {
            updateProjectAndTask(projectName, taskId, taskName, taskDetails, taskActualTime, approvalStatus, res);
          }
        });
      } else {
        const updateProjectQuery = `UPDATE projects SET lasttask = '0' WHERE ProjectName = ?`;
        db.query(updateProjectQuery, [projectName], (err) => {
          if (err) {
            console.error('Error updating project:', err);
            return res.status(500).send('Error updating project');
          }
          updateTask(projectName, taskId, taskName, taskDetails, taskActualTime, approvalStatus, res);
        });
      }
    } else {
      console.log('Task not found for project:', projectName, 'and original task name:', originalTaskName);
      return res.status(404).send('Task not found');
    }
  });
});

const updateProjectAndTask = (projectName, taskId, taskName, taskDetails, taskActualTime, approvalStatus, res) => {
  // Update the project to set the last task flag
  const updateProjectQuery = `UPDATE projects SET lasttask = '1' WHERE ProjectName = ?`;
  db.query(updateProjectQuery, [projectName], (err) => {
    if (err) {
      console.error('Error updating project:', err);
      return res.status(500).send('Error updating project');
    }

    // Proceed to update the task
    updateTask(projectName, taskId, taskName, taskDetails, taskActualTime, approvalStatus, res);
  });
};

const updateTask = (projectName, taskId, taskName, taskDetails, taskActualTime, approvalStatus, res) => {
  // Update the task with the new details
  const updateTaskQuery = `
    UPDATE Task
    SET projectName = ?, TaskName = ?, taskDetails = ?, timetocomplete = ?, aproved = ?
    WHERE id = ?`;

  db.query(updateTaskQuery, [projectName, taskName, taskDetails, taskActualTime, approvalStatus, taskId], (err) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).send('Error updating task');
    }

    // Proceed to update related task employees (assuming this function exists)
    updateTaskEmp(taskId, taskDetails, taskActualTime, res);
  });
};


const updateTaskEmp = (taskId, taskDetails, taskActualTime, res) => {
  const updateTaskEmpQuery = `UPDATE Taskemp SET taskDetails_emp = ?, timetocomplete_emp = ? WHERE taskid = ?`;
  db.query(updateTaskEmpQuery, [taskDetails, taskActualTime, taskId], (err) => {
    if (err) {
      console.error('Error updating Taskemp:', err);
      return res.status(500).send('Error updating Taskemp');
    }
    res.send('Success');
  });
};

// FAMT API endpoint to save edited task details
app.post('/api/deleteTask', (req, res) => {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).send('Task ID is required');
  }

  const deleteTaskQuery = 'DELETE FROM `Task` WHERE id = ?';
  const deleteTaskEmpQuery = 'DELETE FROM `Taskemp` WHERE taskid = ?';

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send('Error starting delete operation.');
    }

    db.query(deleteTaskQuery, [taskId], (err, result) => {
      if (
        err) {
        return db.rollback(() => {
          res.status(500).send('Error deleting from Task table.');
        });
      }

      db.query(deleteTaskEmpQuery, [taskId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send('Error deleting from Taskemp table.');
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send('Error committing transaction');
            });
          }
          res.send('Success');
        });
      });
    });
  });
});


// FAMT API Endpoint to handle planned and actual task times off agg view
app.post('/api/aggViewPATimes', (req, res) => {
  const projectName = req.body.projectName; // Project name received from frontend
  const dates = req.body.dates; // Array of dates received from frontend

  // Query to get task IDs based on project name
  const sqlGetTaskIds = `
    SELECT id
    FROM Task
    WHERE projectName = ?
  `;

  db.query(sqlGetTaskIds, projectName, (err, taskResults) => {
    if (err) {
      console.log('Error executing task ID query:', err);
      res.status(500).json({ error: 'Error executing task ID query' });
      return;
    }

    // Extract task IDs from the results
    const taskIds = taskResults.map(result => result.id);

    // Query to get SUMs from Taskemp table based on dates and task IDs
    const sqlGetSums = `
      SELECT SUM(timetocomplete_emp) AS planned,
             SUM(actualtimetocomplete_emp) AS actual
      FROM Taskemp
      WHERE DATE(tasktimeemp) IN (?)
        AND taskid IN (?)
    `;

    // Execute the second query with task IDs and dates
    db.query(sqlGetSums, [dates, taskIds], (err, sumResults) => {
      if (err) {
        console.log('Error executing SUM query:', err);
        res.status(500).json({ error: 'Error executing SUM query' });
        return;
      }

      // Assuming results are returned as an array with a single object
      const summary = sumResults[0];
      res.json(summary); // Return the summary as JSON response
    });
  });
});


// FAMT API Endpoint to handle planned and actual task times off ind view
app.post('/api/indViewPATimes', (req, res) => {
  const projectName = req.body.projectName; // Project name received from frontend
  const dates = req.body.dates; // Array of dates received from frontend

  // Query to get task IDs based on project name
  const sqlGetTaskIds = `
    SELECT id
    FROM Task
    WHERE projectName = ?
  `;

  db.query(sqlGetTaskIds, projectName, (err, taskResults) => {
    if (err) {
      console.log('Error executing task ID query:', err);
      res.status(500).json({ error: 'Error executing task ID query' });
      return;
    }

    // Extract task IDs from the results
    const taskIds = taskResults.map(result => result.id);

    // Query to get SUMs from Taskemp table based on dates and task IDs
    const sqlGetSums = `
      SELECT taskid, timetocomplete_emp AS planned,
             actualtimetocomplete_emp AS actual
      FROM Taskemp
      WHERE DATE(tasktimeemp) IN (?)
        AND taskid IN (?)
    `;

    // Execute the second query with task IDs and dates
    db.query(sqlGetSums, [dates, taskIds], (err, sumResults) => {
      if (err) {
        console.log('Error executing ind query:', err);
        res.status(500).json({ error: 'Error executing SUM query' });
        return;
      }

      res.json(sumResults);
    });
  });
});

// FAMT API Endpoint to edit complete the task popup
app.post('/api/completeTask', (req, res) => {
  const { id, min, hr, msg, tid, isChecked, isChecked2, isChecked3, token } = req.body;

  let userData;
  try {
    userData = decryptToken(token);
  } catch (err) {
    return res.status(400).send('Invalid token');
  }

  const AssignBy = userData.id;

  let checkval = '';
  const taskcomleteat = (parseInt(hr) * 3600) + (parseInt(min) * 60);

  if (isChecked) {
    checkval = '1';
  } else if (isChecked2) {
    checkval = '2';
  } else if (isChecked3) {
    checkval = '0';
  }

  const updateTaskQuery = `UPDATE Task SET Status=?, statusby=? WHERE id=?`;
  const updateTaskValues = [checkval, AssignBy, tid];

  db.query(updateTaskQuery, updateTaskValues, (err, result) => {
    if (err) {
      return res.status(500).send('Error updating task');
    }

    let updateTaskEmpQuery = '';
    if (msg === '') {
      updateTaskEmpQuery = `UPDATE Taskemp SET actualtimetocomplete_emp=? WHERE id=?`;
    } else {
      updateTaskEmpQuery = `UPDATE Taskemp SET actualtimetocomplete_emp=?, tasklog=? WHERE id=?`;
    }
    const updateTaskEmpValues = msg === '' ? [taskcomleteat, id] : [taskcomleteat, msg, id];

    db.query(updateTaskEmpQuery, updateTaskEmpValues, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error');
      }
      res.send('Success');
    });
  });
});

// FAMT API endpoint employee overview project cell aggregate View
app.post('/api/empOverviewPrjIndividual', (req, res) => {
  const { employeeid } = req.body;
  if (!employeeid) {
    return res.status(400).send('employeeid is required');
  }

  const query1 = 'SELECT DISTINCT taskid FROM `Taskemp` WHERE AssignedTo_emp = ?';

  db.query(query1, [employeeid], (err, result) => {
    if (err) return res.status(500).send(err);

    const taskIds = result.map(row => row.taskid);

    if (taskIds.length === 0) {
      return res.status(404).send('No tasks found for this employee');
    }

    const placeholders = taskIds.map(() => '?').join(',');
    const query2 = `SELECT DISTINCT projectName FROM \`Task\` WHERE id IN (${placeholders})`;
    const query3 = `SELECT * FROM \`Task\` WHERE id IN (${placeholders})`;
    const query4 = `SELECT * FROM \`Task\` WHERE id IN (${placeholders}) AND aproved = '1'`;

    db.query(query2, taskIds, (err, projects) => {
      if (err) return res.status(500).send(err);
      const projectsCount= projects.length;

      db.query(query3, taskIds, (err, allTasks) => {
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
});

// FAMT API for emp overview task dtls aggregate view
app.post('/api/EmpOverviewtaskDtlsAggView', async (req, res) => {
  const { empid, iscomplete } = req.body;

  try {
    // Get the distinct task IDs
    const taskIdsResult = await query(`SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`, [empid]);

    if (!Array.isArray(taskIdsResult) || taskIdsResult.length === 0) {
      return res.status(200).send([]);
    }

    const taskIds = taskIdsResult.map(row => row.taskid);

    // Get the distinct project names
    const projectNamesResult = await query(`SELECT DISTINCT projectName FROM Task WHERE id IN (?)`, [taskIds]);

    if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
      return res.status(200).send([]);
    }

    const projectNames = projectNamesResult.map(row => row.projectName);

    // Create the base query
    let sql = `SELECT * FROM Task WHERE projectName IN (?) AND id IN (?)`;
    const params = [projectNames, taskIds];

    if (!iscomplete) {
      sql += ` AND aproved = '0'`;
    }

    // Execute the final query
    const tasksResult = await query(sql, params);

    res.status(200).send(tasksResult);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal server error');
  }
});

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


// FAMT API to fetch emp overview task dtls aggregate view timimngs
app.post('/api/emptaskDtlsAggTimes', async (req, res) => {
  const { empid, iscomplete } = req.body;

  try {
    // Step 1: Get assigned task IDs
    const [taskRows] = await db.promise().query(
      'SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?',
      [empid]
    );

    if (!Array.isArray(taskRows)) {
      throw new TypeError('Expected taskRows to be an array');
    }

    const assignedTaskIds = taskRows.map(row => row.taskid);

    if (assignedTaskIds.length === 0) {
      return res.status(404).send('No tasks found for the given employee');
    }

    // Step 2: Get filtered task IDs based on completion status
    let filteredTaskQuery = 'SELECT id FROM Task WHERE id IN (?)';
    if (!iscomplete) {
      filteredTaskQuery += ' AND aproved = 0';
    }
    const [filteredTaskRows] = await db.promise().query(filteredTaskQuery, [assignedTaskIds]);

    if (!Array.isArray(filteredTaskRows)) {
      throw new TypeError('Expected filteredTaskRows to be an array');
    }

    const filteredTaskIds = filteredTaskRows.map(row => row.id);

    if (filteredTaskIds.length === 0) {
      return res.status(404).send('No matching tasks found');
    }

    // Step 3: Get the required time to complete
    const [requiredTimeRows] = await db.promise().query(
      'SELECT SUM(timetocomplete) AS required FROM Task WHERE id IN (?)',
      [filteredTaskIds]
    );

    if (!Array.isArray(requiredTimeRows)) {
      throw new TypeError('Expected requiredTimeRows to be an array');
    }

    const requiredTime = requiredTimeRows[0]?.required || 0;

    // Step 4: Get the actual time taken to complete
    const [actualTimeRows] = await db.promise().query(
      'SELECT SUM(actualtimetocomplete_emp) AS taken FROM Taskemp WHERE id IN (?)',
      [filteredTaskIds]
    );

    if (!Array.isArray(actualTimeRows)) {
      throw new TypeError('Expected actualTimeRows to be an array');
    }

    const actualTime = actualTimeRows[0]?.taken || 0;

    res.json({ required: requiredTime, taken: actualTime });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Internal server error');
  }
});


// FAMT API endpoint for retrieving emp overview agg view planned and actual times
app.get('/api/empAggtasktimes', (req, res) => {
  const { startDate, endDate, assignedToEmp } = req.query;

  const query = `
    WITH RECURSIVE date_range AS (
      SELECT DATE(?) AS taskDate
      UNION ALL
      SELECT taskDate + INTERVAL 1 DAY
      FROM date_range
      WHERE taskDate + INTERVAL 1 DAY <= DATE(?)
    )
    SELECT
      dr.taskDate,
      COALESCE(SUM(te.timetocomplete_emp), 0) AS planned,
      COALESCE(SUM(te.actualtimetocomplete_emp), 0) AS actual
    FROM date_range dr
    LEFT JOIN Taskemp te ON dr.taskDate = DATE(te.tasktimeemp) AND te.AssignedTo_emp = ?
    GROUP BY dr.taskDate;
  `;

  db.query(query, [startDate, endDate, assignedToEmp], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});


//FAMT Delete employee
app.post('/api/deleteEmployee', (req, res) => {
  const empid = req.body.empid;

  const query1 = 'SELECT DISTINCT taskid FROM `Taskemp` WHERE AssignedTo_emp = ?';

  db.query(query1, [empid], (err, result) => {
    if (err) return res.status(500).send(err);

    const taskIds = result.map(row => row.taskid);

    const placeholders = taskIds.map(() => '?').join(',');

    db.query('SELECT * FROM `logincrd` WHERE `id` = ?', [empid], (error, results) => {
      if (error) {
        console.error('Error fetching employee: ' + error);
        return res.status(500).json({ message: 'Error fetching employee' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      db.beginTransaction(error => {
        if (error) {
          console.error('Error starting transaction: ' + error);
          return res.status(500).json({ message: 'Error starting transaction' });
        }

        db.query('DELETE FROM `logincrd` WHERE `id` = ?', [empid], error => {
          if (error) {
            return db.rollback(() => {
              console.error('Error deleting employee: ' + error);
              res.status(500).json({ message: 'Error deleting employee' });
            });
          }

          // Only attempt to delete related tasks if there are task IDs
          if (taskIds.length > 0) {
            db.query(`DELETE FROM Taskemp WHERE taskid IN (${placeholders})`, taskIds, error => {
              if (error) {
                console.error('Error deleting employee tasks: ' + error);
              }

              db.query(`DELETE FROM Task WHERE id IN (${placeholders})`, taskIds, error => {
                if (error) {
                  console.error('Error deleting tasks: ' + error);
                }

                db.commit(error => {
                  if (error) {
                    return db.rollback(() => {
                      console.error('Error committing transaction: ' + error);
                      res.status(500).json({ message: 'Error committing transaction' });
                    });
                  }

                  res.status(200).json({ message: 'Success' });
                });
              });
            });
          } else {
            // Commit the transaction if there are no tasks to delete
            db.commit(error => {
              if (error) {
                return db.rollback(() => {
                  console.error('Error committing transaction: ' + error);
                  res.status(500).json({ message: 'Error committing transaction' });
                });
              }

              res.status(200).json({ message: 'Success' });
            });
          }
        });
      });
    });
  });
});





//Famt employees logs api


app.use(bodyParser.json());
app.use(cors());

// Convert seconds to human-readable format
function seconds2human(ss) {
  const hours = Math.floor(ss / 3600);
  const minutes = Math.floor((ss % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// API endpoint to get employee logs
// app.post('/api/employeeLogs', (req, res) => {
//   const { id, fromdate, todate, projALL } = req.body;

//   let finalStr = '';
//   let projectNameArray = [];
//   let taskNameArray = [];
//   let task = [];
//   let addquery = '';

//   if (projALL !== 'All') {
//     const projALL_implode = projALL.map(project => `'${project}'`).join(', ');
//     addquery = `projectName IN (${projALL_implode}) AND `;
//   }

//   const selectTaskIdFromAssignTask = `
//     SELECT DISTINCT taskid 
//     FROM Taskemp 
//     WHERE AssignedTo_emp = ? AND DATE(tasktimeemp) >= ? AND DATE(tasktimeemp) <= ?`;
  
//   db.query(selectTaskIdFromAssignTask, [id, fromdate, todate], (err, taskResults) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (taskResults.length > 0) {
//       task = taskResults.map(row => row.taskid);
//       const idString = task.join(',');

//       const selectTaskAndProj = `
//         SELECT id, TaskName, projectName 
//         FROM Task 
//         WHERE ${addquery} id IN (${idString})`;

//       db.query(selectTaskAndProj, (err, taskAndProjResults) => {
//         if (err) {
//           return res.status(500).json({ error: err.message });
//         }

//         taskAndProjResults.forEach(row => {
//           taskNameArray[row.id] = row.TaskName;

//           if (projALL === 'All') {
//             const projectName = row.projectName;
//             const selectProject = `SELECT id FROM projects WHERE ProjectName = ?`;
            
//             db.query(selectProject, [projectName], (err, projectResults) => {
//               if (err) {
//                 return res.status(500).json({ error: err.message });
//               }
//               const projectRow = projectResults[0];
//               if (projectRow && !projectNameArray[projectRow.id]) {
//                 projectNameArray[projectRow.id] = projectName;
//               }
//             });
//           }
//         });

//         if (projALL !== 'All') {
//           const selectTaskAndProjNotAll = `
//             SELECT projectName 
//             FROM Task 
//             WHERE id IN (${idString})`;
          
//           db.query(selectTaskAndProjNotAll, (err, projNotAllResults) => {
//             if (err) {
//               return res.status(500).json({ error: err.message });
//             }
//             projNotAllResults.forEach(row => {
//               const projectName = row.projectName;
//               const selectProject = `SELECT id FROM projects WHERE ProjectName = ?`;
              
//               db.query(selectProject, [projectName], (err, projectResults) => {
//                 if (err) {
//                   return res.status(500).json({ error: err.message });
//                 }
//                 const projectRow = projectResults[0];
//                 if (projectRow && !projectNameArray[projectRow.id]) {
//                   projectNameArray[projectRow.id] = projectName;
//                 }
//               });
//             });
//           });
//         }

//         res.json({ projectNameArray, taskNameArray });
//       });
//     } else {
//       res.json({ message: 'No tasks found' });
//     }
//   });
// });



app.post('/api/ProjectOverView', async (req, res) => {
  const { iscomplete } = req.body;

  try {
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
    };

    // Get all distinct project names
    const projectNamesResult = await queryAsync(`SELECT DISTINCT ProjectName FROM projects`);

    if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
      return res.status(200).send({
        totalProjects: 0,
        completedProjects: 0,
        projects: []
      });
    }

    const projectNames = projectNamesResult.map(row => row.ProjectName);

    // Count total projects
    const totalProjects = projectNames.length;

    // Count completed projects
    let completedProjects = 0;
    if (iscomplete) {
      const completedProjectsResult = await queryAsync(`SELECT COUNT(*) AS count FROM projects WHERE complete_status = '1'`);
      completedProjects = completedProjectsResult[0].count;
    }

    // Fetch all projects or filtered by completion status
    let sql = `SELECT * FROM projects WHERE ProjectName IN (?)`;
    const params = [projectNames];

    if (iscomplete) {
      sql += ` AND complete_status = '1'`;
    }

    const projectsResult = await queryAsync(sql, params);

    res.status(200).send({
      totalProjects,
      completedProjects,
      projects: projectsResult
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send('Internal server error');
  }
});

// app.post('/api/ProjectOverView', async (req, res) => {
//   const { iscomplete } = req.body;

//   try {
//     // Get all distinct project names
//     const projectNamesResult = await query(`SELECT DISTINCT projectName FROM Task`);

//     if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
//       return res.status(200).send({
//         totalProjects: 0,
//         completedProjects: 0,
//         projects: []
//       });
//     }

//     const projectNames = projectNamesResult.map(row => row.projectName);

//     // Count total projects
//     const totalProjects = projectNames.length;

//     // Count completed projects
//     let completedProjects = 0;
//     if (iscomplete) {
//       const completedProjectsResult = await query(`SELECT COUNT(*) AS count FROM Task WHERE aproved = '1' AND projectName IN (?)`, [projectNames]);
//       completedProjects = completedProjectsResult[0].count;
//     }

//     // Fetch all projects or filtered by completion status
//     let sql = `SELECT * FROM Task WHERE projectName IN (?)`;
//     const params = [projectNames];

//     if (iscomplete) {
//       sql += ` AND aproved = '1'`;
//     }

//     const projectsResult = await query(sql, params);

//     res.status(200).send({
//       totalProjects,
//       completedProjects,
//       projects: projectsResult
//     });
//   } catch (error) {
//     console.error('Error fetching projects:', error);
//     res.status(500).send('Internal server error');
//   }
// });

app.get('/api/EmpOverviewPlusMinus', async (req, res) => {
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
    projectDetailsResult.forEach(project => {
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

      db.query(selcttask, [empid, projectName], (err, taskResults) => {
        if (err) {
          console.error('Error executing task query:', err.stack);
          return res.status(500).send('Database query error');
        }

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
        db.query(timeQuery, [empid, projectName], (err, timeResults) => {
          if (err) {
            console.error('Error executing time query:', err.stack);
            return res.status(500).send('Database query error');
          }

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
          if (count === projectDetailsResult.length) {
            res.json(response);
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal server error');
  }
});



//FAMT Employee Logs popups for Employee Overview page
app.post('/api/employeeLogs', async (req, res) => {
  const { employeeId, fromDate, toDate } = req.body;

  // Validate input
  if (!employeeId || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Log input values
  // console.log('Employee ID:', employeeId);
  // console.log('From Date:', fromDate);
  // console.log('To Date:', toDate);

  const query = `
    SELECT te.*, t.projectName, t.TaskName
    FROM Taskemp te
    JOIN task t ON te.taskid = t.id
    WHERE te.AssignedTo_emp = ?
      AND DATE(te.tasktimeemp) BETWEEN ? AND ?
    ORDER BY te.tasktimeemp DESC
  `;

  try {
    // Execute the combined query
    const [results] = await db.promise().query(query, [employeeId, fromDate, toDate]);
    
    // Log raw results
    // console.log('Raw results length:', results.length);
    // console.log('Raw results:', results);

    // Map results to the final structure
    const finalResults = results.map(row => ({
      results : results.length,
      date: row.tasktimeemp,
      projectName: row.projectName || 'Unknown',
      taskName: row.TaskName || 'Unknown',
      timeRequired: row.timetocomplete_emp,
      timeTaken: row.actualtimetocomplete_emp,
      activity: row.Activity,
      logs: row.tasklog
    }));

    // Log final mapped results
    // console.log('Final results length:', finalResults.length);
    // console.log('Final results:', finalResults);

    res.json(finalResults);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

function seconds2human(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

app.get('/api/empOverviewTaskDtlsIndIndView', async (req, res) => {
  const { assignBy, projectName } = req.query;

  // Check if the required parameters are provided
  if (!assignBy || !projectName) {
    return res.status(400).json({ error: 'Missing required query parameters: assignBy or projectName' });
  }

  try {
    // 1. Get task IDs based on the criteria
    const tasksQuery = `
      SELECT * FROM task WHERE (AssignBy = ? OR statusby = ?) AND projectName = ?`;
    const tasks = await new Promise((resolve, reject) => {
      db.query(tasksQuery, [assignBy, assignBy, projectName], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    // Extract the IDs into a constant
    const taskIds = tasks.map(task => task.id).join(',');

    // 2. Use the IDs to query taskemp
    const taskempQuery = `
      SELECT t.*, total.actual FROM taskemp t JOIN ( SELECT taskid, SUM(actualtimetocomplete_emp) AS actual FROM taskemp WHERE taskid IN (${taskIds}) GROUP BY taskid ) total ON t.taskid = total.taskid WHERE t.taskid IN (${taskIds});
    `;
    const taskemps = await new Promise((resolve, reject) => {
      db.query(taskempQuery, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    // 3. Send the combined result
    res.json({
      tasks,
      taskemps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/empOverviewTaskDtlsIndAggView', (req, res) => {
  const assignBy = req.query.assignBy;
  const projectName = req.query.projectName;

  const query1 = `
    SELECT COUNT(id) as tasks 
    FROM task 
    WHERE (AssignBy = ? OR statusby = ?) 
      AND projectName = ?;
  `;

  const query2 = `
    SELECT SUM(p.timetocomplete) as Required, SUM(te.actualtimetocomplete_emp) as Taken 
    FROM Taskemp te 
    JOIN Task p ON te.taskid = p.id 
    WHERE te.AssignedTo_emp = ? 
      AND p.ProjectName = ?;
  `;

  db.query(query1, [assignBy, assignBy, projectName], (error1, results1) => {
    if (error1) {
      return res.status(500).json({ error: error1.message });
    }

    db.query(query2, [assignBy, projectName], (error2, results2) => {
      if (error2) {
        return res.status(500).json({ error: error2.message });
      }

      res.json({
        tasks: results1[0].tasks,
        required: results2[0].Required,
        taken: results2[0].Taken
      });
    });
  });
});


app.get('/api/empOverviewIndAggPATimes', (req, res) => {
  const { projectName, userId, startDate } = req.query;

  // Step 1: Get task IDs
  const taskIdQuery = `
    SELECT id 
    FROM Task 
    WHERE projectName = ? AND (AssignBy = ? OR statusby = ?)
  `;

  db.query(taskIdQuery, [projectName, userId, userId], (err, taskIds) => {
    if (err) {
      console.error('Error executing task ID query:', err);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }

    const taskIdList = taskIds.map(task => task.id);

    if (taskIdList.length === 0) {
      return res.status(200).json({ message: 'No tasks found for the given criteria', data: [] });
    }

    // Convert taskIdList to a comma-separated string
    const taskIdString = taskIdList.join(', ');

    // Step 2: Get planned and actual time data within the date range
    const taskDataQuery = `
      WITH RECURSIVE DateRange AS (
        SELECT DATE(?) AS task_date
        UNION ALL
        SELECT task_date + INTERVAL 1 DAY
        FROM DateRange
        WHERE task_date + INTERVAL 1 DAY <= DATE(?) + INTERVAL 6 DAY
      )
      SELECT 
        d.task_date AS taskDate, 
        COALESCE(SUM(te.timetocomplete_emp), 0) AS planned, 
        COALESCE(SUM(te.actualtimetocomplete_emp), 0) AS actual 
      FROM DateRange d
      LEFT JOIN Taskemp te ON DATE(te.tasktimeemp) = d.task_date AND te.taskid IN (${taskIdString})
      GROUP BY d.task_date
      ORDER BY d.task_date
    `;

    db.query(taskDataQuery, [startDate, startDate], (err, taskData) => {
      if (err) {
        console.error('Error executing task data query:', err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
      }

      // Format the dates to local date format
      const formattedData = taskData.map(row => {
        const taskDate = new Date(row.taskDate);        
        taskDate.setDate(taskDate.getDate() + 1);
        return {
          taskDate: taskDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
          planned: row.planned,
          actual: row.actual
        };
      });

      res.status(200).json({ message: 'Success', data: formattedData });
    });
  });
});


app.get('/api/empOverviewIndIndPATimes', async (req, res) => {
  const { assignBy, projectName, taskDate } = req.query;

  const query1 = `
    SELECT id, timetocomplete 
    FROM task 
    WHERE (AssignBy = ? OR statusby = ?) 
      AND projectName = ? 
      AND DATE(TaskTime) = ?;
  `;

  db.query(query1, [assignBy, assignBy, projectName, taskDate], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Error executing query1' });
    }

    // Extract task IDs
    const taskIds = tasks.map(task => task.id);

    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }

    const query2 = `
      SELECT taskid, actualtimetocomplete_emp, DATE(tasktimeemp) as tasktimeemp_date, timetocomplete_emp
      FROM taskemp 
      WHERE taskid IN (?);
    `;

    db.query(query2, [taskIds], (err, taskEmpDetails) => {
      if (err) {
        return res.status(500).json({ error: 'Error executing query2' });
      }

      // Create a map for easy lookup of actualtimetocomplete_emp, tasktimeemp_date, and timetocomplete_emp by taskid
      const empDetailsMap = taskEmpDetails.reduce((acc, curr) => {
        let tasktimeemp_date = new Date(curr.tasktimeemp_date);
        tasktimeemp_date.setDate(tasktimeemp_date.getDate() + 1);
        tasktimeemp_date = tasktimeemp_date.toISOString().split('T')[0];

        acc[curr.taskid] = {
          actualtimetocomplete_emp: curr.actualtimetocomplete_emp,
          tasktimeemp_date: tasktimeemp_date,
          timetocomplete_emp: curr.timetocomplete_emp
        };
        return acc;
      }, {});

      // Combine the results from both queries
      const combinedResults = tasks.map(task => ({
        taskid: task.id,
        planned: empDetailsMap[task.id] ? empDetailsMap[task.id].timetocomplete_emp : null,
        actual: empDetailsMap[task.id] ? empDetailsMap[task.id].actualtimetocomplete_emp : null,
        taskDate: empDetailsMap[task.id] ? empDetailsMap[task.id].tasktimeemp_date : null,
      }));

      res.json(combinedResults);
    });
  });
});




// =================================  APIs by GJC for ref. START =====================================

// // Endpoint to fetch project lists of a particular employee
// // app.get('/getProjectsByEmployee', (req, res) => {
// //   const name_emp = 'Zeba';
// // const sql = 'SELECT t.project FROM employees e JOIN tasks t ON e.name = t.employee WHERE e.name = {name_emp}'; // Adjust this query based on your database schema
// //   db.query(sql, (err, result) => {
// //     if (err) {
// //       console.error('Error fetching projects by employee ID:', err);
// //       res.status(500).send('Internal Server Error');
// //     } else {
// //       console.log('Projects fetched by employee ID');
// //       res.status(200).json(result);
// //     }
// //   });
// // });


// app.get('/api/getProjectsByEmployee/:employeeId', (req, res) => {
//   const employeeId = req.params.employeeId;
//   const sql = 'SELECT DISTINCT project FROM tasks WHERE employee = ?';
//   // Assuming 'employee' is the column name in the tasks table that stores employee names
//   db.query(sql, [employeeId], (err, result) => {
//     if (err) {
//       console.error('Error fetching projects by employee ID:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Projects fetched by employee ID');
//       res.status(200).json(result);
//     }
//   });
// });


// app.get('/api/getProjectsforEmp', (req, res) => {
//   const employeeName = req.query.employeeName; // Assuming the employee name is passed as a query parameter
//   const sql = `SELECT t.project FROM employees e JOIN tasks t ON
// e.name = t.employee WHERE e.name = ?`;

//   db.query(sql, [employeeName], (err, result) => {
//     if (err) {
//       console.error('Error fetching projects from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Projects fetched from database');
//       res.status(200).json(result);
//     }
//   });
// });



// // Endpoint to fetch projects based on user role
// app.get('/api/getFilteredProjects/:userId', (req, res) => {
//   const userId = req.params.userId;
//   // Assuming you have a table named 'users' with a column 'role'
//   const getUserRoleQuery = 'SELECT role FROM users WHERE id = ?';
//   db.query(getUserRoleQuery, [userId], (err, result) => {
//     if (err) {
//       console.error('Error fetching user role:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     if (result.length === 0) {
//       console.error('User not found');
//       res.status(404).send('User not found');
//       return;
//     }
//     const userRole = result[0].role;
//     let sql;
//     if (userRole === 'admin' || userRole === 'team leader') {
//       // If user is admin or team leader, fetch all projects
//       sql = 'SELECT * FROM projects';
//     } else {
//       // If user is employee, fetch projects associated with the employee
//       sql = 'SELECT * FROM projects WHERE employeeId = ?';
//     }
//     db.query(sql, [userId], (err, result) => {
//       if (err) {
//         console.error('Error fetching projects:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Projects fetched based on user role');
//         res.status(200).json(result);
//       }
//     });
//   });
// });

// //weekly  calender data
// // Endpoint to fetch projects table data from the database
// // app.get('/getCalenderTime', (req, res) => {
// //   const sql = 'SELECT timeRequired, timeTaken FROM tasks';
// //   db.query(sql, (err, result) => {
// //     if (err) {
// //       console.error('Error fetching tasks from database:', err);
// //       res.status(500).send('Internal Server Error');
// //     } else {
// //       console.log('Tasks fetched from database');
// //       res.json(result);
// //     }
// //   });
// // });


// // Endpoint to fetch timeRequired and timeTaken from tasks table
// app.get('/api/getCalenderTime', (req, res) => {
//   // const date = req.params.date;
//   // const sql = 'SELECT timeRequired, timeTaken FROM tasks where date = `2024-03-18`';


//   const date = '2024-03-18';
//   const sql = 'SELECT * FROM tasks';
//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error('Error fetching timeRequired and timeTaken from tasks table:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('TimeRequired and TimeTaken fetched from tasks table');
//       res.json(result);
//     }
//   });
// });


// // Endpoint to update a project
// app.put('/api/updateProject/:projectId', (req, res) => {
//   const projectId = req.params.projectId;
//   const { projectName, salesName } = req.body;

//   const sql = 'UPDATE projects SET projectName = ?, salesName = ? WHERE id_p = ?';
//   db.query(sql, [projectName, salesName, projectId], (err, result) => {
//     if (err) {
//       console.error('Error updating project:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Project updated successfully');
//       res.status(200).send('Project updated successfully');
//     }
//   });
// });

// // Endpoint to delete a project
// app.delete('/api/deleteProject/:projectId', (req, res) => {
//   const projectId = req.params.projectId;

//   const sql = 'DELETE FROM projects WHERE id_p = ?';
//   db.query(sql, [projectId], (err, result) => {
//     if (err) {
//       console.error('Error deleting project from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Project deleted from database');
//       res.status(200).send('Project deleted successfully');
//     }
//   });
// });



// ///////Tasks Table////////

// // Endpoint to fetch employee names from the database in task table
// app.get('/api/getEmployeeNames', (req, res) => {
//   const sql = 'SELECT name FROM employees'; // Assuming 'name' is the column containing employee names
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching employee names:', err);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }
//     const employeeNames = results.map((row) => row.name);
//     res.json(employeeNames);
//   });
// });

// // // Endpoint to add a new task
// app.post('/api/addTasks', (req, res) => {
//   const { employee, project, taskName, timeRequired, description,
//     isLastTask, date } = req.body;

//   const sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
//   db.query(sql, [employee, project, taskName, timeRequired,
//     description, isLastTask, date], (err, result) => {
//       if (err) {
//         console.error('Error adding task to database:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Task added to database');
//         res.status(200).send('Task added successfully');
//       }
//     });
// });





// // Endpoint to update a task
// app.put('/api/updateTask/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   const { taskName, timeRequired, description, isLastTask,
//     hoursRequired, minutesRequired } = req.body;
//   const sql = 'UPDATE tasks SET taskName = ?, timeRequired = ?,description = ?, isLastTask = ?, hoursRequired = ?, minutesRequired =? WHERE taskId = ?';
//   db.query(sql, [taskName, timeRequired, description, isLastTask,
//     hoursRequired, minutesRequired, taskId], (err, result) => {
//       if (err) {
//         console.error('Error updating task:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Task updated successfully');
//         res.status(200).send('Task updated successfully');
//       }
//     });
// });


// // Endpoint to fetch tasks table data from the database
// app.get('/api/getTasks', (req, res) => {
//   const sql = 'SELECT project, taskName, timeRequired, date,description, isLastTask FROM tasks';
//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error('Error fetching tasks from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Tasks fetched from database');
//       res.status(200).json(result);
//     }
//   });
// });


// // app.post('/api/addTasks', (req, res) => {
// //   const { employee, project, taskName, timeRequired, description,isLastTask, date } = req.body;
// //   let sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
// //   let data = [employee, project, taskName, timeRequired,description, isLastTask, date];
// //   // Handle missing project ID (optional)
// //   if (!project) {
// //     sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
// //     data = [employee, project, taskName, timeRequired, description,isLastTask, date];
// //   }
// //   db.query(sql, [employee, project, taskName, timeRequired,description, isLastTask, date], (err, result) => {
// //         if (err) {
// //           console.error('Error adding task to database:', err);
// //           res.status(500).send('Internal Server Error');
// //         } else {
// //           // console.log(result)
// //           console.log('Task added to database');
// //           res.status(200).send('Task added successfully');
// //         }
// //       });
// //     });


// // app.get('/api/tasksByProject/:projectName', (req, res) => {
// //   const projectName = req.params.projectName;
// //   const sql = 'SELECT * FROM tasks WHERE id_t = ?';
// //   db.query(sql, [projectName], (err, result) => {
// //     if (err) {
// //       console.error('Error fetching tasks by project name:', err);
// //       res.status(500).send('Internal Server Error');
// //     } else {
// //       console.log('Tasks fetched by project name');
// //       res.status(200).json(result);
// //     }
// //   });
// // });

// // app.get('/api/tasksByProject/:projectName', (req, res) => {
// //   const projectName = req.params.projectName;
// //   const sql = 'SELECT tasks.id_t, tasks.taskName FROM tasks JOIN projects ON tasks.id_p = projects.id_p WHERE projects.projectName =?';
// //   db.query(sql, [projectName], (err, result) => {
// //     if (err) {
// //       console.error('Error fetching tasks by project name:', err);
// //       res.status(500).send('Internal Server Error');
// //     } else {
// //       console.log('Tasks fetched by project name');
// //       res.status(200).json(result);
// //     }
// //   });
// // });

// // Endpoint to fetch tasks by project name
// app.get('/api/tasksByProject/:projectName', (req, res) => {
//   const projectName = req.params.projectName;
//   const sql = 'SELECT * FROM tasks WHERE project = ?'; // Assuming 'project' is the column name in the tasks table
//   db.query(sql, [projectName], (err, result) => {
//     if (err) {
//       console.error('Error fetching tasks by project name:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Tasks fetched by project name');
//       res.status(200).json(result);
//     }
//   });
// });



// // Endpoint to fetch a task by ID
// app.get('/api/getTask/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   const sql = 'SELECT * FROM tasks WHERE id_t = ?';
//   db.query(sql, [taskId], (err, result) => {
//     if (err) {
//       console.error('Error fetching task details:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       if (result.length > 0) {
//         console.log('Task details fetched successfully');
//         res.status(200).json(result[0]); // Assuming only one task will be fetched
//       } else {
//         console.log('Task not found');
//         res.status(404).send('Task not found');
//       }
//     }
//   });
// });





// // Endpoint to delete a task
// app.delete('/api/deleteTask/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   console.log('Received delete request for task with ID:', taskId); //Check if the server receives the request
//   const sql = 'DELETE FROM tasks WHERE id_t = ?';
//   db.query(sql, [taskId], (err, result) => {
//     if (err) {
//       console.error('Error deleting task from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else if (result.affectedRows === 0) {
//       console.error('Task not found');
//       res.status(404).send('Task not found');
//     } else {
//       console.log('Task deleted from database');
//       res.status(200).send('Task deleted successfully');
//     }
//   });
// });







// // Endpoint to add a new employee
// app.post('/api/addEmployee', (req, res) => {
//   const { name, nickname, email, useEmail, password, confirmPassword,
//     role, location } = req.body;

//   const sql = 'INSERT INTO employees (name, nickname, email,use_email, password, confirm_password, role, location) VALUES (?, ?,?, ?, ?, ?, ?, ?)';
//   db.query(sql, [name, nickname, email, useEmail, password,
//     confirmPassword, role, location], (err, result) => {
//       if (err) {
//         console.error('Error adding employee to database:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Employee added to database');
//         res.status(200).send('Employee added successfully');
//       }
//     });
// });


// // Endpoint to fetch a specific employee by ID
// app.put('/api/getEmployee/:employeeId', (req, res) => {
//   const employeeId = req.params.employeeId;
//   const sql = 'SELECT * FROM employees WHERE name = ?';
//   db.query(sql, [employeeId], (err, result) => {
//     if (err) {
//       console.error('Error fetching employee data:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       if (result.length > 0) {
//         console.log('Employee data fetched successfully');
//         res.status(200).json(result[0]); // Assuming only one employee will be fetched
//       } else {
//         console.log('Employee not found');
//         res.status(404).send('Employee not found');
//       }
//     }
//   });
// });

// // Endpoint to fetch project lists of a particular employee
// app.get('/api/getProjectsByEmployee/:employeeId', (req, res) => {
//   const employeeId = req.params.employeeId;
//   const sql = 'SELECT * FROM projects WHERE id_e = ?'; // Assuming 'employeeId' is the column containing employee IDs in the projects table
//   db.query(sql, [employeeId], (err, result) => {
//     if (err) {
//       console.error('Error fetching projects by employee ID:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Projects fetched by employee ID');
//       res.status(200).json(result);
//     }
//   });
// });

// // Endpoint to update an employee




// // Endpoint to fetch all tasks from the task table
// app.get('/api/getAllTasks', (req, res) => {
//   const sql = 'SELECT * FROM tasks';
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching tasks:', err);
//       res.status(500).json({ error: 'Internal server error' });
//       return;
//     }
//     res.json(results);
//   });
// });



// // Endpoint to update a task
// app.put('/api/updateTask', (req, res) => {

//   const { taskName, timeTaken, description, isLastTask } = req.body;

//   const updateTaskQuery = 'UPDATE tasks SET taskName = ?, timeTaken =?, description = ?, isLastTask = ? WHERE id_t = ?';
//   db.query(updateTaskQuery, [taskName, timeTaken, description,
//     isLastTask, taskId], (err, result) => {
//       if (err) {
//         console.error('Error updating task:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Task updated successfully');
//         res.status(200).send('Task updated successfully');
//       }
//     });
// });

// //End point to Edit Task
// app.put('/api/editTask/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   const { taskName, timeRequired, description, isLastTask } = req.body;

//   const sql = 'UPDATE tasks SET taskName = ?, timeRequired = ?,description = ?, isLastTask = ? WHERE id_t = ?';
//   db.query(sql, [taskName, timeRequired, description, isLastTask,
//     taskId], (err, result) => {
//       if (err) {
//         console.error('Error updating task:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Task updated successfully');
//         res.status(200).send('Task updated successfully');
//       }
//     });
// });


// // Endpoint to delete a task by ID
// app.delete('/api/deleteTask/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   console.log('Received delete request for task with ID:', taskId); //Check if the server receives the request
//   const sql = 'DELETE FROM tasks WHERE id_t = ?'; // Update column name to 'id_t'
//   db.query(sql, [taskId], (err, result) => {
//     if (err) {
//       console.error('Error deleting task from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else if (result.affectedRows === 0) {
//       console.error('Task not found');
//       res.status(404).send('Task not found');
//     } else {
//       console.log('Task deleted from database');
//       res.status(200).send('Task deleted successfully');
//     }
//   });
// });


// app.get('/api/tasksByDateRange', (req, res) => {
//   const { startDate, endDate } = req.query;
//   const sql = 'SELECT * FROM tasks WHERE date BETWEEN ? AND ?';
//   db.query(sql, [startDate, endDate], (err, result) => {
//     if (err) {
//       console.error('Error fetching tasks by date range:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Tasks fetched by date range');
//       res.status(200).json(result);
//     }
//   });
// });


// // Endpoint to fetch tasks by date
// app.get('/api/tasksByDate/:date', (req, res) => {
//   const date = req.params.date;

//   const sql = 'SELECT * FROM tasks WHERE date = ?';
//   db.query(sql, [date], (err, result) => {
//     if (err) {
//       console.error('Error fetching tasks by date:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Tasks fetched by date');
//       res.status(200).json(result);
//     }
//   });
// });



// app.get('/api/fetchAllLoginData', (req, res) => {
//   // Query the database to retrieve all data from the login table
//   const sql = 'SELECT * FROM employees';
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error retrieving login data:', err);
//       return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
//     }

//     // Check if any data was retrieved
//     if (results.length === 0) {
//       return res.status(404).json({ success: false, message: 'No data found in login table' });
//     }

//     // Send the retrieved data in the response
//     return res.status(200).json({ success: true, message: 'Login data retrieved successfully', data: results });
//   });
// });


// app.post('/api/assignTask', (req, res) => {
//   const { employee, project, taskName, timeRequired, description,
//     isLastTask, date } = req.body;

//   // Insert the task into the tasks table
//   const insertTaskQuery = "INSERT INTO tasks (employee, project, taskName, timeRequired, description, isLastTask, date) VALUES (?, ?,?, ?, ?, ?, ?)'";
//   db.query(insertTaskQuery, [employee, project, taskName, timeRequired, description, isLastTask, date], (err, result) => {
//     if (err) {
//       console.error('Error adding task to database:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Task added to database');
//       res.status(200).send('Task added successfully');
//     }
//   });
// });


// // Endpoint to handle updating an employee
// app.put('/api/updateEmployee/:employeeId', (req, res) => {
//   const employeeId = req.params.employeeId;
//   const { name, nickname, email, use_email, password,
//     confirm_password, role, location } = req.body;

//   const sql = 'UPDATE employees SET name = ?, nickname = ?, email = ?, use_email = ?, password = ?, confirm_password = ?, role = ?, location = ? WHERE id_e = ?';
//   db.query(sql, [name, nickname, email, use_email, password,
//     confirm_password, role, location, employeeId], (err, result) => {
//       if (err) {
//         console.error('Error updating employee:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         console.log('Employee updated successfully');
//         res.status(200).send('Employee updated successfully');
//       }
//     });
// });

// =================================  APIs by GJC for ref. END =====================================



// ********Add Employee Table Apis********** Pratibha

// // API endpoint to save data to Logincrd table
// app.post('/api/logincrd', (req, res) => {
//   const employeeData = req.body; // Assuming the data sent from frontend is JSON
//   // Insert data into Logincrd table
//   const query = 'INSERT INTO logincrd SET ?';
//   db.query(query, employeeData, (err, result) => {
//     if (err) {
//       console.error('Error saving data:', err);
//       res.status(500).send('Error saving data');
//       return;
//     }
//     console.log('Data saved successfully');
//     res.status(200).send('Data saved successfully');
//   });
// });


// Get all employees names
app.get('/api/employees-name', (req, res) => {
  const sql = 'SELECT Name FROM logincrd';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});


// // Get all employees
// app.get('/api/employees', (req, res) => {
//   const sql = 'SELECT * FROM logincrd';
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching employees:', err);
//       res.status(500).json({ message: 'Internal server error' });
//       return;
//     }
//     res.json(results);
//   });
// });

// Endpoint to fetch employees
app.get('/api/employees', (req, res) => {
  const query = "SELECT * FROM `Logincrd` WHERE `disableemp`!='1' ORDER BY `Name` ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch employees' });
    } else {
      res.json(results);
    }
  });
});

// Get all pages
app.get('/api/pages', (req, res) => {
  const sql = 'SELECT * FROM pages';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pages:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// // Add new employee
// app.post('/api/add-employee', (req, res) => {
//   const { Name, Email, Type, Location, Nickname, Password, loginusinggmail } = req.body;
//   const sql = 'INSERT INTO logincrd (Name, Email, Type, Location, Nickname, Password, loginusinggmail) VALUES (?, ?, ?, ?, ?, ?, ?)';
//   const values = [Name, Email, Type, Location, Nickname, Password, loginusinggmail];
//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error('Error adding employee:', err);
//       res.status(500).json({ message: 'Internal server error' });
//       return;
//     }
//     res.status(201).json({ message: 'Employee added successfully' });
//   });
// });

// // API Endpoint for Decrypted Token
// app.post('/api/empDropdown', (req, res) => {
//   const { token } = req.body;
//   const userData = decryptToken(token);
//   const query = userData.Type === 'Admin' || userData.Type === 'Team Leader'
//     ? `SELECT * FROM Logincrd WHERE disableemp!='1' ORDER BY Name ASC`
//     : `SELECT * FROM Logincrd WHERE id='${userData.id}' AND disableemp!='1' ORDER BY Name ASC`;
//   db.query(query, (err, result) => {
//     if (err) {
//       res.status(500).send('Internal Server Error');
//     } else {
//       res.json(result);
//     }
//   });
// });

// // Update employee
// app.post('/api/update-employee', (req, res) => {
//   const { id, name, email, role, location, nickname, password, useEmailForLogin } = req.body;
//   const sql = 'UPDATE logincrd SET name=?, email=?, role=?, location=?, nickname=?, password=?, use_email_for_login=? WHERE id=?';
//   const values = [name, email, role, location, nickname, password, useEmailForLogin, id];
//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error('Error updating employee:', err);
//       res.status(500).json({ message: 'Internal server error' });
//       return;
//     }
//     res.json({ message: 'Employee updated successfully' });
//   });
// });

app.post('/api/add-employee', (req, res) => {
  const { Name, fname, lname, Nickname, Email, Password, Type, Location, loginusinggmail } = req.body;

  const emp = {
    Name,
    fname,
    lname,
    Nickname,
    Email,
    Password,
    Type,
    Location,
    loginusinggmail
  };

  const sql = 'INSERT INTO logincrd SET ?';
  db.query(sql, emp, (err, result) => {
    if (err) throw err;
    console.log('New employee inserted');

    // Fetch the ID of the latest created employee
    const fetchLatestId = 'SELECT id FROM logincrd ORDER BY id DESC LIMIT 1';
    db.query(fetchLatestId, (err, result) => {
      if (err) throw err;

      const latestId = result[0].id;

      // Insert the latest employee ID into MySQL table empaccess
      const empAccess = {
        Empid: latestId,
        AcessTo: 'some_value', // You need to specify the access details
        accesstype: 'some_type' // You need to specify the access type
      };

      const insertEmpAccess = 'INSERT INTO empaccess SET ?';
      db.query(insertEmpAccess, empAccess, (err, result) => {
        if (err) throw err;
        console.log('Employee access inserted');
        res.send('Employee and access inserted successfully');
      });
    });
  });
});

app.put('/api/update-employee', (req, res) => {
  const { Email, Password, Type, selctloc, loginusinggmail, empid, Name, Nickname, pagename, pagevalue } = req.body;

  const updateQuery = `
    UPDATE Logincrd
    SET Name = ?, Email = ?, Password = ?, Type = ?, Location = ?, loginusinggmail = ?, Nickname = ?
    WHERE id = ?
  `;

  const updateValues = [Name, Email, Password, Type, selctloc, loginusinggmail, Nickname, empid];

  db.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const selectQuery = `
      SELECT id
      FROM Logincrd
      WHERE Email = ? AND Password = ? AND Name = ? AND Type = ? AND Location = ?
    `;

    const selectValues = [Email, Password, Name, Type, selctloc];

    db.query(selectQuery, selectValues, (err, rows) => {
      if (err) {
        console.error('Error retrieving employee ID:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Employee not found after update' });
      }

      const tempid = rows[0].id;

      const insertPromises = pagename.map((val, index) => {
        const acessval = pagevalue[index];
        const insertQuery = `
          INSERT INTO EmpAcess (Empid, AcessTo, acesstype)
          VALUES (?, ?, ?)
        `;
        return new Promise((resolve, reject) => {
          db.query(insertQuery, [tempid, val, acessval], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => {
          res.status(200).json({ message: 'Success' });
        })
        .catch(err => {
          console.error('Error inserting access data:', err);
          res.status(500).json({ message: 'Internal server error' });
        });
    });
  });
});

app.delete('/api/delete-employee/:id', (req, res) => {
  const id = req.params.id;
  const checkSql = 'SELECT * FROM logincrd WHERE id = ?';
  const deleteSql = 'DELETE FROM logincrd WHERE id = ?';

  // Check if the employee exists
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // If the employee exists, proceed to delete
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
      res.json({ message: 'Employee deleted successfully' });
    });
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});