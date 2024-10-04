import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  addEmployeeModal: false
};

const addEmployeeSlice = createSlice({
  name: 'add_employee',
  initialState: initialValue,
  reducers: {
    openAddProjectModal: (state) => {
      state.addEmployeeModal = true;
    },
    closeAddProjectModal: (state) => {
      state.addEmployeeModal = false;
    }
  }
});

// Corrected the export statement
export const { openAddProjectModal, closeAddProjectModal } = addEmployeeSlice.actions; 
export default addEmployeeSlice.reducer;
 