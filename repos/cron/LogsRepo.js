
class LogsRepo {
    async getHelogsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getHelogsByDateRange: ', from, to);
            req.db.collection('helogs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            mid: {$in: ["1", "1569", "aff3", "aff3a", "goonj", "gdn", "gdn2"]},
                            $and:[
                                {added_dtm:{$gte:new Date(from)}},
                                {added_dtm:{$lte:new Date(to)}}
                            ]
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
                    ]).toArray(function(err, items) {
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
}

module.exports = LogsRepo;