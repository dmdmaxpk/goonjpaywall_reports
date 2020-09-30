const express = require('express');
const router = express.Router();
const controller = require('../controllers/cron');
const connecton = require('../middlewares/connecton');

router.route('/compute-user-reports')
    .get(connecton.connect, controller.computeUserReports);

router.route('/compute-subscriber-reports')
    .get(connecton.connect, controller.computeSubscriberReports);

router.route('/compute-subscription-reports')
    .get(connecton.connect, controller.computeSubscriptionReports);

router.route('/compute-billing-history-reports')
    .get(connecton.connect, controller.computeBillingHistoryReports);

router.route('/compute-callback-send-reports')
    .get(connecton.connect, controller.computeCallbackSendReports);

router.route('/compute-transactions-avg-reports')
    .get(connecton.connect, controller.computeTransactionsAvgReports);

router.route('/compute-charge-detail-and-transaction-reports')
    .get(connecton.connect, controller.computeChargeDetailsReports);

router.route('/compute-revenue-net-addition-reports')
    .get(connecton.connect, controller.computeRevenueNetAdditionReports);

router.route('/compute-page-view-reports')
    .get(connecton.connect, controller.computePageViewReports);

module.exports = router;
