const UserService = require('./compute/UserService');
const SubscriberService = require('./compute/SubscriberService');
const CallbackSendService = require('./compute/CallbackSendService');
const RevenueNetAdditionService = require('./compute/RevenueNetAdditionService');
const ChargeDetailsRevenueServices = require('./compute/ChargeDetailsRevenueServices');
const ChargeDetailsSourceWiseServices = require('./compute/ChargeDetailsSourceWiseServices');
const AffiliateSubscriptionsService = require('./compute/AffiliateDataFromSubscriptionsService');
const BillingHistorySuccessfulService = require('./compute/BillingHistorySuccessfulService');
const SubscriptionsSourceWiseSuccessfulService = require('./compute/SubscriptionsSourceWiseSuccessfulService');
const InSufficientAndExcessiveBillingService = require('./compute/InSufficientAndExcessiveBillingService');
const ChurnService = require('./compute/ChurnService');
const StatisticsService = require('./compute/StatisticsService');
const PayingUserService = require('./compute/PayingUserService');

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
    // await SubscriptionService.promiseBasedComputeDailySubscriptionReports(req,res);

    // compute Subscriptions report Data
    helper.threeLinesConsoleLog('BillingHistorySuccessfulService - promiseBasedComputeBillingHistorySuccessfulReports');
    await BillingHistorySuccessfulService.promiseBasedComputeBillingHistorySuccessfulReports(req,res);

    // compute Subscriptions report Data
    helper.threeLinesConsoleLog('SubscriptionsSourceWiseSuccessfulService - promiseBasedSubscriptionsSourceWiseSuccessfulReports');
    await SubscriptionsSourceWiseSuccessfulService.promiseBasedSubscriptionsSourceWiseSuccessfulReports(req,res);

    // compute Callback report Data
    helper.threeLinesConsoleLog('CallbackSendService - promiseBasedComputeCallbackSendReports');
    await CallbackSendService.promiseBasedComputeCallbackSendReports(req,res);

    // compute Charge Details report Data
    helper.threeLinesConsoleLog('ChargeDetailsRevenueServices - promiseBasedComputeChargeDetailsReports');
    await ChargeDetailsRevenueServices.promiseBasedComputeChargeDetailsReports(req,res);

    // compute Charge Details Source Wise report Data
    helper.threeLinesConsoleLog('ChargeDetailsSourceWiseServices - promiseBasedComputeChargeDetailsReports');
    await ChargeDetailsSourceWiseServices.promiseBasedComputeChargeDetailsReports(req,res); // *********

    // compute Net Addition report Data
    helper.threeLinesConsoleLog('RevenueNetAdditionService - promiseBasedComputeRevenueNetAdditionReports');
    await RevenueNetAdditionService.promiseBasedComputeRevenueNetAdditionReports(req,res);

    //**************************************//
    // compute Affiliate - Affiliate Mids report Data
    helper.threeLinesConsoleLog('AffiliateSubscriptionsService - promiseBasedComputeAffiliateMidsFromSubscriptionsReports');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateMidsFromSubscriptionsReports(req,res);
    //**************************************//

    // compute Insufficient Balance
    helper.threeLinesConsoleLog('InSufficientAndExcessiveBillingService - promiseBasedComputeInsufficientBalanceReports');
    await InSufficientAndExcessiveBillingService.promiseBasedComputeInsufficientBalanceReports(req,res);

    // compute Excessive Billing
    helper.threeLinesConsoleLog('InSufficientAndExcessiveBillingService - promiseBasedComputeExcessiveBillingReports');
    await InSufficientAndExcessiveBillingService.promiseBasedComputeExcessiveBillingReports(req,res);

    //**************************************//
    // compute Affiliate - Affiliate report Data
    helper.threeLinesConsoleLog('AffiliateSubscriptionsService - promiseBasedComputeAffiliateReports');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateReports(req,res);
    //**************************************//


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
    // await BillingHistoryService.promiseBasedComputeBillingHistoryReports(req,res);

    helper.threeLinesConsoleLog('ChurnService - promiseBasedComputeChurnReports');
    await ChurnService.promiseBasedComputeChurnReports(req,res);

    helper.threeLinesConsoleLog('StatisticsService - promiseBasedComputeRequestCountReports');
    await StatisticsService.promiseBasedComputeRequestCountReports(req,res);

    helper.threeLinesConsoleLog('StatisticsService - promiseBasedComputeDailyBaseChargeReports');
    await StatisticsService.promiseBasedComputeDailyBaseChargeReports(req,res);

    helper.threeLinesConsoleLog('ChargeDetailsRevenueServices - promiseBasedComputeChargeDetailsAffiliateWiseReports');
    await ChargeDetailsRevenueServices.promiseBasedComputeChargeDetailsAffiliateWiseReports(req,res);

    helper.threeLinesConsoleLog('ChargeDetailsRevenueServices - promiseBasedComputeChargeDetailsTPAffiliateWiseReports');
    await ChargeDetailsRevenueServices.promiseBasedComputeChargeDetailsTPAffiliateWiseReports(req,res);

    helper.oneLineConsoleLog('Cron - Yesterday Data is computed successfully.');
};

cronComputeMonthlyDataReports = async (req, res) => {
    console.log('cronComputeMonthlyDataReports');

    // First connect with goonjpaywall DB
    helper.sixLinesConsoleLog('Database - Connection ( goonjpaywall )');
    await connection.updateConnection(req, res, null, 'goonjpaywall');

    // compute Users report data
    // helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputeNewPayingUserRevenueReports');
    // await PayingUserService.promiseBasedComputeNewPayingUserRevenueReports(req,res);

    // helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputeNewPayingUsersReports');
    // await PayingUserService.promiseBasedComputeNewPayingUsersReports(req,res);

    helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputeTotalPayingUsersReports');
    await PayingUserService.promiseBasedComputeTotalPayingUsersReports(req,res);

    // helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputePayingUserSessionsReports');
    // await PayingUserService.promiseBasedComputePayingUserSessionsReports(req,res);
    
    // // compute msisdn wise data from streamlogs db
    // helper.sixLinesConsoleLog('Database - Connection ( streamlogs )');
    // await connection.updateConnection(req, res, null, 'streamlogs');

    // helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputePayingUserWatchTimeReports');
    // await PayingUserService.promiseBasedComputePayingUserWatchTimeReports(req,res);

    // // Connect with goonjpaywall db
    // helper.sixLinesConsoleLog('Database - Connection ( goonjpaywall )');
    // await connection.updateConnection(req, res, null, 'goonjpaywall');

    // helper.threeLinesConsoleLog('PayingUserService - promiseBasedComputePayingUserEngagementReports');
    // await PayingUserService.promiseBasedComputePayingUserEngagementReports(req,res);

    helper.oneLineConsoleLog('Cron - Last Month Data computation is done.');
};

module.exports = {
    cronComputeDailyDataReports: cronComputeDailyDataReports,
    cronComputeMonthlyDataReports: cronComputeMonthlyDataReports
};