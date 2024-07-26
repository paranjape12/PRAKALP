import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import "./AddEmployee.css";
import EditEmployee from "./EditEmployee";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const AddEmployee = ({ openDialog, setOpenDialog }) => {
  const emailRef = useRef(null);
  const [showPasswordFields, setShowPasswordFields] = useState(true);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);


  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Type: "unset",
    Location: "unset",
    Nickname: "",
    Password: "",
    confirmPassword: "",
    loginusinggmail: 0,
    access: {},
  });

  const pages = [
    { PageName: "Project" },
    { PageName: "Epmloyee" },
    { PageName: "Task" },
    // Add more pages as needed
  ];

  const [openEditDialog, setOpenEditDialog] = useState(false);

  // const [availabepages, setAvailablePages] = useState([]); //add-emp3

  useEffect(() => {
    // Fetch pages
    axios
      .get("http://localhost:3001/api/pages")
      .then((response) => {
        console.log("Pages fetched successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the pages!", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If the checkbox "Use Email For Login" is changed
    if (name === "loginusinggmail") {
      // If checked, set loginusinggmail to 1, otherwise set it to 0
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0,
      });
      // Show/hide password fields based on the checkbox state
      setShowPasswordFields(!checked);
    } else {
      // For other fields, update the form data as usual
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // const handleAccessChange = (pageName, accessType) => {
  //   setFormData(prevState => ({
  //     ...prevState,
  //     access: {
  //       ...prevState.access,
  //       [pageName]: {
  //         ...prevState.access[pageName],
  //         [accessType]: !prevState.access[pageName]?.[accessType]
  //       }
  //     }
  //   }));
  // };

  const handleAccessChange = (pageName, accessType) => {
    setFormData(prevState => {
      const newAccess = { ...prevState.access };

      if (!newAccess[pageName]) {
        newAccess[pageName] = {};
      }

      const currentStatus = newAccess[pageName][accessType];

      if (accessType === 'add') {
        if (currentStatus) {
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].add = true;
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === 'edit') {
        if (currentStatus) {
          newAccess[pageName].edit = false;
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === 'view') {
        if (currentStatus) {
          newAccess[pageName].view = false;
          newAccess[pageName].edit = false;
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].view = true;
        }
      }

      return {
        ...prevState,
        access: newAccess
      };
    });
  };


  // Validation function
  const valid = (Name, Email, Password, confirmPassword, Type, Location) => {
    // Check if all fields are filled
    if (
      !Name ||
      !Email ||
      !Password ||
      !confirmPassword ||
      Type === "unset" ||
      Location === "unset"
    ) {
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return false;
    }

    // Validate password length
    if (Password.length < 6) {
      return false;
    }

    // Confirm password matches
    if (Password !== confirmPassword) {
      return false;
    }

    // If all conditions pass, return true for valid
    return true;
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   axios.post('http://localhost:3001/api/add-employee', formData)
  //     .then(response => {
  //       console.log(response.data);
  //       // Handle successful form submission
  //       setOpenDialog(false); // Close the dialog after successful submission
  //     })
  //     .catch(error => {
  //       console.error('There was an error adding the employee!', error);
  //     });
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { Name, Email, Password, confirmPassword, Type, Location, Nickname } =
      formData;
    const selctrole = Type !== "unset" ? Type : "";
    const selctloc = Location !== "unset" ? Location : "";

    // Extract first name and last name from full name
    const [fname, ...lnameParts] = Name.split(" ");
    const lname = lnameParts.join(" ");

    const pagename = [];
    const pagevalue = [];

    // Loop through the pages to get their names and values
    pages.forEach((page) => {
      pagename.push(page.PageName);

      const pageAccess = formData.access[page.PageName];
      if (pageAccess === 3) {
        pagevalue.push(0);
      } else if (pageAccess === 2) {
        pagevalue.push(3);
      } else {
        pagevalue.push(pageAccess);
      }
    });

    // Determine if the "Use Email For Login" checkbox is checked
    const loginusinggmail = formData.loginusinggmail ? 1 : 0;

    if (valid(Name, Email, Password, confirmPassword, selctrole, selctloc)) {
      axios
        .post("http://localhost:3001/api/add-employee", {
          Name,
          fname,
          lname,
          Nickname,
          Email,
          Password,
          Type: selctrole,
          Location: selctloc,
          loginusinggmail,
        })
        .then((response) => {
          if (response.data === "User exist") {
            // Handle case where employee already exists
            // You can show an error message here
          } else if (response.data === "Error") {
            // Handle case where there was an error creating the employee
            // You can show an error message here
          } else {
            // Handle successful creation of employee
            // You can show a success message here
            setOpenDialog(false); // Close the dialog after successful submission
            setFormData({
              Name: "",
              Email: "",
              Type: "unset",
              Location: "unset",
              Nickname: "",
              Password: "",
              confirmPassword: "",
              loginusinggmail: 0,
              access: {},
            });
          }
        })
        .catch((error) => {
          console.error("There was an error adding the employee!", error);
        });
    } else {
      // Handle case where form validation fails
      // You can show an error message here
    }
  };

  // Create a ref for Transition
  const nodeRef = useRef(EditEmployee);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  const handleOpenEditEmployeeDialog = () => {
    setEditEmployeeOpen(true);
  };

  const handleCloseEditEmployeeDialog = () => {
    setEditEmployeeOpen(false);
  };


  return (
    <>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>Add New Employee
          <Button className='editEmp-btn' style={{ marginLeft: '35rem' }} onClick={handleOpenEditEmployeeDialog} color='primary' variant='contained'>Edit Employee</Button>
          <EditEmployee open={editEmployeeOpen} handleClose={handleCloseEditEmployeeDialog}/>
          <hr style={{ marginTop: "0.3rem", marginBottom: "0" }} />
        </DialogTitle>


        <DialogContent>
          <form onSubmit={handleSubmit} className="row">
            <div className="col-md-6">
              {/* Name Field */}
              <InputLabel
                htmlFor="Empnm"
                className="form-control-label text-dark font-weight-bold"
                style={{ color: "black" }}
              >
                Name
              </InputLabel>
              <TextField
                label="Name"
                placeholder="Enter Name"
                variant="outlined"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                fullWidth
                required
                style={{ marginBottom: "1rem" }}
              />
              {/* Email Field */}
              <InputLabel
                htmlFor="EmpnameEmail"
                className="form-control-label text-dark font-weight-bold"
              >
                Email
              </InputLabel>
              <TextField
                label="Email"
                placeholder="Enter Name eg.abc@protoevc.com"
                variant="outlined"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                fullWidth
                required
                type="email"
                style={{ marginBottom: "1rem" }}
              />
              <div className="row form-group1">
                {/* Role Field */}
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-12">
                      <InputLabel
                        htmlFor="dropRole"
                        className="form-control-label text-dark font-weight-bold"
                      >
                        Role
                      </InputLabel>
                      
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={formData.Type}
                          onChange={handleChange}
                          name="Type"
                          label="Role"
                        >
                          <MenuItem value="unset" disabled>
                            Select Role
                          </MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="Team Leader">Team Leader</MenuItem>
                          <MenuItem value="Employee">Employee</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
                {/* Location Field */}
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-12">
                      <InputLabel
                        htmlFor="dropLocation"
                        className="form-control-label text-dark font-weight-bold"
                      >
                        Location
                      </InputLabel>
                      <FormControl fullWidth required variant="outlined">
                        <InputLabel>Location</InputLabel>
                        <Select
                          value={formData.Location}
                          onChange={handleChange}
                          name="Location"
                          label="Location"
                        >
                          <MenuItem value="unset" disabled>
                            Select Location
                          </MenuItem>
                          <MenuItem value="Mumbai">Mumbai</MenuItem>
                          <MenuItem value="Ratnagiri">Ratnagiri</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                {/* Use Email For Login Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.loginusinggmail}
                      onChange={handleChange}
                      name="loginusinggmail"
                      color="blue"
                    />
                  }
                  label="Use Email For Login"
                ></FormControlLabel>
              </div>
              {showPasswordFields && (
                <>
                  {/* Password Field */}
                  <InputLabel
                    htmlFor="Emppass"
                    className="form-control-label text-dark font-weight-bold"
                  >
                    {" "}
                    Password
                  </InputLabel>
                  <TextField
                    label="Password"
                    placeholder="Enter Password eg.abc@Protovec123"
                    variant="outlined"
                    name="Password" // Corrected from "password"
                    type={showPassword ? "text" : "password"}
                    value={formData.Password}
                    onChange={handleChange}
                    fullWidth
                    required
                    style={{ marginBottom: "1rem" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? (
                              <FontAwesomeIcon icon={faEye} />
                            ) : (
                              <FontAwesomeIcon icon={faEyeSlash} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* Confirm Password Field */}
                  <InputLabel
                    htmlFor="Emppass"
                    className="form-control-label text-dark font-weight-bold"
                  >
                    Confirm Password
                  </InputLabel>
                  <TextField
                    label="Confirm Password"
                    placeholder="Enter Confirm Password"
                    variant="outlined"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                    type="password"
                    onClick={handleClickShowPassword}
                  >
                    {" "}
                  </TextField>
                </>
              )}
            </div>
            <div className="col-md-6">
              {/* Nickname Field */}
              <InputLabel
                htmlFor="Empnicnm"
                className="form-control-label text-dark font-weight-bold"
              >
                NickName
              </InputLabel>
              <TextField
                label="Nickname"
                placeholder="Enter Nickname"
                variant="outlined"
                name="Nickname"
                value={formData.Nickname}
                onChange={handleChange}
                fullWidth
                required
                style={{ marginBottom: "1rem" }}
              />
              {/* Access To Table */}
              <InputLabel  htmlFor="text-input1"
                className="form-control-label text-dark font-weight-bold">
                  Access To
              </InputLabel>
              
              <div className="table-responsive text-dark">
                <table
                  className="table table-bordered text-dark"
                  id="tableeditsave"
                >
                  <thead className="bg-primary text-white">
                    <tr>
                      <th></th>
                      <th>Add</th>
                      <th>Edit</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages &&
                      pages.map((page) => (
                        <tr key={page.PageName}>
                          <th className="text-left pagenametable">
                            {page.PageName}
                          </th>
                          <td className="text-center" name="project">
                            <Checkbox
                              checked={
                                formData.access[page.PageName]?.add || false
                              }
                              onChange={() =>
                                handleAccessChange(page.PageName, "add")
                              }
                            />
                          </td>
                          <td className="text-center" name="employee">
                            <Checkbox
                              checked={
                                formData.access[page.PageName]?.edit || false
                              }
                              onChange={() =>
                                handleAccessChange(page.PageName, "edit")
                              }
                            />
                          </td>
                          <td className="text-center" name="task">
                            <Checkbox
                              checked={
                                formData.access[page.PageName]?.view || false
                              }
                              onChange={() =>
                                handleAccessChange(page.PageName, "view")
                              }
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            className="close-btn"
            onClick={() => setOpenDialog(false)}
            color="danger"
            variant="contained"
          >
            Close
          </Button>
          <Button
            className="save-btn"
            onClick={handleSubmit}
            color="success"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEmployee;
