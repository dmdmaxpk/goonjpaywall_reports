
class CcdApiDataRepo {
    async getDataFromLogger (req, from, to) {
        return new Promise((resolve, reject) => {
            let query = req.query;
            let match = {
                method: query.method,
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }

            console.log('msisdn: ', query.msisdn);

            if (query.msisdn){
                match['req_body.msisdn'] = query.msisdn;
                // match.req_body.msisdn = query.msisdn;
            }

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





























