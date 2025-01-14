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

const ChurnService = require('../services/cron/compute/ChurnService');
const StatisticsService = require('../services/cron/compute/StatisticsService');
const PayingUserService = require('../services/cron/compute/PayingUserService');

const ReportsCronService = require('../services/cron/ReportsCronService');

exports.computeUserReports = async (req,res) =>  {
    UserService.computeUserReports(req,res);
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
    InSufficientAndExcessiveBillingService.computeExcessiveBillingReports(req,res);
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

exports.computeChurnReports = async (req,res) =>  {
    ChurnService.computeChurnReports(req,res);
    res.send("computeChurnReports - Executed\n");
};

exports.computeRequestCountReports = async (req,res) =>  {
    StatisticsService.computeRequestCountReports(req,res);
    res.send("computeRequestCountReports - Executed\n");
};

exports.computeDailyBaseChargeReports = async (req,res) =>  {
    StatisticsService.computeDailyBaseChargeReports(req,res);
    res.send("computeDailyBaseChargeReports - Executed\n");
};

exports.computeChargeDetailsAffiliateWiseReports = async (req,res) =>  {
    ChargeDetailsRevenueServices.computeChargeDetailsAffiliateWiseReports(req,res);
    res.send("computeChargeDetailsAffiliateWiseReports - Executed\n");
};

exports.computeChargeDetailsTPAffiliateWiseReports = async (req,res) =>  {
    ChargeDetailsRevenueServices.computeChargeDetailsTPAffiliateWiseReports(req,res);
    res.send("computeChargeDetailsTPAffiliateWiseReports - Executed\n");
};


// Paying user new reports - monthly reports - section START
exports.computeNewPayingUserRevenueReports = async (req,res) =>  {
    PayingUserService.computeNewPayingUserRevenueReports(req,res);
    res.send("computeNewPayingUserRevenueReports - Executed\n");
};

exports.computeNewPayingUsersReports = async (req,res) =>  {
    PayingUserService.computeNewPayingUsersReports(req,res);
    res.send("computeNewPayingUsersReports - Executed\n");
};

exports.computeTotalPayingUsersReports = async (req,res) =>  {
    PayingUserService.computeTotalPayingUsersReports(req,res);
    res.send("computeTotalPayingUsersReports - Executed\n");
};

exports.computePayingUserSessionsReports = async (req,res) =>  {
    PayingUserService.computePayingUserSessionsReports(req,res);
    res.send("computePayingUserSessionsReports - Executed\n");
};

exports.computePayingUserWatchTimeReports = async (req,res) =>  {
    PayingUserService.computePayingUserWatchTimeReports(req,res);
    res.send("computePayingUserWatchTimeReports - Executed\n");
};

exports.computePayingUserEngagementReports = async (req,res) =>  {
    PayingUserService.computePayingUserEngagementReports(req,res);
    res.send("computePayingUserEngagementReports - Executed\n");
};
// Paying user new reports - monthly reports - section END


exports.cronComputeDailyDataReports = async (req,res) =>  {
    ReportsCronService.cronComputeDailyDataReports(req,res);
    res.send("cronComputeDailyDataReports - in progress\n");
};
exports.cronComputeMonthlyDataReports = async (req,res) =>  {
    ReportsCronService.cronComputeMonthlyDataReports(req,res);
    res.send("cronComputeMonthlyDataReports - in progress\n");
};
