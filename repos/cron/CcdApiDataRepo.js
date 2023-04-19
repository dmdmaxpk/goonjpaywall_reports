
class CcdApiDataRepo {
    async getDataFromLogger (req, from, to) {
        return new Promise((resolve, reject) => {
            let query = req.query;

            let match = {
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }
            if (query.msisdn)
                match['req_body.msisdn'] = query.msisdn;

            if (query.method !== 'both')
                match.method = query.method;

            console.log('match: ', match);
            req.db.collection('logs', function (err, collection) {
                if (!err) {
                    resolve([]);
                }

                collection.aggregate([
                    { $match: match},
                    {$project: {
                            _id:"$_id",
                            method:"$method",
                            res_body:"$res_body",
                            req_body:"$req_body",
                            added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } },
                        }
                    },
                ],{ allowDiskUse: true }).toArray(function(err, items) {
                    if(err){
                        console.log('getDataFromLogger - err: ', err.message);
                        resolve([]);
                    }
                    resolve(items);
                });

            });
        });
    }
}

module.exports = CcdApiDataRepo;





























