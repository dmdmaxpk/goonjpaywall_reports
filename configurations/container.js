const awilix = require('awilix');
const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
});

// Repositories
const UserRepository = require('../repos/cron/UserRepo');
const BillingHistoryRepository = require('../repos/cron/BillingHistoryRepo');
const SubscriptionRepository = require('../repos/cron/SubscriptionRepo');
const LogsRepo = require('../repos/cron/LogsRepo');
const SubscriberRepository = require('../repos/cron/SubscriberRepo');
const TransactionsRepo = require('../repos/cron/TransactionsRepo');

//Validators
const ReportsValidator = require('../validators/reportsValidator');

//Transformers
const ReportsTransformer = require('../transformers/reportsTransformer');

container.register({

    // Repositories
    billingHistoryRepository: awilix.asClass(BillingHistoryRepository).singleton(),
    userRepository: awilix.asClass(UserRepository).singleton(),
    subscriptionRepository: awilix.asClass(SubscriptionRepository).singleton(),
    logsRepo: awilix.asClass(LogsRepo).singleton(),
    subscriberRepository: awilix.asClass(SubscriberRepository).singleton(),
    transactionsRepo: awilix.asClass(TransactionsRepo).singleton(),

    //Validators
    reportsValidator: awilix.asClass(ReportsValidator).singleton(),

    //Transformer
    reportsTransformer: awilix.asClass(ReportsTransformer).singleton(),
});

module.exports = container;  