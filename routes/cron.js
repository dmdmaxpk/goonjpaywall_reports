const express = require('express');
const router = express.Router();
const controller = require('../controllers/cron');
const connecton = require('../middlewares/connecton');

router.route('/compute-user-reports')
    .get(connecton.connect, controller.computeUserReports); //

router.route('/compute-subscriber-reports')
    .get(connecton.connect, controller.computeSubscriberReports); //

router.route('/compute-subscriber-subscriptions-reports')
    .get(connecton.connect, controller.computeSubscriberSubscriptionsReports); //

router.route('/compute-subscriber-transaction-reports')
    .get(connecton.connect, controller.computeSubscriberTransactionsReports); //

router.route('/compute-subscription-reports')
    .get(connecton.connect, controller.computeSubscriptionReports); //

router.route('/compute-billing-history-reports')
    .get(connecton.connect, controller.computeBillingHistoryReports);

router.route('/compute-callback-send-reports')
    .get(connecton.connect, controller.computeCallbackSendReports); //

router.route('/compute-transactions-avg-reports')
    .get(connecton.connect, controller.computeTransactionsAvgReports); //

router.route('/compute-charge-detail-reports')
    .get(connecton.connect, controller.computeChargeDetailsReports); //

router.route('/compute-revenue-net-addition-reports')
    .get(connecton.connect, controller.computeRevenueNetAdditionReports); //

router.route('/compute-affiliate-reports')
    .get(connecton.connect, controller.computeAffiliateReports);

router.route('/compute-helogs-logger-reports')
    .get(connecton.connect, controller.computeHelogsReports);

router.route('/compute-helogs-unique-success-logger-reports')
    .get(connecton.connect, controller.computeHelogsUniqueSuccessReports);

router.route('/compute-logs-page-view-logger-reports')
    .get(connecton.connect, controller.computeLogsPageViewReports);

router.route('/compute-logs-subscribe-button-click-logger-reports')
    .get(connecton.connect, controller.computeLogsSubscribeButtonClickReports);

module.exports = router;
