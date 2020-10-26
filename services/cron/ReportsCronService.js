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


cronComputeFullDataReports = async(req, res) => {
    console.log('cronComputeFullDataReports');

    // compute Users report data
    await UserService.computeUserReports(req,res);
    console.log('UserService - computeUserReports **********************************************');

    // compute Subscribers report Data
    await helper.sleep(1000 * 60 * 3);
    console.log('SubscriberService - computeSubscriberReports **********************************************');
    await SubscriberService.computeSubscriberReports(req,res);

    // compute Subscriptions report Data
    await helper.sleep(1000 * 60 * 3);
    console.log('SubscriptionService - computeSubscriptionReports **********************************************');
    await SubscriptionService.computeSubscriptionReports(req,res);

    // compute Callback report Data
    await helper.sleep(1000 * 60 * 4);
    console.log('CallbackSendService - computeCallbackSendReports **********************************************');
    await CallbackSendService.computeCallbackSendReports(req,res);

    // compute Charge Details report Data
    await helper.sleep(1000 * 60 * 20);
    console.log('SubscriptionBillingHistoryService - computeChargeDetailsReports **********************************************');
    await SubscriptionBillingHistoryService.computeChargeDetailsReports(req,res);

    // compute Net Addition report Data
    await helper.sleep(1000 * 60 * 20);
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await RevenueNetAdditionService.computeRevenueNetAdditionReports(req,res);

    // First - create/update connections with logger database
    console.log('connection - updateConnection - logger **********************************************');
    await connection.updateConnection(req, res, null, 'logger');

    // compute Affiliate - Helogs report Data
    await helper.sleep(1000 * 60 * 25);
    console.log('HelogsService - computeHelogsReports **********************************************');
    await HelogsService.computeHelogsReports(req,res);

    // compute Affiliate - Helogs Unique Access report Data
    await helper.sleep(1000 * 60 * 20);
    console.log('HelogsService - computeHelogsUniqueSuccessReports **********************************************');
    await HelogsService.computeHelogsUniqueSuccessReports(req,res);

    // compute Affiliate - Page View Data
    await helper.sleep(1000 * 60 * 20);
    console.log('LogsService - computeLogsPageViewReports **********************************************');
    await LogsService.computeLogsPageViewReports(req,res);

    // compute Affiliate - Subscribe Clicks Data
    await helper.sleep(1000 * 60 * 20);
    console.log('LogsService - computeLogsSubscribeClicksReports **********************************************');
    await LogsService.computeLogsSubscribeClicksReports(req,res);

    // compute Affiliate - Affiliate Mids report Data
    await helper.sleep(1000 * 60 * 20);
    console.log('AffiliateSubscriptionsService - computeAffiliateMidsFromSubscriptionsReports **********************************************');
    await AffiliateSubscriptionsService.computeAffiliateMidsFromSubscriptionsReports(req,res);

    // compute Affiliate - Affiliate report Data
    await helper.sleep(1000 * 60 * 30);
    console.log('AffiliateSubscriptionsService - computeAffiliateReports **********************************************');
    await AffiliateSubscriptionsService.computeAffiliateReports(req,res);

    // First - create/update connections with goonjpaywall database
    console.log('connection - updateConnection - goonjpaywall **********************************************');
    await connection.updateConnection(req, res, null, 'goonjpaywall');

    // compute Billing Histories - report Data
    await helper.sleep(1000 * 60 * 20);
    console.log('BillingHistoryService - computeBillingHistoryReports **********************************************');
    await BillingHistoryService.computeBillingHistoryReports(req,res);
};

cronComputeDailyDataReports = async (req, res) => {
    console.log('cronComputeDailyDataReports');

    // compute Users report data
    await UserService.promiseBasedComputeUserReports(req,res);
    console.log('UserService - computeUserReports **********************************************');

    // compute Subscribers report Data
    console.log('SubscriberService - computeSubscriberReports **********************************************');
    await SubscriberService.promiseBasedComputeSubscriberReports(req,res);

    // compute Subscriptions report Data
    console.log('SubscriptionService - computeSubscriptionReports **********************************************');
    await SubscriptionService.promiseBasedComputeSubscriptionReports(req,res);

    // compute Callback report Data
    console.log('CallbackSendService - computeCallbackSendReports **********************************************');
    await CallbackSendService.promiseBasedComputeCallbackSendReports(req,res);

    // compute Charge Details report Data
    console.log('SubscriptionBillingHistoryService - computeChargeDetailsReports **********************************************');
    await SubscriptionBillingHistoryService.promiseBasedComputeChargeDetailsReports(req,res);

    // compute Net Addition report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await RevenueNetAdditionService.promiseBasedComputeRevenueNetAdditionReports(req,res);

    // compute Affiliate - Helogs report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await HelogsService.promiseBasedComputeHelogsReports(req,res);

    // compute Affiliate - Helogs Unique Access report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await HelogsService.promiseBasedComputeHelogsUniqueSuccessReports(req,res);

    // compute Affiliate - Page View Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await LogsService.promiseBasedComputeLogsPageViewReports(req,res);

    // compute Affiliate - Subscribe Clicks Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await LogsService.promiseBasedComputeLogsSubscribeClicksReports(req,res);

    // compute Affiliate - Affiliate Mids report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateMidsFromSubscriptionsReports(req,res);

    // compute Affiliate - Affiliate report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await AffiliateSubscriptionsService.promiseBasedComputeAffiliateReports(req,res);

    // compute Affiliate - Affiliate report Data
    console.log('RevenueNetAdditionService - computeRevenueNetAdditionReports **********************************************');
    await BillingHistoryService.promiseBasedComputeBillingHistoryReports(req,res);
};

module.exports = {
    cronComputeFullDataReports: cronComputeFullDataReports,
    cronComputeDailyDataReports: cronComputeDailyDataReports,
};