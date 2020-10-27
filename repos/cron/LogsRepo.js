
class LogsRepo {
    async getHelogsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getHelogsByDateRange: ', from, to);
            req.db.collection('helogs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            mid: {$in: ["1", "1569", "aff3", "aff3a", "goonj", "gdn", "gdn2"]},
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $project:{
                            source: "$source",
                            mid: "$mid",
                            service: "$service",
                            added_dtm: "$added_dtm"
                        }},
                        { $project:{
                            source: "$source",
                            mid: "$mid",
                            service: "$service",
                            day: { "$dayOfMonth" : "$added_dtm"},
                            month: { "$month" : "$added_dtm" },
                            year:{ "$year": "$added_dtm" }
                        }},
                        { $project:{
                            added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            service: "$service",
                            source: "$source",
                            mid: "$mid"
                        }},
                        { $group:{
                            _id: {added_dtm: "$added_dtm", service: "$service", source: "$source", mid: "$mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            helogs: { $push:  { service: "$_id.service", source: "$_id.source", mid: "$_id.mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: "$_id.added_dtm",
                            helogs: "$helogs"
                        }}
                    ], {allowDiskUse: true}).toArray(function(err, items) {
                        if(err){
                            console.log('getHelogsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getHelogsUniqueSuccessByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getHelogsUniqueSuccessByDateRange: ', from, to);
            req.db.collection('helogs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            "req_body.response_msisdn":{$ne:null},
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $project:{
                            mid: "$mid",
                            msisdn: "$req_body.response_msisdn",
                            added_dtm: "$added_dtm"
                        }},
                        { $project:{
                            mid: "$mid",
                            msisdn: "$msisdn",
                            day: { "$dayOfMonth" : "$added_dtm"},
                            month: { "$month" : "$added_dtm" },
                            year:{ "$year": "$added_dtm" }
                        }},
                        { $project:{
                            added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            mid: "$mid",
                            msisdn: "$msisdn"
                        }},
                        { $group:{
                            _id: {added_dtm: "$added_dtm", msisdn: "$msisdn"}, mid: {$first: "$mid"}
                        }},
                        { $group:{
                            _id:  {added_dtm: "$_id.added_dtm", mid: "$mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            helogs: { $push:  { mid: "$_id.mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: "$_id.added_dtm",
                            helogs: "$helogs"
                        }}
                    ], {allowDiskUse: true}).toArray(function(err, items) {
                        if(err){
                            console.log('getHelogsUniqueSuccessByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getLogsPageViewByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getLogsPageViewByDateRange: ', from, to);
            req.db.collection('logs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            "method": "pageview",
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $project:{
                            mid: "$req_body.mid",
                            msisdn: "$req_body.msisdn",
                            added_dtm: "$added_dtm"
                        }},
                        { $project:{
                            mid: "$mid",
                            msisdn: "$msisdn",
                            day: { "$dayOfMonth" : "$added_dtm"},
                            month: { "$month" : "$added_dtm" },
                            year:{ "$year": "$added_dtm" }
                        }},
                        { $project:{
                            added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            mid: "$mid",
                            msisdn: "$msisdn"
                        }},
                        { $group:{
                            _id: {added_dtm: "$added_dtm", msisdn: "$msisdn"}, mid: {$first: "$mid"}
                        }},
                        { $group:{
                            _id:  {added_dtm: "$_id.added_dtm", mid: "$mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            pageView: { $push:  { mid: "$_id.mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: "$_id.added_dtm",
                            pageView: "$pageView"
                        }}
                    ], {allowDiskUse: true}).toArray(function(err, items) {
                        if(err){
                            console.log('getLogsPageViewByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getLogsSubscribeClicksByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getLogsSubscribeClicksByDateRange: ', from, to);
            req.db.collection('logs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            "method": "subscribe",
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $project:{
                            mid: "$req_body.affiliate_mid",
                            added_dtm: "$added_dtm"
                        }},
                        { $project:{
                            mid: "$mid",
                            day: { "$dayOfMonth" : "$added_dtm"},
                            month: { "$month" : "$added_dtm" },
                            year:{ "$year": "$added_dtm" }
                        }},
                        { $project:{
                            added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            mid: "$mid"
                        }},
                        { $group:{
                            _id: {added_dtm: "$added_dtm", mid: "$mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            subsClicks: { $push:  { mid: "$_id.mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: "$_id.added_dtm",
                            subsClicks: "$subsClicks"
                        }}
                    ], {allowDiskUse: true}).toArray(function(err, items) {
                        if(err){
                            console.log('getLogsSubscribeClicksByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = LogsRepo;