const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');


const app = express();
const port = 3001;

app.use(cors());


// Create a MySQL db
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'indiscpx_TaskDB',
});

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

// FAMT API endpoint to handle createTask POST request
app.post('/api/createTask', (req, res) => {
  const { ProjectName, TaskName, Emplname, islasttask, taskdetails, hr, min, token } = req.body;

  const userData = decryptToken(token);
  const AssignBy = userData.id;

  // Calculate task completion time in seconds
  const taskcompleteat = (parseInt(hr) * 3600) + (parseInt(min) * 60);

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
    db.query(insertTaskSql, [ProjectName, TaskName, taskdetails, AssignBy, taskcompleteat], (err, result) => {
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
            // Insert task employee details into Taskemp table if Emplname is provided
            if (Emplname !== 'Selectedemp') {
              let insertTaskEmpSql = `INSERT INTO Taskemp (taskid, tasktimeemp, AssignedTo_emp, timetocomplete_emp) VALUES (?, NOW(), ?, ?)`;
              db.query(insertTaskEmpSql, [taskId, AssignBy, taskcompleteat], (err, result) => {
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
      console.log('Project added to database');
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


// Endpoint to fetch project lists of a particular employee
// app.get('/getProjectsByEmployee', (req, res) => {
//   const name_emp = 'Zeba';
const sql = 'SELECT t.project FROM employees e JOIN tasks t ON e.name = t.employee WHERE e.name = {name_emp}'; // Adjust this query based on your database schema
//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error('Error fetching projects by employee ID:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Projects fetched by employee ID');
//       res.status(200).json(result);
//     }
//   });
// });


app.get('/api/getProjectsByEmployee/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const sql = 'SELECT DISTINCT project FROM tasks WHERE employee = ?';
  // Assuming 'employee' is the column name in the tasks table that stores employee names
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error('Error fetching projects by employee ID:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Projects fetched by employee ID');
      res.status(200).json(result);
    }
  });
});


app.get('/api/getProjectsforEmp', (req, res) => {
  const employeeName = req.query.employeeName; // Assuming the employee name is passed as a query parameter
  const sql = `SELECT t.project FROM employees e JOIN tasks t ON
e.name = t.employee WHERE e.name = ?`;

  db.query(sql, [employeeName], (err, result) => {
    if (err) {
      console.error('Error fetching projects from database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Projects fetched from database');
      res.status(200).json(result);
    }
  });
});



// Endpoint to fetch projects based on user role
app.get('/api/getFilteredProjects/:userId', (req, res) => {
  const userId = req.params.userId;
  // Assuming you have a table named 'users' with a column 'role'
  const getUserRoleQuery = 'SELECT role FROM users WHERE id = ?';
  db.query(getUserRoleQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user role:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (result.length === 0) {
      console.error('User not found');
      res.status(404).send('User not found');
      return;
    }
    const userRole = result[0].role;
    let sql;
    if (userRole === 'admin' || userRole === 'team leader') {
      // If user is admin or team leader, fetch all projects
      sql = 'SELECT * FROM projects';
    } else {
      // If user is employee, fetch projects associated with the employee
      sql = 'SELECT * FROM projects WHERE employeeId = ?';
    }
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Projects fetched based on user role');
        res.status(200).json(result);
      }
    });
  });
});

//weekly  calender data
// Endpoint to fetch projects table data from the database
// app.get('/getCalenderTime', (req, res) => {
//   const sql = 'SELECT timeRequired, timeTaken FROM tasks';
//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error('Error fetching tasks from database:', err);
//       res.status(500).send('Internal Server Error');
//     } else {
//       console.log('Tasks fetched from database');
//       res.json(result);
//     }
//   });
// });


// Endpoint to fetch timeRequired and timeTaken from tasks table
app.get('/api/getCalenderTime', (req, res) => {
  // const date = req.params.date;
  // const sql = 'SELECT timeRequired, timeTaken FROM tasks where date = `2024-03-18`';


  const date = '2024-03-18';
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching timeRequired and timeTaken from tasks table:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('TimeRequired and TimeTaken fetched from tasks table');
      res.json(result);
    }
  });
});


// Endpoint to update a project
app.put('/api/updateProject/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const { projectName, salesName } = req.body;

  const sql = 'UPDATE projects SET projectName = ?, salesName = ? WHERE id_p = ?';
  db.query(sql, [projectName, salesName, projectId], (err, result) => {
    if (err) {
      console.error('Error updating project:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Project updated successfully');
      res.status(200).send('Project updated successfully');
    }
  });
});

// Endpoint to delete a project
app.delete('/api/deleteProject/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  const sql = 'DELETE FROM projects WHERE id_p = ?';
  db.query(sql, [projectId], (err, result) => {
    if (err) {
      console.error('Error deleting project from database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Project deleted from database');
      res.status(200).send('Project deleted successfully');
    }
  });
});



///////Tasks Table////////

// Endpoint to fetch employee names from the database in task table
app.get('/api/getEmployeeNames', (req, res) => {
  const sql = 'SELECT name FROM employees'; // Assuming 'name' is the column containing employee names
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching employee names:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const employeeNames = results.map((row) => row.name);
    res.json(employeeNames);
  });
});

// // Endpoint to add a new task
app.post('/api/addTasks', (req, res) => {
  const { employee, project, taskName, timeRequired, description,
    isLastTask, date } = req.body;

  const sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
  db.query(sql, [employee, project, taskName, timeRequired,
    description, isLastTask, date], (err, result) => {
      if (err) {
        console.error('Error adding task to database:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Task added to database');
        res.status(200).send('Task added successfully');
      }
    });
});





// Endpoint to update a task
app.put('/api/updateTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const { taskName, timeRequired, description, isLastTask,
    hoursRequired, minutesRequired } = req.body;

  const sql = 'UPDATE tasks SET taskName = ?, timeRequired = ?,description = ?, isLastTask = ?, hoursRequired = ?, minutesRequired =? WHERE taskId = ?';
  db.query(sql, [taskName, timeRequired, description, isLastTask,
    hoursRequired, minutesRequired, taskId], (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Task updated successfully');
        res.status(200).send('Task updated successfully');
      }
    });
});


// Endpoint to fetch tasks table data from the database
app.get('/api/getTasks', (req, res) => {
  const sql = 'SELECT project, taskName, timeRequired, date,description, isLastTask FROM tasks';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching tasks from database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Tasks fetched from database');
      res.status(200).json(result);
    }
  });
});






// app.post('/api/addTasks', (req, res) => {
//   const { employee, project, taskName, timeRequired, description,isLastTask, date } = req.body;

//   let sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
//   let data = [employee, project, taskName, timeRequired,description, isLastTask, date];

//   // Handle missing project ID (optional)
//   if (!project) {
//     sql = 'INSERT INTO tasks (employee, project, taskName,timeRequired, description, isLastTask, date) VALUES (?, ?, ?, ?, ?, ?,?)';
//     data = [employee, project, taskName, timeRequired, description,isLastTask, date];
//   }
//   db.query(sql, [employee, project, taskName, timeRequired,description, isLastTask, date], (err, result) => {
//         if (err) {
//           console.error('Error adding task to database:', err);
//           res.status(500).send('Internal Server Error');
//         } else {
//           // console.log(result)
//           console.log('Task added to database');
//           res.status(200).send('Task added successfully');
//         }
//       });
//     });


// app.get('/api/tasksByProject/:projectName', (req, res) => {
//   const projectName = req.params.projectName;
//   const sql = 'SELECT * FROM tasks WHERE id_t = ?';
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

// app.get('/api/tasksByProject/:projectName', (req, res) => {
//   const projectName = req.params.projectName;
//   const sql = 'SELECT tasks.id_t, tasks.taskName FROM tasks JOIN projects ON tasks.id_p = projects.id_p WHERE projects.projectName =?';
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

// Endpoint to fetch tasks by project name
app.get('/api/tasksByProject/:projectName', (req, res) => {
  const projectName = req.params.projectName;
  const sql = 'SELECT * FROM tasks WHERE project = ?'; // Assuming 'project' is the column name in the tasks table
  db.query(sql, [projectName], (err, result) => {
    if (err) {
      console.error('Error fetching tasks by project name:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Tasks fetched by project name');
      res.status(200).json(result);
    }
  });
});



// Endpoint to fetch a task by ID
app.get('/api/getTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const sql = 'SELECT * FROM tasks WHERE id_t = ?';
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error('Error fetching task details:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length > 0) {
        console.log('Task details fetched successfully');
        res.status(200).json(result[0]); // Assuming only one task will be fetched
      } else {
        console.log('Task not found');
        res.status(404).send('Task not found');
      }
    }
  });
});





// Endpoint to delete a task
app.delete('/api/deleteTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  console.log('Received delete request for task with ID:', taskId); //Check if the server receives the request
  const sql = 'DELETE FROM tasks WHERE id_t = ?';
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task from database:', err);
      res.status(500).send('Internal Server Error');
    } else if (result.affectedRows === 0) {
      console.error('Task not found');
      res.status(404).send('Task not found');
    } else {
      console.log('Task deleted from database');
      res.status(200).send('Task deleted successfully');
    }
  });
});







// Endpoint to add a new employee
app.post('/api/addEmployee', (req, res) => {
  const { name, nickname, email, useEmail, password, confirmPassword,
    role, location } = req.body;

  const sql = 'INSERT INTO employees (name, nickname, email,use_email, password, confirm_password, role, location) VALUES (?, ?,?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, nickname, email, useEmail, password,
    confirmPassword, role, location], (err, result) => {
      if (err) {
        console.error('Error adding employee to database:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Employee added to database');
        res.status(200).send('Employee added successfully');
      }
    });
});


// Endpoint to fetch a specific employee by ID
app.put('/api/getEmployee/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const sql = 'SELECT * FROM employees WHERE name = ?';
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error('Error fetching employee data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length > 0) {
        console.log('Employee data fetched successfully');
        res.status(200).json(result[0]); // Assuming only one employee will be fetched
      } else {
        console.log('Employee not found');
        res.status(404).send('Employee not found');
      }
    }
  });
});

// Endpoint to fetch project lists of a particular employee
app.get('/api/getProjectsByEmployee/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const sql = 'SELECT * FROM projects WHERE id_e = ?'; // Assuming 'employeeId' is the column containing employee IDs in the projects table
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error('Error fetching projects by employee ID:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Projects fetched by employee ID');
      res.status(200).json(result);
    }
  });
});

// Endpoint to update an employee




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

// Endpoint to fetch all tasks from the task table
app.get('/api/getAllTasks', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});



// Endpoint to update a task
app.put('/api/updateTask', (req, res) => {

  const { taskName, timeTaken, description, isLastTask } = req.body;

  const updateTaskQuery = 'UPDATE tasks SET taskName = ?, timeTaken =?, description = ?, isLastTask = ? WHERE id_t = ?';
  db.query(updateTaskQuery, [taskName, timeTaken, description,
    isLastTask, taskId], (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Task updated successfully');
        res.status(200).send('Task updated successfully');
      }
    });
});

//End point to Edit Task
app.put('/api/editTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const { taskName, timeRequired, description, isLastTask } = req.body;

  const sql = 'UPDATE tasks SET taskName = ?, timeRequired = ?,description = ?, isLastTask = ? WHERE id_t = ?';
  db.query(sql, [taskName, timeRequired, description, isLastTask,
    taskId], (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Task updated successfully');
        res.status(200).send('Task updated successfully');
      }
    });
});


// Endpoint to delete a task by ID
app.delete('/api/deleteTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  console.log('Received delete request for task with ID:', taskId); //Check if the server receives the request
  const sql = 'DELETE FROM tasks WHERE id_t = ?'; // Update column name to 'id_t'
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task from database:', err);
      res.status(500).send('Internal Server Error');
    } else if (result.affectedRows === 0) {
      console.error('Task not found');
      res.status(404).send('Task not found');
    } else {
      console.log('Task deleted from database');
      res.status(200).send('Task deleted successfully');
    }
  });
});






app.get('/api/tasksByDateRange', (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = 'SELECT * FROM tasks WHERE date BETWEEN ? AND ?';
  db.query(sql, [startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error fetching tasks by date range:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Tasks fetched by date range');
      res.status(200).json(result);
    }
  });
});


// Endpoint to fetch tasks by date
app.get('/api/tasksByDate/:date', (req, res) => {
  const date = req.params.date;

  const sql = 'SELECT * FROM tasks WHERE date = ?';
  db.query(sql, [date], (err, result) => {
    if (err) {
      console.error('Error fetching tasks by date:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Tasks fetched by date');
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

app.get('/api/fetchAllLoginData', (req, res) => {
  // Query the database to retrieve all data from the login table
  const sql = 'SELECT * FROM employees';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving login data:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }

    // Check if any data was retrieved
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in login table' });
    }

    // Send the retrieved data in the response
    return res.status(200).json({ success: true, message: 'Login data retrieved successfully', data: results });
  });
});


app.post('/api/assignTask', (req, res) => {
  const { employee, project, taskName, timeRequired, description,
    isLastTask, date } = req.body;

  // Insert the task into the tasks table
  const insertTaskQuery = "INSERT INTO tasks (employee, project, taskName, timeRequired, description, isLastTask, date) VALUES (?, ?,?, ?, ?, ?, ?)'";
  db.query(insertTaskQuery, [employee, project, taskName, timeRequired, description, isLastTask, date], (err, result) => {
    if (err) {
      console.error('Error adding task to database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Task added to database');
      res.status(200).send('Task added successfully');
    }
  });
});


// Endpoint to handle updating an employee
app.put('/api/updateEmployee/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const { name, nickname, email, use_email, password,
    confirm_password, role, location } = req.body;

  const sql = 'UPDATE employees SET name = ?, nickname = ?, email = ?, use_email = ?, password = ?, confirm_password = ?, role = ?, location = ? WHERE id_e = ?';
  db.query(sql, [name, nickname, email, use_email, password,
    confirm_password, role, location, employeeId], (err, result) => {
      if (err) {
        console.error('Error updating employee:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Employee updated successfully');
        res.status(200).send('Employee updated successfully');
      }
    });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});