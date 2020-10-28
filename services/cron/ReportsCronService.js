const UserService = require('./compute/UserService');
const SubscriberService = require('./compute/SubscriberService');
const SubscriptionService = require('./compute/SubscriptionService');
const BillingHistoryService = require('./compute/BillingHistoryService');
const CallbackSendService = require('./compute/CallbackSendService');
const RevenueNetAdditionService = require('./compute/RevenueNetAdditionService');
const SubscriptionBillingHistoryService = require('./compute/SubscriptionBillingHistoryService');
const TransactionsBillingHistoryService = require('./compute/TransactionsBillingHistoryService');
const SubscriberSubscriptionsReports = require('./compute/SubscriberSubscriptionsReports');
const SubscriberTransactionsReports = require('./compute/SubscriberTransactionsReports');
const AffiliateSubscriptionsService = require('./compute/AffiliateDataFromSubscriptionsService');

const HelogsService = require('./compute/HelogsService');
const LogsService = require('./compute/LogsService');
const helper = require('../../helper/helper');
const connection = require('../../middlewares/connection');

cronComputeDailyDataReports = async (req, res) => {
    console.log('cronComputeDailyDataReports');

    // compute Users report data
    helper.threeLinesConsoleLog('UserService - promiseBasedComputeUserReports');
    await UserService.promiseBasedComputeUserReports(req,res);

    // compute Subscribers report Data
    helper.threeLinesConsoleLog('SubscriberService - promiseBasedComputeSubscriberReports');
    await SubscriberService.promiseBasedComputeSubscriberReports(req,res);

    // compute Subscriptions report Data
    helper.threeLinesConsoleLog('SubscriptionService - promiseBasedComputeSubscriptionReports');
    await SubscriptionService.promiseBasedComputeSubscriptionReports(req,res);

    // compute Callback report Data
    helper.threeLinesConsoleLog('CallbackSendService - promiseBasedComputeCallbackSendReports');
    await CallbackSendService.promiseBasedComputeCallbackSendReports(req,res);

    // compute Charge Details report Data
    helper.threeLinesConsoleLog('SubscriptionBillingHistoryService - promiseBasedComputeChargeDetailsReports');
    await SubscriptionBillingHistoryService.promiseBasedComputeChargeDetailsReports(req,res);

    // compute Net Addition report Data
    helper.threeLinesConsoleLog('RevenueNetAdditionService - promiseBasedComputeRevenueNetAdditionReports');
    await RevenueNetAdditionService.promiseBasedComputeRevenueNetAdditionReports(req,res);

    // compute Affiliate - Affiliate Mids report Data
    helper.threeLinesConsoleLog('AffiliateSubscriptionsService - promiseBasedComputeAffiliateMidsFromSubscriptionsReports');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateMidsFromSubscriptionsReports(req,res);

    // compute Affiliate - Affiliate report Data
    helper.threeLinesConsoleLog('AffiliateSubscriptionsService - promiseBasedComputeAffiliateReports');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateReports(req,res);

    // compute Affiliate - Helogs report Data
    // First - create/update connections with logger database
    helper.sixLinesConsoleLog('Database - Connection ( logger )');
    await connection.updateConnection(req, res, null, 'logger');

    helper.threeLinesConsoleLog('HelogsService - promiseBasedComputeHelogsReports');
    await HelogsService.promiseBasedComputeHelogsReports(req,res);

    // compute Affiliate - Helogs Unique Access report Data
    helper.threeLinesConsoleLog('HelogsService - promiseBasedComputeHelogsUniqueSuccessReports');
    await HelogsService.promiseBasedComputeHelogsUniqueSuccessReports(req,res);

    // compute Affiliate - Page View Data
    helper.threeLinesConsoleLog('LogsService - promiseBasedComputeLogsPageViewReports');
    await LogsService.promiseBasedComputeLogsPageViewReports(req,res);

    // compute Affiliate - Subscribe Clicks Data
    helper.threeLinesConsoleLog('LogsService - promiseBasedComputeLogsSubscribeClicksReports');
    await LogsService.promiseBasedComputeLogsSubscribeClicksReports(req,res);

    // compute Affiliate - Affiliate report Data
    // First - create/update connections with goonjpaywall database
    helper.sixLinesConsoleLog('Database - Connection ( goonjpaywall )');
    await connection.updateConnection(req, res, null, 'goonjpaywall');

    helper.threeLinesConsoleLog('BillingHistoryService - promiseBasedComputeBillingHistoryReports');
    await BillingHistoryService.promiseBasedComputeBillingHistoryReports(req,res);
    helper.oneLineConsoleLog('Cron - Yesterday Data is computed successfully.');
};

module.exports = {
    cronComputeDailyDataReports: cronComputeDailyDataReports,
};