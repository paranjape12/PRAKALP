const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/register', profileController.register);
router.get('/googlelogin', profileController.googlelogin);
router.get('/AES256CBClogin', profileController.AES256CBClogin);
router.post('/getProfile', profileController.getProfile);
router.post('/getLogin', profileController.getLogin);
router.post('/empDropdown', profileController.empDropdown);
router.post('/updateUser', profileController.updateUser);
router.post('/addemployee',profileController.addemployee);
router.get('/editEmpAccessData',profileController.editEmpAccessData);
router.put('/updateemployee',profileController.updateemployee);
router.post('/deleteEmployee',profileController.deleteEmployee);
router.post('/allEmployeeOverview', profileController.allEmployeeOverview);
router.post('/enableEmployee', profileController.enableEmployee);


module.exports = router;
