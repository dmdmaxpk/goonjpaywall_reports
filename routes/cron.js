const express = require('express');
const router = express.Router();
const controller = require('../controllers/cron');
const connection = require('../middlewares/connection');

router.route('/compute-user-reports')
    .get(connection.connect, controller.computeUserReports);

router.route('/compute-subscriber-reports')
    .get(connection.connect, controller.computeSubscriberReports);

router.route('/compute-subscriptions-from-billing-reports')
    .get(connection.connect, controller.computeSubscriptionFromBillingService);

router.route('/compute-subscription-reports')
    .get(connection.connect, controller.computeDailySubscriptionReports);

router.route('/compute-subscription-source-wise-reports')
    .get(connection.connect, controller.SubscriptionsSourceWiseSuccessfulService);

router.route('/compute-callback-send-reports')
    .get(connection.connect, controller.computeCallbackSendReports);

router.route('/compute-insufficient-balance-reports')
    .get(connection.connect, controller.computeInsufficientBalanceReports);

router.route('/compute-excessive-billing-reports')
    .get(connection.connect, controller.computeExcessiveBillingReports);

router.route('/compute-revenue-net-addition-reports')
    .get(connection.connect, controller.computeRevenueNetAdditionReports);

router.route('/compute-billing-history-reports')
    .get(connection.connect, controller.computeBillingHistoryReports);

router.route('/compute-billing-history-successful-reports')
    .get(connection.connect, controller.computeBillingHistorySuccessfulReports);

router.route('/compute-charge-detail-reports')
    .get(connection.connect, controller.computeChargeDetailsReports);

router.route('/compute-charge-detail-source-wise-reports')
    .get(connection.connect, controller.computeChargeDetailsSourceWiseReports);

router.route('/compute-affiliate-reports')
    .get(connection.connect, controller.computeAffiliateReports);

router.route('/compute-affiliate-mids-from-subscriptions-reports')
    .get(connection.connect, controller.computeAffiliateMidsFromSubscriptionsReports);

router.route('/compute-helogs-logger-reports')
    .get(connection.connect, controller.computeHelogsReports);

router.route('/compute-helogs-unique-success-logger-reports')
    .get(connection.connect, controller.computeHelogsUniqueSuccessReports);

router.route('/compute-page-views-logger-reports')
    .get(connection.connect, controller.computeLogsPageViewReports);

router.route('/compute-subscribe-clicks-logger-reports')
    .get(connection.connect, controller.computeLogsSubscribeClicksReports);

router.route('/compute-subscriber-subscriptions-reports')
    .get(connection.connect, controller.computeSubscriberSubscriptionsReports);

router.route('/compute-subscriber-transaction-reports')
    .get(connection.connect, controller.computeSubscriberTransactionsReports);

router.route('/compute-transactions-avg-reports')
    .get(connection.connect, controller.promiseBasedComputeTransactionsAvgReports);

router.route('/compute-transactions-avg-per-customer-reports')
    .get(connection.connect, controller.promiseBasedComputeTransactionsAvgPerCustomerReports);

router.route('/compute-churn-reports')
    .get(connection.connect, controller.computeChurnReports);

router.route('/compute-request-count-reports')
    .get(connection.connect, controller.computeRequestCountReports);

router.route('/compute-daily-base-charge-reports')
    .get(connection.connect, controller.computeDailyBaseChargeReports);

router.route('/compute-charge-affiliate-wise-reports')
    .get(connection.connect, controller.computeChargeDetailsAffiliateWiseReports);

router.route('/compute-charge-tp-affiliate-wise-reports')
    .get(connection.connect, controller.computeChargeDetailsTPAffiliateWiseReports);


// Controller method for paying user reports - section START
router.route('/compute-new-paying-user-revenue-reports')
    .get(connection.connect, controller.computeNewPayingUserRevenueReports);

router.route('/compute-new-paying-users-reports')
    .get(connection.connect, controller.computeNewPayingUsersReports);

router.route('/compute-total-paying-users-reports')
    .get(connection.connect, controller.computeTotalPayingUsersReports);

router.route('/compute-paying-user-sessions-reports')
    .get(connection.connect, controller.computePayingUserSessionsReports);

router.route('/compute-paying-user-watch-time-reports')
    .get(connection.connect, controller.computePayingUserWatchTimeReports);

router.route('/compute-paying-user-engagement-reports')
    .get(connection.connect, controller.computePayingUserEngagementReports);
// Controller method for paying user reports - section END


router.route('/cron-compute-daily-data-reports')
    .get(connection.connect, controller.cronComputeDailyDataReports); //**

router.route('/cron-compute-monthly-data-reports')
    .get(connection.connect, controller.cronComputeMonthlyDataReports); //**

module.exports = router;
