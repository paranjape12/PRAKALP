import React, { useState, useEffect } from "react";
import axios from "axios";
import { Buffer } from "buffer";
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


} from "@mui/material";
import { toast } from "react-toastify";
import "./AddEmployee.css";
import EditEmployee from "./EditEmployee";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { closeAddProjectModal, setAddProjectModal, openAddProjectModal } from '../../../../services/redux/AddEmployeeSlice';
import { useDispatch } from "react-redux";

const AddEmployee = ({handleCloseModalForTemplate} ) => {

  const dispatch = useDispatch();

  const [showPasswordFields, setShowPasswordFields] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [editEmployeeModal, setEditEmployeeModal] = useState(false);


  const handleCloseEditEmployeeModal = () => {
    setEditEmployeeModal(false);
  }
  
  const handleOpenEditEmployeeModal = () => {
    dispatch(closeAddProjectModal(false));
    setEditEmployeeModal(true);
  }

  const addEmployeeModal = useSelector((state) => state.addEmployee.addEmployeeModal);


  const handleOpenAddEmployeeModal = () => {
    dispatch(openAddProjectModal(true));
  }

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Type: "unset",
    Location: "unset",
    Nickname: "",
    Password: "",
    confirmPassword: "",
    loginusinggmail: false,
    access: {},
  });

  const pages = [
    { PageName: "Project" },
    { PageName: "Employee" },
    { PageName: "Task" },
    // Add more pages as needed
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If the checkbox "Use Email For Login" is changed
    if (name === "loginusinggmail") {
      // If checked, set loginusinggmail to true, otherwise set it to false
      setFormData({
        ...formData,
        [name]: checked,
      });
      // Show/hide password fields based on the checkbox state
      setShowPasswordFields(!checked);
    }  else if (name === 'Type') {
      if (value === 'Admin') {
        const adminAccess = pages.reduce((acc, page) => {
          acc[page.PageName] = { add: true, edit: true, view: true };
          return acc;
        }, {});
  
        setFormData({
          ...formData,
          [name]: value, // Set Type to Admin
          access: adminAccess // Set all access rights to true
        });
      } else {
        // If not Admin, keep the current access
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      // For other fields, update the form data as usual
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleAccessChange = (pageName, accessType) => {
    setFormData((prevState) => {
      const newAccess = { ...prevState.access };

      if (!newAccess[pageName]) {
        newAccess[pageName] = {};
      }

      const currentStatus = newAccess[pageName][accessType];

      if (accessType === "add") {
        if (currentStatus) {
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].add = true;
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === "edit") {
        if (currentStatus) {
          newAccess[pageName].edit = false;
          newAccess[pageName].add = false;
        } else {
          newAccess[pageName].edit = true;
          newAccess[pageName].view = true;
        }
      } else if (accessType === "view") {
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
        access: newAccess,
      };
    });
  };

  // Validation function
  const valid = (Name, Email, Password, confirmPassword, Type, Location, Nickname) => {
    // Check if all fields are filled
    if (
      !Name ||
      !Email ||
      (!Password && !formData.loginusinggmail) ||
      (!confirmPassword && !formData.loginusinggmail) ||
      Type === "unset" ||
      Location === "unset" ||
      !Nickname
    ) {
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return false;
    }

    // Validate password length
    if (!formData.loginusinggmail && Password.length < 6) {
      return false;
    }

    // Confirm password matches
    if (!formData.loginusinggmail && Password !== confirmPassword) {
      return false;
    }

    // If all conditions pass, return true for valid
    return true;
  };

  useEffect(() => {
    setFormData({
      Name: "",
      Email: "",
      Type: "unset",
      Location: "unset",
      Nickname: "",
      Password: "",
      confirmPassword: "",
      loginusinggmail: false,
      access: {},
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailDomain = "@protovec.com";
    if (!formData.Email.endsWith(emailDomain)) {
      toast.error(`Email must end with ${emailDomain}`);
      return;
    }

    const { Name, Email, Password, confirmPassword, Type, Location, Nickname } = formData;

    if (formData.Type === "unset") {
      toast.error("Role is required");
    } else {
      setRoleError("");
    }

    if (formData.Location === "unset") {
      toast.error("Location is required");
    } else {
      setLocationError("");
    }

    // Define the pagename and pagevalue arrays
    const pagename = Object.keys(formData.access);
    const pagevalue = pagename.map((page) => {
      if (formData.access[page]?.add) return 0; // all permissions
      if (formData.access[page]?.edit) return 3; // edit and view permissions
      if (formData.access[page]?.view) return 1; // view permissions only
      return 2; // default or no permissions
    });

    // Generate the new password based on the checkbox value
    const newPassword = formData.loginusinggmail
      ? `${formData.Email.split("@")[0]}@Protovec123`
      : formData.Password;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$.!%*?&])[A-Za-z\d@$!%.*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be in format 'Abc@123'");
      return;
    }

    // Encode the password
    const encodedPassword = Buffer.from(newPassword).toString("base64");

    // Create request data object
    const requestData = {
      Email: formData.Email,
      Password: encodedPassword,
      Type: formData.Type,
      Location: formData.Location,
      loginusinggmail: formData.loginusinggmail,
      Name: formData.Name,
      Nickname: formData.Nickname,
      pagename,
      pagevalue,
    };

    if (valid(Name, Email, Password, confirmPassword, Type, Location, Nickname)) {
      axios
        .post(`${process.env.REACT_APP_API_BASE_URL}/addemployee`, requestData)
        .then((response) => {
          if (response.status === 200) {
            toast.success("Employee added successfully!");
            setFormData({
              Name: "",
              Email: "",
              Type: "unset",
              Location: "unset",
              Nickname: "",
              Password: "",
              confirmPassword: "",
              loginusinggmail: false,
              access: {},
            });
          }
        })
        .catch((error) => {
          toast.error("Employee add failed!");
          console.error("There was an error adding the employee!", error);
        });
    } else {
      toast.error("Please fill all the required fields correctly");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  const handleCloseAddEmployee = () => {

    dispatch(closeAddProjectModal(false));

  }





  return (
    <>
      <Dialog
        maxWidth="md"
        open={addEmployeeModal}
        onClose={handleCloseAddEmployee}
      >
        <DialogTitle>
          Add New Employee
          <Button
            onClick={handleOpenEditEmployeeModal}
            className="editEmp-btn"
            style={{ marginLeft: "27rem" }}
            color="primary"
            variant="contained"

          >
            Edit Employee
          </Button>
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
                      {roleError && <p style={{ color: "red" }}>{roleError}</p>}
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
                      {locationError && (
                        <p style={{ color: "red" }}>{locationError}</p>
                      )}
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
                      color="default"
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
              <label
                htmlFor="text-input1"
                className="form-control-label text-dark font-weight-bold"
              >
                Access To
              </label>
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
          <hr style={{ marginTop: "1rem", marginBottom: "0" }} />
        </DialogContent>
        <DialogActions>
          <Button
            className="close-btn"
            color="error"
            variant="contained"
            onClick={handleCloseAddEmployee}
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

      {
        editEmployeeModal &&
        <EditEmployee openEditEmployeeModal={editEmployeeModal} handleCloseEditEmployeeModal={handleCloseEditEmployeeModal} />
      }
    </>
  );
};

export default AddEmployee;
  