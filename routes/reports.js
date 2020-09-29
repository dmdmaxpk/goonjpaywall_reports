const express = require('express');
const router = express.Router();
const controller = require('../controllers/reports');

router.route('/reports')
    .get(controller.getReports);

module.exports = router;
