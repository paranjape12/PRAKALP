const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/getProfile', profileController.getProfile);
router.post('/getLogin', profileController.getLogin);
router.post('/empDropdown', profileController.empDropdown);
router.put('/updateProfile', profileController.updateProfile);

module.exports = router;
