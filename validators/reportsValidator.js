
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
                this.checkSubTypeIsNull(params.sub_type, "Get Users", ['active_inactive', 'full_and_partial_charged', 'returning_user', 'accessing_service', 'unique_paying', 'user_billed']);

                if (params.sub_type === 'user_billed')
                    this.checkSubTypeIsNull(params.user_billed, "Get Billed User", ['package_wise', 'paywall_wise', 'operator_wise']);

                break;
            case 'subscribers':
                this.checkDateIsNull(params, "Subscribers");
                this.checkSubTypeIsNull(params.sub_type, "Subscribers", ['total', 'active_inactive']);

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
                this.checkSubTypeIsNull(params.sub_type, "Revenue", ['package_wise', 'paywall_wise', 'operator_wise', 'deactivated']);

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
                this.checkSubTypeIsNull(params.sub_type, "Transactions", ['successful', 'trialed', 'graced']);

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
            case 'avg_churn':
                this.checkDateIsNull(params);
                this.checkSubTypeIsNotArray(params, "Get Average Churn");

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
            default:
                this.status = false; this.reasons = 'The Report Type is invalid.';
                break;
        }
        let type = params.type ? params.type.trim() : '';
        console.log('type: ', type);

        console.log('response ', this.status, this.reasons);
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
