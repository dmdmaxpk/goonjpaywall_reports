const config = require('../config');
const  _ = require('lodash');

//Helper class - define all basic functions
class Helper {

    constructor() {
        this.db = undefined;
    }

    static getDBInstance(){
        return this.db;
    }

    static setDBInstance(db){
        this.db = db;
    }

    static setDate(date, h=null,m, s, mi){
        if (h !== null)
            date.setHours(h);

        date.setMinutes(m);
        date.setSeconds(s);
        date.setMilliseconds(mi);
        return date;
    }
    static getDaysInMonth(month) {
        return new Date(2020, month, 0).getDate();
    }
    static getTodayDayNo() {
        return new Date().getDate();
    }
    static getTodayMonthNo() {
        return new Date().getMonth() + 1;
    }
    static splitHoursFromISODate(dateString){
        console.log('splitHoursFromISODate: ', dateString, new Date(dateString));
        dateString = new Date(dateString).getHours();
        console.log('dateString: ', dateString);
        if (dateString > 0)
            return false;
        else
            return true;
    }

    static computeNextDate(req, sDay, sMonth){

        let fromDate, toDate, day, month;

        day = req.day ? req.day : sDay;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
        toDate  = _.clone(fromDate);
        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeNextEightHoursDate(req, sDay, sMonth){

        let fromDate, toDate, day, month, fromHours, toHours;

        day = req.day ? req.day : sDay;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromHours = req.fromHours ? req.fromHours : 0;
        fromHours = fromHours > 9 ? fromHours : '0'+Number(fromHours);
        req.fromHours = fromHours;

        toHours = req.toHours ? req.toHours : 7;
        toHours = toHours > 9 ? toHours : '0'+Number(toHours);
        req.toHours = toHours;

        console.log('day : ', day, req.day);
        console.log('month : ', month, req.month);
        console.log('fromHours : ', fromHours, req.fromHours);
        console.log('toHours : ', toHours, req.toHours);

        fromDate  = new Date('2020-'+month+'-'+day+'T'+(fromHours)+':00:00.000Z');
        toDate  = _.clone(fromDate);
        toDate.setHours(toHours);
        toDate.setMinutes(59);
        toDate.setSeconds(59);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate, fromHours: fromHours, toHours: toHours};
    }

    static getChunks(totalCount){
        let chunks, lastChunkCount;

        chunks = totalCount / config.cron_db_query_data_limit;
        lastChunkCount = totalCount % config.cron_db_query_data_limit;

        return {chunks: chunks, lastChunkCount: lastChunkCount}
    }

    static async getTotalCount (req, from, to, collectionName) {
        return new Promise((resolve, reject) => {
            let dtm = (collectionName === 'billinghistories') ? 'billing_dtm' : 'added_dtm';
            let condition = [ {dtm:{$gte:new Date("2020-07-17T00:00:00.000Z")}}, {dtm:{$lte:new Date("2020-07-17T23:59:59.000Z")}} ];
            console.log('condition: ', condition);

            req.db.collection(collectionName, async function (err, collection) {
                if (!err) {

                    let documentCount = await collection.countDocuments({ $and: condition });

                    console.log('documentCount: ', documentCount);
                    resolve(documentCount);
                }
            });
        });
    }
}

module.exports = Helper;