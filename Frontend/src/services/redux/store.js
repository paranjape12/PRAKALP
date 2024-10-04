import {configureStore} from '@reduxjs/toolkit';
import addEmployeeReducer from './AddEmployeeSlice';


export const store = configureStore({
     reducer: {
            addEmployee: addEmployeeReducer
      } 
});