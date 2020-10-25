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


cronComputeReports = async(req, res) => {
    console.log('cronComputeReports');

    // compute Users report data
    await UserService.computeUserReports(req,res);
    console.log('UserService - computeUserReports **********************************************');

    // compute Subscribers report Data
    await helper.sleep(20000);
    console.log('SubscriberService - computeSubscriberReports **********************************************');
    await SubscriberService.computeSubscriberReports(req,res);

    // compute Subscriptions report Data
    await helper.sleep(20000);
    console.log('SubscriptionService - computeSubscriptionReports **********************************************');
    await SubscriptionService.computeSubscriptionReports(req,res);

    // compute Callback report Data
    await helper.sleep(20000);
    // await CallbackSendService.computeCallbackSendReports(req,res);

    // compute Charge Details report Data
    await helper.sleep(20000);
    // await SubscriptionBillingHistoryService.computeChargeDetailsReports(req,res);

    // compute Net Addition report Data
    await helper.sleep(20000);
    // await RevenueNetAdditionService.computeRevenueNetAdditionReports(req,res);

    // compute Affiliate - Helogs report Data
    await helper.sleep(20000);
    // await HelogsService.computeHelogsReports(req,res);

    // compute Affiliate - Helogs Unique Access report Data
    await helper.sleep(20000);
    // await HelogsService.computeHelogsUniqueSuccessReports(req,res);

    // compute Affiliate - Page View Data
    await helper.sleep(20000);
    // await LogsService.computeLogsPageViewReports(req,res);

    // compute Affiliate - Subscribe Clicks Data
    await helper.sleep(20000);
    // await LogsService.computeLogsSubscribeClicksReports(req,res);

    // compute Affiliate - Affiliate Mids report Data
    await helper.sleep(20000);
    // await AffiliateSubscriptionsService.computeAffiliateMidsFromSubscriptionsReports(req,res);

    // compute Affiliate - Affiliate report Data
    await helper.sleep(20000);
    // await AffiliateSubscriptionsService.computeAffiliateReports(req,res);

};


module.exports = {
    cronComputeReports: cronComputeReports
};