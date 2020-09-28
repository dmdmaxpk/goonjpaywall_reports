const express = require('express');
const router = express.Router();

router.use('/cron',    require('./cron'));

module.exports = router;