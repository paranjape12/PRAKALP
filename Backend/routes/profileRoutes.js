const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/getProfile', profileController.getProfile);
router.post('/getLogin', profileController.getLogin);
router.post('/empDropdown', profileController.empDropdown);
router.put('/updateProfile', profileController.updateProfile);
router.post('/addemployee',profileController.addemployee);
router.get('/editEmpAccessData',profileController.editEmpAccessData);
router.put('/updateemployee',profileController.updateemployee);
router.post('/deleteEmployee',profileController.deleteEmployee);

module.exports = router;
