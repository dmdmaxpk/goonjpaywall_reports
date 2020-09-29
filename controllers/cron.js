const UserService = require('../services/cron/UserService');
const SubscriberService = require('../services/cron/SubscriberService');
const SubscriptionService = require('../services/cron/SubscriptionService');
const BillingHistoryService = require('../services/cron/BillingHistoryService');
const CallbackSendService = require('../services/cron/CallbackSendService');
const PageViewService = require('../services/cron/PageViewService');
const RevenueNetAdditionService = require('../services/cron/RevenueNetAdditionService');
const SubscriptionBillingHistoryService = require('../services/cron/SubscriptionBillingHistoryService');

exports.computeUserReports = async (req,res) =>  {
    await UserService.computeUserReports(req,res);
    res.send("computeUserReports - Executed\n");
};

exports.computeSubscriberReports = async (req,res) =>  {
    SubscriberService.computeSubscriberReports(req,res);
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

exports.computePageViewReports = async (req,res) =>  {
    PageViewService.computePageViewReports(req,res);
    res.send("computePageViewReports - Executed\n");
};

exports.computeChargeDetailsReports = async (req,res) =>  {
    SubscriptionBillingHistoryService.computeChargeDetailsReports(req,res);
    res.send("computeChargeDetailsReports - Executed\n");
};

exports.computeRevenueNetAdditionReports = async (req,res) =>  {
    RevenueNetAdditionService.computeRevenueNetAdditionReports(req,res);
    res.send("computeRevenueNetAdditionReports - Executed\n");
};
