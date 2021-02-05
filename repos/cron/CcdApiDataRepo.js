
class CcdApiDataRepo {
    async getDataFromLogger (req, from, to) {
        return new Promise((resolve, reject) => {
            let query = req.query;
            let method = query.method;
            let msisdn = query.msisdn;
            let match = {
                method: method,
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }

            console.log('msisdn: ', msisdn);

            if (msisdn)
                match.req_body.msisdn = msisdn;

            console.log('match: ', match);
            console.log('date range: ', from, to);

            req.db.collection('logs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match: match},
                        {$project: {
                                _id:"$_id",
                                res_body:"$res_body",
                                req_body:"$req_body",
                                added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } },
                            }
                        },
                        { $limit: 3 }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getDataFromLogger - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = CcdApiDataRepo;





























