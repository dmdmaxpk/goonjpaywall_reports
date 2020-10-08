const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');
const reportsTransformer = container.resolve('reportsTransformer');

// Import Compute Files to access its factory functions
const chargeDetailService = require("./compute/ChargeDetailService");
const netAdditionService = require("./compute/NetAdditionService");
const revenueService = require("./compute/RevenueService");
const subscriberService = require("./compute/SubscriberService");
const subscriptionService = require("./compute/SubscriptionService");
const transactionService = require("./compute/TransactionService");
const trialService = require("./compute/TrialService");
const usersService = require("./compute/UsersService");

const  _ = require('lodash');

generateReportsData = async (params,res) => {
    try {
        let rawDataSet = await reportsRepo.generateReportsData(params);
        if (params.type === 'users'){
            if (params.sub_type === 'active_inactive')
                return usersService.computeVerifiedUserReport(rawDataSet, params);
            else if (params.sub_type === 'accessing_service')
                return usersService.computeAccessingServiceUserReport(rawDataSet, params);
            else if (params.sub_type === 'unique_paying')
                return usersService.computeUniquePayingUserReport(rawDataSet, params);
            else if (params.sub_type === 'full_and_partial_charged')
                return usersService.computeFullPartialChargedUserReport(rawDataSet, params);
            else if (params.sub_type === 'returning_user')
                return usersService.computeReturningUserReport(rawDataSet, params);
            else if (params.sub_type === 'user_billed')
                if (params.user_billed === 'package_wise')
                    return usersService.computeUserBilledPackageWiseReport(rawDataSet, params);
                else if (params.user_billed === 'paywall_wise')
                    return usersService.computeUserBilledPaywallWiseReport(rawDataSet, params);
                else if (params.user_billed === 'operator_wise')
                    return usersService.computeUserBilledOperatorWiseReport(rawDataSet, params);
        }
        else if (params.type === 'subscribers'){
            if (params.sub_type === 'total')
                return subscriberService.computeTotalSubscribersReport(rawDataSet, params);
            else if (params.sub_type === 'active_inactive')
                return subscriberService.computeActiveSubscribersReport(rawDataSet, params);
        }
        else if (params.type === 'subscriptions'){
            if (params.sub_type === 'active_inactive')
                return subscriptionService.activeInactiveSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return subscriptionService.packageWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'source_wise')
                return subscriptionService.sourceWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return subscriptionService.paywallWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'affiliate_mid')
                return subscriptionService.affliateMidWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'callback_send')
                return subscriptionService.callbackSendSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'success_rate')
                return subscriptionService.successRateSubscriptionReport(rawDataSet, params);
        }
        else if (params.type === 'revenue'){
            if (params.sub_type === 'package_wise')
                return revenueService.computeRevenuePackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return revenueService.computeRevenuePaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return revenueService.computeRevenueOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'billing_status_wise')
                return revenueService.computeRevenueBillingStatusWiseReport(rawDataSet, params);
            else if (params.sub_type === 'net_revenue')
                return revenueService.computeRevenueNetReport(rawDataSet, params);
        }
        else if (params.type === 'trial') {
            if (params.sub_type === 'source_wise')
                return trialService.computeTrialSourceWiseReport(rawDataSet, params);
        }
        else if (params.type === 'unsubscribe') {
            if (params.sub_type === 'source_wise')
                return subscriptionService.computeUnSubscriptionsSourceWiseReport(rawDataSet, params);
        }
        else if (params.type === 'charge_details') {
            if (params.sub_type === 'source_wise')
                return chargeDetailService.computeChargeDetailsSourceWiseReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return chargeDetailService.computeChargeDetailsPackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return chargeDetailService.computeChargeDetailsPaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return chargeDetailService.computeChargeDetailsOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'full_micro_total')
                return chargeDetailService.computeFullAndMicroChargeDetailsReport(rawDataSet, params);
        }
        else if (params.type === 'net_additions') {
            if (params.sub_type === 'source_wise')
                return netAdditionService.computeNetAdditionsSourceWiseReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return netAdditionService.computeNetAdditionsPackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return netAdditionService.computeNetAdditionsOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return netAdditionService.computeNetAdditionsPaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'net_additions_overall')
                return netAdditionService.computeNetAdditionsReport(rawDataSet, params);
        }
        else if (params.type === 'transactions'){
            if (params.sub_type === 'transactions'){
                if (params.transactions === 'avg_transaction')
                    return transactionService.computeTransactionsAvgReport(rawDataSet, params);
                else if (params.transactions === 'success_failure_rate')
                    return transactionService.computeTransactionsRateReport(rawDataSet, params);
                else if (params.transactions === 'source_wise')
                    return transactionService.computeTransactionsSourceWiseReport(rawDataSet, params);
                else if(params.transactions === 'package_wise')
                    return transactionService.computeTransactionsPackageWiseReport(rawDataSet, params);
                else if(params.transactions === 'paywall_wise')
                    return transactionService.computeTransactionsPaywallWiseReport(rawDataSet, params);
                else if(params.transactions === 'operator_wise')
                    return transactionService.computeTransactionsOperatorWiseReport(rawDataSet, params);
                else if(params.transactions === 'price_wise')
                    return transactionService.computeTransactionsPriceWiseWiseReport(rawDataSet, params);
            }
            else if (params.sub_type === 'subscribers'){
                if (params.subscribers === 'source_wise')
                    return transactionService.computeTransactingSubscribersSourceWiseReport(rawDataSet, params);
                else if(params.subscribers === 'package_wise')
                    return transactionService.computeTransactingSubscribersPackageWiseReport(rawDataSet, params);
                else if(params.subscribers === 'paywall_wise')
                    return transactionService.computeTransactingSubscribersPaywallWiseReport(rawDataSet, params);
                else if(params.subscribers === 'operator_wise')
                    return transactionService.computeTransactingSubscribersOperatorWiseReport(rawDataSet, params);
                else if(params.transactions === 'price_wise')
                    return transactionService.computeTransactingSubscribersPriceWiseReport(rawDataSet, params);
            }
        }
    }catch (e) {
        return reportsTransformer.transformErrorCatchData(false, e.message);
    }
};

module.exports = {
    generateReportsData: generateReportsData,
};