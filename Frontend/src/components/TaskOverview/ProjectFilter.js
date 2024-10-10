import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Button } from '@mui/material';

const ProjectFilter = ({ open, onClose, onSave, filterOptions, setFilterOptions }) => {
    const [amcChecked, setAmcChecked] = useState(filterOptions.amc);
    const [internalChecked, setInternalChecked] = useState(filterOptions.internal);
    const [lessThanTenTasksChecked, setLessThanTenTasksChecked] = useState(filterOptions.lessThanTenTasks);
    const [aToZChecked, setAToZChecked] = useState(filterOptions.aToZ); // Add A to Z state

    const theme = createTheme({
        typography: {
            fontFamily: 'Nunito, sans-serif',
        },
    });

    // Update state whenever filterOptions prop changes
    useEffect(() => {
        setAmcChecked(filterOptions.amc);
        setInternalChecked(filterOptions.internal);
        setLessThanTenTasksChecked(filterOptions.lessThanTenTasks);
        setAToZChecked(filterOptions.aToZ); // Add A to Z option sync
    }, [filterOptions]);

    const handleCheckboxChange = (event) => {
        // Call the passed setFilterOptions function from props
        setFilterOptions(prevOptions => ({
            ...prevOptions,
            [event.target.name]: event.target.checked,
        }));
    };

    const handleSave = () => {
        onSave(filterOptions); // Pass the current filterOptions back
        onClose(); // Close the dialog after saving
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Filter projects</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterOptions.amc}
                                onChange={handleCheckboxChange}
                                name="amc"
                            />
                        }
                        label="AMC"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterOptions.internal}
                                onChange={handleCheckboxChange}
                                name="internal"
                            />
                        }
                        label="Internal"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterOptions.lessThanTenTasks}
                                onChange={handleCheckboxChange}
                                name="lessThanTenTasks"
                            />
                        }
                        label="Less than 10 tasks"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={filterOptions.aToZ} // Updated to check for A to Z sorting option
                                onChange={handleCheckboxChange}
                                name="aToZ"
                            />
                        }
                        label="A to Z"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave} variant="contained" color="success">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ProjectFilter;
