const UserService = require('../services/cron/UserService');
const SubscriberService = require('../services/cron/SubscriberService');
const SubscriptionService = require('../services/cron/SubscriptionService');
const BillingHistoryService = require('../services/cron/BillingHistoryService');
const CallbackSendService = require('../services/cron/CallbackSendService');
const RevenueNetAdditionService = require('../services/cron/RevenueNetAdditionService');
const SubscriptionBillingHistoryService = require('../services/cron/SubscriptionBillingHistoryService');
const TransactionsBillingHistoryService = require('../services/cron/TransactionsBillingHistoryService');
const SubscriberSubscriptionsReports = require('../services/cron/SubscriberSubscriptionsReports');
const SubscriberTransactionsReports = require('../services/cron/SubscriberTransactionsReports');
const AffiliateSubscriptionsService = require('../services/cron/AffiliateDataFromSubscriptionsService');

const HelogsService = require('../services/cron/HelogsService');
const LogsService = require('../services/cron/LogsService');

exports.computeUserReports = async (req,res) =>  {
    await UserService.computeUserReports(req,res);
    res.send("computeUserReports - Executed\n");
};

exports.computeSubscriberReports = async (req,res) =>  {
    SubscriberService.computeSubscriberReports(req,res);
    res.send("computeSubscriberReports - Executed\n");
};

exports.computeSubscriberSubscriptionsReports = async (req,res) =>  {
    SubscriberSubscriptionsReports.computeSubscriberSubscriptionsReports(req,res);
    res.send("computeSubscriberReports - Executed\n");
};

exports.computeSubscriberTransactionsReports = async (req,res) =>  {
    SubscriberTransactionsReports.computeSubscriberTransactionsReports(req,res);
    res.send("computeSubscriberReports - Executed\n");
};

exports.computeSubscriptionReports = async (req,res) =>  {
    SubscriptionService.computeSubscriptionReports(req,res);
    res.send("computeSubscriptionReports - Executed\n");
};

exports.computeBillingHistoryReports = async (req,res) =>  {
    BillingHistoryService.computeBillingHistoryReports(req,res);
    res.send("computeBillingHistoryReports - Executed\n");
};

exports.computeCallbackSendReports = async (req,res) =>  {
    CallbackSendService.computeCallbackSendReports(req,res);
    res.send("computeCallbackSendReports - Executed\n");
};

exports.computeHelogsReports = async (req,res) =>  {
    HelogsService.computeHelogsReports(req,res);
    res.send("computeHelogsReports - Executed\n");
};

exports.computeHelogsUniqueSuccessReports = async (req,res) =>  {
    HelogsService.computeHelogsUniqueSuccessReports(req,res);
    res.send("computeHelogsUniqueSuccessReports - Executed\n");
};

exports.computeLogsPageViewReports = async (req,res) =>  {
    LogsService.computeLogsPageViewReports(req,res);
    res.send("computeLogsPageViewReports - Executed\n");
};

exports.computeLogsSubscribeClicksReports = async (req,res) =>  {
    LogsService.computeLogsSubscribeClicksReports(req,res);
    res.send("computeLogsSubscribeClicksReports - Executed\n");
};

exports.computeTransactionsAvgReports = async (req,res) =>  {
    TransactionsBillingHistoryService.computeTransactionsAvgReports(req,res);
    res.send("computeTransactionsReports - Executed\n");
};

exports.computeChargeDetailsReports = async (req,res) =>  {
    SubscriptionBillingHistoryService.computeChargeDetailsReports(req,res);
    res.send("computeChargeDetailsReports - Executed\n");
};

exports.computeRevenueNetAdditionReports = async (req,res) =>  {
    RevenueNetAdditionService.computeRevenueNetAdditionReports(req,res);
    res.send("computeRevenueNetAdditionReports - Executed\n");
};

exports.computeAffiliateReports = async (req,res) =>  {
    AffiliateSubscriptionsService.computeAffiliateReports(req,res);
    res.send("computeAffiliateReports - Executed\n");
};

exports.computeAffiliateMidsFromSubscriptionsReports = async (req,res) =>  {
    AffiliateSubscriptionsService.computeAffiliateMidsFromSubscriptionsReports(req,res);
    res.send("computeAffiliateMidsFromSubscriptionsReports - Executed\n");
};
