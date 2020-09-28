const awilix = require('awilix');
const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
});

// Repositories
const UserRepository = require('../repos/UserRepo');
const BillingHistoryRepository = require('../repos/BillingHistoryRepo');
const SubscriptionRepository = require('../repos/SubscriptionRepo');
const PageViewRepo = require('../repos/PageViewRepo');
const SubscriberRepository = require('../repos/SubscriberRepo');

//Validators
const ReportsValidator = require('../validators/reportsValidator');

//Transformers
const ReportsTransformer = require('../transformers/reportsTransformer');

container.register({

    // Repositories
    billingHistoryRepository: awilix.asClass(BillingHistoryRepository).singleton(),
    userRepository: awilix.asClass(UserRepository).singleton(),
    subscriptionRepository: awilix.asClass(SubscriptionRepository).singleton(),
    pageViewRepo: awilix.asClass(PageViewRepo).singleton(),
    subscriberRepository: awilix.asClass(SubscriberRepository).singleton(),

    //Validators
    reportsValidator: awilix.asClass(ReportsValidator).singleton(),

    //Transformer
    reportsTransformer: awilix.asClass(ReportsTransformer).singleton(),
});

module.exports = container;  