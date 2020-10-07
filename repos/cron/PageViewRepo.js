const mongoose = require('mongoose');

var MongoClient = require('mongodb').MongoClient;
class PageViewRepo {

    async connect(){
        // Connection to Database
        return new Promise(async (resolve, reject) => {
            const uri = "mongodb://10.0.1.76:27017/logger?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";
            const client = new MongoClient(uri);
            try {
                await client.connect();
                await this.listDatabases(client);

            } catch (e) {
                console.error(e);
            }
            finally {
                await client.close();
            }


            resolve(1);
            await MongoClient.connect("mongodb://localhost:27017/", async function(err, client) {
                if(err){
                    reject(err);
                }else{
                    await resolve(client.db('logger'));
                }
            });
        });
    };


    async listDatabases(client){
        const databasesList = await client.db().admin().listDatabases();

        console.log("Databases:", databasesList);
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    };

    async getPageViewsByDateRange (from, to) {
        console.log('getPageViewsByDateRange: ', from, to);
        await this.connect();

        await this.connect().then(async function (db) {
            console.log('db: ', db);

            return new Promise(async (resolve, reject) => {

                await db.collection('logs', async function (err, collection) {
                    if(!err) {
                        console.log('collection: ', collection);

                        let result = await collection.aggregate([
                            {
                                $match:{
                                    method:'pageview'
                                }
                            },{
                                $limit: 10
                            }
                        ]);
                        console.log('result: ', result);
                        resolve(result);
                    }
                });
            });
        });
    }
}


module.exports = PageViewRepo;