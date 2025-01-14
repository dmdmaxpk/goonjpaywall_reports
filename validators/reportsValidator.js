class ReportsValidator{
    reset(){
        this.status = true;
        this.reasons = ''
    }
    validateParams(params){
        this.reset();
        console.log('params: ', params);
        switch(params.type.trim()) {
            case 'users':
                this.checkDateIsNull(params);
                this.checkSubTypeIsNull(params.sub_type, "Get Users", ['active_inactive', 'full_and_partial_charged', 'returning_user', 'accessing_service', 'user_billed']);

                if (params.sub_type === 'user_billed')
                    this.checkSubTypeIsNull(params.user_billed, "Get Billed User", ['package_wise', 'paywall_wise', 'operator_wise']);

                break;
            case 'tp_campaign':
                this.checkDateIsNull(params);
                this.checkSubTypeIsNull(params.sub_type, "Telenor Campaign", ['tp_fb_campaign']);

                break;
            case 'paying_user':
                this.checkDateIsNull(params);
                this.checkSubTypeIsNull(params.sub_type, "Paying Users", ['new', 'all', 'revenue', 'engagement', 'session_time', 'watch_time']);

                if (params.sub_type === 'new' || params.sub_type === 'all' || params.sub_type === 'revenue' || params.sub_type === 'engagement'){
                    let subType = params.sub_type;
                    this.checkSubTypeIsNull(params[subType], "Get Paying Users Report", ['source_wise']);
                }
                if (params.sub_type === 'session_time'){
                    let subType = params.sub_type;
                    this.checkSubTypeIsNull(params[subType], "Get Paying Users Session Time Report", ['one_three', 'four_ten', 'more_then_ten', 'and_all']);
                }
                if (params.sub_type === 'watch_time'){
                    let subType = params.sub_type;
                    this.checkSubTypeIsNull(params[subType], "Get Paying Users Watch Time Report", ['zero_fifteen', 'sixteen_thirty', 'thirtyOne_sixty', 'more_then_60', 'and_all']);
                }

                break;
            case 'subscribers':
                this.checkDateIsNull(params, "Subscribers");
                this.checkSubTypeIsNull(params.sub_type, "Subscribers", ['total', 'active_inactive', 'successful']);

                if (params.sub_type === 'successful')
                    this.checkSubTypeIsNull(params.successful, "Transacting Subscribers", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'price_wise']);

                break;
            case 'subscriptions':
                this.checkDateIsNull(params, "Get Subscribers");
                // this.checkSubTypeIsNull(params.sub_type, "Subscriptions", ['active_inactive', 'package_wise', 'source_wise', 'paywall_wise', 'operator_wise', 'price_wise']);
                this.checkSubTypeIsNull(params.sub_type, "Subscriptions", ['successful', 'trialed', 'graced', 'callback_send', 'active_inactive']);

                if (params.sub_type === 'successful')
                    this.checkSubTypeIsNull(params.successful, "Successful Subscriptions", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'price_wise', 'success_rate']);

                if (params.sub_type === 'trialed')
                    this.checkSubTypeIsNull(params.trialed, "Trialed Subscriptions", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'price_wise']);

                if (params.sub_type === 'graced')
                    this.checkSubTypeIsNull(params.graced, "Graced Subscriptions", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'price_wise']);

                if (params.sub_type === 'callback_send')
                    this.checkSubTypeIsNull(params.callback_send, "Callback Send Subscriptions", ['affiliate_mid', 'package_wise', 'paywall_wise', 'operator_wise']);

                break;
            case 'subscriptionsFromBilling':
                this.checkDateIsNull(params, "Get Subscriptions");
                this.checkSubTypeIsNull(params.sub_type, "Subscriptions", ['active_inactive', 'successful', 'graced', 'trialed', 'success_rate', 'callback_send']);

                if (params.sub_type === 'successful')
                    this.checkSubTypeIsNull(params.successful, "Get Subscriptions - Successful", ['package_wise', 'paywall_wise', 'operator_wise', 'source_wise']);

                if (params.sub_type === 'graced')
                    this.checkSubTypeIsNull(params.graced, "Get Subscriptions - Graced", ['package_wise', 'paywall_wise', 'operator_wise', 'source_wise']);

                if (params.sub_type === 'trialed')
                    this.checkSubTypeIsNull(params.trialed, "Get Subscriptions - Trialed", ['package_wise', 'paywall_wise', 'operator_wise', 'source_wise']);

                break;
            case 'success_rate':
                this.checkDateIsNull(params, "Success Rate");

                break;
            case 'revenue':
                this.checkDateIsNull(params, "Revenue");
                this.checkSubTypeIsNull(params.sub_type, "Revenue", ['package_wise', 'paywall_wise', 'operator_wise', 'deactivated', 'affiliate_wise', 'tp_affiliate_wise']);

                break;
            case 'charge_details':
                this.checkDateIsNull(params, "Charge Details");
                this.checkSubTypeIsNull(params.sub_type, "Charge Details", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'full_micro_total']);

                break;
            case 'net_additions':
                this.checkDateIsNull(params, "Net Additions");
                this.checkSubTypeIsNull(params.sub_type, "Net Additions", ['source_wise', 'package_wise', 'operator_wise', 'paywall_wise', 'net_additions_overall']);

                break;
            case 'transactions':
                this.checkDateIsNull(params, "Get Transactions");
                this.checkSubTypeIsNull(params.sub_type, "Transactions", ['avg_transactions', 'avg_transactions_per_customer', 'successful', 'trialed', 'graced']);

                if (params.sub_type === 'successful')
                    this.checkSubTypeIsNull(params.successful, "Successful Transactions", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'price_wise', 'success_failure_rate', 'avg_transaction', 'new_vs_returning']);

                if (params.sub_type === 'trialed')
                    this.checkSubTypeIsNull(params.trialed, "Trialed Transactions", ['source_wise', 'package_wise', 'paywall_wise', 'price_wise']);

                if (params.sub_type === 'graced')
                    this.checkSubTypeIsNull(params.graced, "Graced Transactions", ['source_wise', 'package_wise', 'paywall_wise', 'price_wise']);

                break;
            case 'transactionsOld':
                this.checkDateIsNull(params, "Get Transactions");
                this.checkSubTypeIsNull(params.sub_type, "Transactions", ['transactions', 'subscribers']);

                if (params.sub_type === 'transactions')
                    this.checkSubTypeIsNull(params.transactions, "Transactions", ['avg_transaction', 'new_vs_returning', 'success_failure_rate', 'package_wise', 'paywall_wise',
                        'operator_wise', 'billing_status_wise', 'price_wise']);
                else if (params.sub_type === 'subscribers')
                    this.checkSubTypeIsNull(params.subscribers, "Transacting Subscribers", ['source_wise', 'package_wise', 'paywall_wise', 'operator_wise', 'net_total']);

                break;
            case 'trial':
                this.checkDateIsNull(params, "Get Source Wise Trials");
                this.checkSubTypeIsNull(params.sub_type, "Trails", ['source_wise']);

                break;
            case 'unsubscribe':
                this.checkDateIsNull(params, "Get Source Wise Un Subscriptions");
                this.checkSubTypeIsNull(params.sub_type, "Un-subscriptions", ['source_wise']);

                break;
            case 'affiliate':
                this.checkDateIsNull(params, "Generate Affiliate Reports");
                this.checkSubTypeIsNull(params.sub_type, "Affiliate", ['affiliate', 'subscriptions', 'helogs', 'unique_success_he', 'page_view', 'subscribe_click']);

                if (params.sub_type === 'subscriptions')
                    this.checkSubTypeIsNull(params.subscriptions, "Affiliate data from subscriptions", ['subscriptions_mid', 'affiliate_wise', 'status_wise', 'package_wise', 'source_wise']);

                break;
            case 'visitors':
                this.checkDateIsNull(params, "Get Visitors");
                this.checkSubTypeIsNull(params.sub_type, "Visitors", ['app', 'web']);

                break;
            case 'churn':
                this.checkDateIsNull(params);
                this.checkSubTypeIsNull(params.sub_type, "Get Churn", ['churn']);

                break;
            case 'others':
                this.checkDateIsNull(params, "Others");
                this.checkSubTypeIsNull(params.sub_type, "Others Statistics", ['daily_base', 'request_count', 'successful_charge', 'unsubscribed', 'insufficient_balance', 'excessive_billing']);

                break;
            case 'share_msisdn':
                this.checkDateIsNull(params, "Share MSISDN");
                this.checkSubTypeIsNull(params.sub_type, "Share MSISDN", ['unSubscribed', 'subscribed', 'deactivated', 'inactive', 'chargeFailed']);

                if (params.sub_type === 'inactive')
                    this.checkSubTypeIsNull(params.inactive, "Share MSISDN", ['open_web_or_app_once', 'not_open_web_or_app']);

                break;
            case 'uninstall':
                this.checkDateIsNull(params, "Check Uninstall");

                break;
            case 'ccd_api_data':
                this.checkCCDReportParams(params, "Customer Support Api Data");

                break;
            default:
                this.status = false; this.reasons = 'The Report Type is invalid.';
                break;
        }
        return {status: this.status, reasons: this.reasons};
    }

    checkDateIsNull(params){
        if (params.from_date === undefined) {
            this.status = false; this.reasons = 'The Start Date is not provided.';
        }
        if (params.to_date === undefined) {
            this.status = false; this.reasons = 'The End Date is not provided.';
        }

        return true;
    }
    checkCCDReportParams(params){
        if (params.month === undefined) {
            this.status = false; this.reasons = 'Please select the month.';
        }

        if (params.method === undefined) {
            this.status = false; this.reasons = 'Please select the method.';
        }

        return true;
    }
    checkDateIsNotArray(params, reportType){

        if (Array.isArray(params.from_date)) {
            if (params.from_date.length == 0){
                this.status = false; this.reasons = 'The Report "'+reportType+'", its Start Date is invalid.';
            }
        } else {
            this.status = false; this.reasons = 'The Report "'+reportType+'", its Start Date is invalid.';
        }

        if (Array.isArray(params.to_date)) {
            if (params.to_date.length == 0){
                this.status = false; this.reasons = 'The Report "'+reportType+'", its End Date is invalid.';
            }
        } else {
            this.status = false; this.reasons = 'The Report "'+reportType+'", its End Date is invalid.';
        }
    }
    checkSubTypeIsNull(subType, reportType, subTypes){
        if (!subTypes.includes(subType)) {
            this.status = false; this.reasons = 'The Report "'+reportType+'", its Sub Type is invalid.';
        }
        return true;
    }
    checkSubTypeIsNotArray(params, reportType){
        if (Array.isArray(params.sub_type)) {
            if (params.sub_type.length == 0){
                this.status = false; this.reasons = 'The Report "'+reportType+'", its Sub Type is invalid.';
            }
        } else {
            this.status = false; this.reasons = 'The Report "'+reportType+'", its Sub Type is invalid.';
        }
    }
}

module.exports = ReportsValidator;
