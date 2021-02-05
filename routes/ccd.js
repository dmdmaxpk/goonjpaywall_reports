const express = require('express');
const cors = require('cors');
const router = express.Router();
const controller = require('../controllers/reportsApi');
const connection = require('../middlewares/connection');

router.route('/api-data', cors())
    .get(connection.connect, controller.getReports);

module.exports = router;
