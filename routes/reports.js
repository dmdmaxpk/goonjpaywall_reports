const express = require('express');
const cors = require('cors');
const router = express.Router();
const controller = require('../controllers/reportsApi');

router.route('/reports', cors())
    .get(controller.getReports);

module.exports = router;
