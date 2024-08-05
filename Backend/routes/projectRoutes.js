const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/addProject', projectController.addProject);
router.get('/getProjectNames', projectController.getProjectNames);
router.post('/empOverviewPrjIndividual', projectController.empOverviewPrjIndividual);
router.get('/EmpOverviewPlusMinus', projectController.EmpOverviewPlusMinus);

module.exports = router;
