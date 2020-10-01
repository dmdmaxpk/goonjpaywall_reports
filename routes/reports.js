const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportsApi');

router.route('/reports')
    .get(controller.getReports);

module.exports = router;
