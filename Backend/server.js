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


// api endpoint to register new user
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

// Endpoint to add a new project
app.post('/api/addProject', (req, res) => {
  const { projectName, salesName } = req.body;

  const sql = 'INSERT INTO projects (projectName, salesName) VALUES (?, ?)';
  db.query(sql, [projectName, salesName], (err, result) => {
    if (err) {
      console.error('Error adding project to database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Project added to database');
      res.status(200).send('Project added successfully');
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




// Endpoint to fetch project names from the database
app.get('/api/getProjectNames', (req, res) => {
  const sql = 'SELECT projectName FROM projects'; // Assuming 'projectName' is the column containing project names
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



app.post('/api/getLogin', (req, res) => {
  const { name, password } = req.body;

  // Query the database to retrieve the user's data
  const sql = 'SELECT * FROM employees WHERE name = ?';
  db.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error retrieving user data:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }

    // Check if the user exists
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];

    // Verify the password
    if (password === user.password) {
      // Passwords match, login successful
      return res.status(200).json({ success: true, message: 'Login successful', user });
    } else {
      // Passwords don't match
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
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