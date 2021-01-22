const UserService = require('../services/cron/compute/UserService');
const SubscriberService = require('../services/cron/compute/SubscriberService');
const SubscriptionService = require('../services/cron/compute/SubscriptionsService');
const SubscriptionFromBillingService = require('../services/cron/compute/SubscriptionFromBillingService');
const BillingHistoryService = require('../services/cron/compute/BillingHistoryService');
const CallbackSendService = require('../services/cron/compute/CallbackSendService');
const RevenueNetAdditionService = require('../services/cron/compute/RevenueNetAdditionService');
const ChargeDetailsRevenueServices = require('../services/cron/compute/ChargeDetailsRevenueServices');
const ChargeDetailsSourceWiseServices = require('../services/cron/compute/ChargeDetailsSourceWiseServices');
const TransactionsAvgService = require('../services/cron/compute/TransactionsAvgService');
const TransactionsAvgPerCostumerService = require('../services/cron/compute/TransactionsAvgPerCostumerService');
const SubscriberSubscriptionsReports = require('../services/cron/compute/SubscriberSubscriptionsReports');
const SubscriberTransactionsReports = require('../services/cron/compute/SubscriberTransactionsReports');
const AffiliateSubscriptionsService = require('../services/cron/compute/AffiliateDataFromSubscriptionsService');
const InSufficientAndExcessiveBillingService = require('../services/cron/compute/InSufficientAndExcessiveBillingService');

const BillingHistorySuccessfulService = require('../services/cron/compute/BillingHistorySuccessfulService');
const SubscriptionsSourceWiseSuccessfulService = require('../services/cron/compute/SubscriptionsSourceWiseSuccessfulService');

const HelogsService = require('../services/cron/compute/HelogsService');
const LogsService = require('../services/cron/compute/LogsService');

const ReportsCronService = require('../services/cron/ReportsCronService');

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

exports.computeDailySubscriptionReports = async (req,res) =>  {
    SubscriptionService.computeDailySubscriptionReports(req,res);
    res.send("computeDailySubscriptionReports - Executed\n");
};

exports.SubscriptionsSourceWiseSuccessfulService = async (req,res) =>  {
    SubscriptionsSourceWiseSuccessfulService.SubscriptionsSourceWiseSuccessfulService(req,res);
    res.send("SubscriptionsSourceWiseSuccessfulService - Executed\n");
};

exports.computeSubscriptionFromBillingService = async (req,res) =>  {
    SubscriptionFromBillingService.computeSubscriptionsFromBillingService(req,res);
    res.send("SubscriptionFromBillingService - Executed\n");
};

exports.computeBillingHistoryReports = async (req,res) =>  {
    BillingHistoryService.computeBillingHistoryReports(req,res);
    res.send("computeBillingHistoryReports - Executed\n");
};

exports.computeBillingHistorySuccessfulReports = async (req,res) =>  {
    BillingHistorySuccessfulService.computeBillingHistorySuccessfulReports(req,res);
    res.send("computeBillingHistorySuccessfulReports - Executed\n");
};

exports.computeCallbackSendReports = async (req,res) =>  {
    CallbackSendService.computeCallbackSendReports(req,res);
    res.send("computeCallbackSendReports - Executed\n");
};

exports.computeInsufficientBalanceReports = async (req,res) =>  {
    InSufficientAndExcessiveBillingService.computeInsufficientBalanceReports(req,res);
    res.send("computeInsufficientBalanceReports - Executed\n");
};

exports.computeExcessiveBillingReports = async (req,res) =>  {
    InSufficientAndExcessiveBillingService.promiseBasedComputeExcessiveBillingReports(req,res);
    res.send("computeExcessiveBillingReports - Executed\n");
};

exports.computeChargeDetailsReports = async (req,res) =>  {
    ChargeDetailsRevenueServices.computeChargeDetailsReports(req,res);
    res.send("computeChargeDetailsReports - Executed\n");
};
exports.computeChargeDetailsSourceWiseReports = async (req,res) =>  {
    ChargeDetailsSourceWiseServices.computeChargeDetailsSourceWiseReports(req,res);
    res.send("computeChargeDetailsSourceWiseReports - Executed\n");
};

exports.computeRevenueNetAdditionReports = async (req,res) =>  {
    RevenueNetAdditionService.computeRevenueNetAdditionReports(req,res);
    res.send("computeRevenueNetAdditionReports - Executed\n");
};

exports.promiseBasedComputeTransactionsAvgReports = async (req,res) =>  {
    TransactionsAvgService.promiseBasedComputeTransactionsAvgReports(req,res);
    res.send("promiseBasedComputeTransactionsAvgReports - Executed\n");
};

exports.promiseBasedComputeTransactionsAvgPerCustomerReports = async (req,res) =>  {
    TransactionsAvgPerCostumerService.promiseBasedComputeTransactionsAvgPerCustomerReports(req,res);
    res.send("promiseBasedComputeTransactionsAvgPerCustomerReports - Executed\n");
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

exports.computeAffiliateReports = async (req,res) =>  {
    AffiliateSubscriptionsService.computeAffiliateReports(req,res);
    res.send("computeAffiliateReports - Executed\n");
};

exports.computeAffiliateMidsFromSubscriptionsReports = async (req,res) =>  {
    AffiliateSubscriptionsService.computeAffiliateMidsFromSubscriptionsReports(req,res);
    res.send("computeAffiliateMidsFromSubscriptionsReports - Executed\n");
};

exports.cronComputeDailyDataReports = async (req,res) =>  {
    ReportsCronService.cronComputeDailyDataReports(req,res);
    res.send("cronComputeDailyDataReports - in progress\n");
};
