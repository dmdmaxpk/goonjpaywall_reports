const express = require('express');
const router = express.Router();
const controller = require('../controllers/cron');
const connection = require('../middlewares/connection');

router.route('/compute-user-reports')
    .get(connection.connect, controller.computeUserReports); //

router.route('/compute-subscriber-reports')
    .get(connection.connect, controller.computeSubscriberReports); //

router.route('/compute-subscriber-subscriptions-reports')
    .get(connection.connect, controller.computeSubscriberSubscriptionsReports);

router.route('/compute-subscriber-transaction-reports')
    .get(connection.connect, controller.computeSubscriberTransactionsReports);

router.route('/compute-transactions-avg-reports')
    .get(connection.connect, controller.computeTransactionsAvgReports);

router.route('/compute-subscription-reports')
    .get(connection.connect, controller.computeSubscriptionReports); //**

router.route('/compute-billing-history-reports')
    .get(connection.connect, controller.computeBillingHistoryReports); //**

router.route('/compute-callback-send-reports')
    .get(connection.connect, controller.computeCallbackSendReports); //

router.route('/compute-charge-detail-reports')
    .get(connection.connect, controller.computeChargeDetailsReports); //

router.route('/compute-revenue-net-addition-reports')
    .get(connection.connect, controller.computeRevenueNetAdditionReports); //

router.route('/compute-affiliate-reports')
    .get(connection.connect, controller.computeAffiliateReports); //

router.route('/compute-affiliate-mids-from-subscriptions-reports')
    .get(connection.connect, controller.computeAffiliateMidsFromSubscriptionsReports); //

router.route('/compute-helogs-logger-reports')
    .get(connection.connect, controller.computeHelogsReports); //

router.route('/compute-helogs-unique-success-logger-reports')
    .get(connection.connect, controller.computeHelogsUniqueSuccessReports); //

router.route('/compute-page-views-logger-reports')
    .get(connection.connect, controller.computeLogsPageViewReports); //

router.route('/compute-subscribe-clicks-logger-reports')
    .get(connection.connect, controller.computeLogsSubscribeClicksReports); //

router.route('/cron-compute-daily-data-reports')
    .get(connection.connect, controller.cronComputeDailyDataReports); //

module.exports = router;
