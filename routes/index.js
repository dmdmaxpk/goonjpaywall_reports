const express = require('express');
const router = express.Router();

router.use('/cron',    require('./cron'));
router.use('/reports',    require('./reports'));

module.exports = router;