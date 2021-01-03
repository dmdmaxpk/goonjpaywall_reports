const config = require('../config');
const  _ = require('lodash');
const moment = require('moment');

//Helper class - define all basic functions
class Helper {

    constructor() {
        this.db = undefined;
    }

    static getDBInstance(){
        return this.db;
    }

    static async setDBInstance(db){
        this.db = db;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static sixLinesConsoleLog(message){
        return console.log('' +
            '                                                           ' + '\n' +
            '***********************************************************' + '\n' +
            '*******                                           *********' + '\n' +
            '*******     '+message+ '\n' +
            '*******                                           *********' + '\n' +
            '***********************************************************' + '\n' +
            '                       **************                      ' + '\n'
        ) ;
    }

    static threeLinesConsoleLog(message){
        return console.log('' +
            '                                                           ' + '\n' +
            '***********************************************************' + '\n' +
            '*******     '+message + '\n' +
            '***********************************************************' + '\n'
        ) ;
    }

    static oneLineConsoleLog(message){
        return console.log('' +
            '                                      ' + '\n' +
            '*******     '+message+'     **********' + '\n'
    ) ;
    }

    static checkDataExist(dataArr, date, type){
        let obj, index = -1;
        for(let i = 0; i < dataArr.length; i++) {
            obj = dataArr[i];
            // console.log('checkDataExist - ', new Date(obj[type]).getHours(), new Date(date).getHours());
            if(new Date(obj[type]).getHours() === new Date(date).getHours()) {
                index = i;
                break;
            }
        }

        return index;
    }

    static checkDataExist1(arrayData, date, type){
        arrayData.some(function(item){
            return new Date(item[type]).getHours() === new Date(date).getHours();
        });
    }

    static isToday(someDate) {
        someDate = new Date( someDate );
        someDate = new Date( someDate.setDate(someDate.getDate() + 1));
        someDate = new Date( this.setDateWithTimezone(someDate, 'in'));

        var today = new Date();
        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()
    }

    static setDate(date, h=null, m, s, mi){
        date = new Date(date);
        if (h !== null)
            date.setHours(h);

        date.setMinutes(m);
        date.setSeconds(s);
        date.setMilliseconds(mi);
        return date;
    }

    static getDaysInMonth(month) {
        return new Date(2021, month, 0).getDate();
    }

    static getTodayDayNo() {
        return new Date().getDate();
    }

    static getTodayMonthNo() {
        return new Date().getMonth() + 1;
    }

    static getDatesArr(from, to) {
        console.log('getDatesArr')

        from = moment(new Date(from)).date(1);
        to = moment(new Date(to)).date(1);
        let dates=[];
        for(let dt = new Date(from); dt <= to; dt.setDate(dt.getDate()+1)){
            console.log('in loop: ');

            if(dt.getDate() === 1){
                console.log('======', dt.getDate());
                dates.push(new ISODate(dt));
            }
        }
        console.log('dates: ', dates);

        return dates;
    }

    static splitHoursFromISODate(dateString){
        console.log('splitHoursFromISODate: ', new Date(dateString));
        dateString = new Date(dateString).getHours();
        console.log('dateString: ', dateString);

        if (dateString > 0)
            return false;
        else
            return true;
    }

    static setDateWithTimezone(date, mode){
        if (mode === 'out')
            date.setHours(date.getHours()+5);
        else
            date.setHours(date.getHours()-5);

        return date.toISOString();
    }

    static computeTodayDate(req){
        let date, fromDate, toDate, day, month;
        date = new Date();
        date.setDate(date.getDate() - 1);

        day =  date.getDate();
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month =  date.getMonth() + 1;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-'+day+'T00:00:00.000Z');
        fromDate = this.setDateWithTimezone(fromDate, 'in');
        console.log('computeTodayDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        toDate.setDate(toDate.getDate() + 1);
        toDate.setHours(23, 59, 59);
        toDate = this.setDateWithTimezone(toDate, 'in');
        console.log('computeTodayDate - toDate : ', toDate);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeTodayDateWithLocalTime(req){
        let date, fromDate, toDate, day, month;
        date = new Date();
        date.setDate(date.getDate() - 1);

        day =  date.getDate();
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month =  date.getMonth() + 1;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-'+day+'T00:00:00.000Z');
        console.log('computeTodayDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        toDate.setDate(toDate.getDate() + 1);
        console.log('computeTodayDate - toDate : ', toDate);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeTodayEightHoursDate(req){

        let fromDate, toDate, day, month, fromHours, toHours;

        fromDate  = new Date();
        fromDate.setHours(0, 0, 0);
        fromDate = this.setDateWithTimezone(fromDate, 'in');

        day = req.day ? req.day : fromDate.getDate();
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : fromDate.getMonth()+1;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromHours = req.fromHours ? req.fromHours : 0;
        fromHours = fromHours > 9 ? fromHours : '0'+Number(fromHours);
        req.fromHours = fromHours;

        toHours = req.toHours ? req.toHours : 7;
        toHours = toHours > 9 ? toHours : '0'+Number(toHours);
        req.toHours = toHours;

        toDate  = _.clone(fromDate);
        toDate.setHours(toHours, 59, 59);
        toDate = this.setDateWithTimezone(toDate, 'in');

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate, fromHours: fromHours, toHours: toHours};
    }

    static computeNextDate(req, sDay, sMonth){

        let fromDate, toDate, day, month;

        day = req.day ? req.day : sDay;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-'+day+'T00:00:00.000Z');
        fromDate = this.setDateWithTimezone(fromDate, 'in');
        console.log('computeNextDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        toDate.setDate(toDate.getDate() + 1);
        toDate.setHours(23, 59, 59);
        toDate = this.setDateWithTimezone(toDate, 'in');
        console.log('computeNextDate - toDate : ', toDate);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeNextDateWithLocalTime(req, sDay, sMonth){

        let fromDate, toDate, day, month;

        day = req.day ? req.day : sDay;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-'+day+'T00:00:00.000Z');
        console.log('computeNextDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        toDate.setDate(toDate.getDate() + 1);
        console.log('computeNextDate - toDate : ', toDate);

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeLastMonthDateWithLocalTime(req){

        let fromDate, toDate, month, daysInMonth;
        let date = new Date();
        let sMonth =  date.getMonth();

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-01T00:00:00.000Z');
        console.log('computeNextDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        daysInMonth = this.getDaysInMonth(month)
        toDate.setDate(toDate.getDate() + daysInMonth - 1);
        toDate.setHours(23, 59, 59);

        console.log('computeNextDate - toDate : ', toDate);

        return {req: req, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeNextMonthDateWithLocalTime(req, sMonth){

        let fromDate, toDate, month, daysInMonth;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-01T00:00:00.000Z');
        console.log('computeNextDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        daysInMonth = this.getDaysInMonth(month)
        toDate.setDate(toDate.getDate() + daysInMonth - 1);
        console.log('computeNextDate - toDate : ', toDate);

        return {req: req, month: month, fromDate: fromDate, toDate: toDate};
    }

    static computeNextWeekDateWithLocalTime(req, sDay, sMonth){

        let fromDate, toDate, fromDay, toDay, month, daysInMonth, dayAdd;

        fromDay = req.fromDay ? req.fromDay : sDay;
        fromDay = fromDay > 9 ? fromDay : '0'+Number(fromDay);
        req.fromDay = fromDay;

        month = req.month ? req.month : sMonth;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        fromDate  = new Date('2021-'+month+'-'+fromDay+'T00:00:00.000Z');
        console.log('computeNextDate - fromDate : ', fromDate);

        toDate  = new Date(_.clone(fromDate));
        if(fromDay === 28 ){
            daysInMonth = this.getDaysInMonth();
            dayAdd = daysInMonth - fromDay;
        }
        else
            dayAdd = 7;

        toDate.setDate(toDate.getDate() + dayAdd);
        console.log('computeNextDate - toDate : ', toDate, dayAdd);

        toDay = fromDay + dayAdd;
        toDay = toDay > 9 ? toDay : '0'+Number(toDay);
        req.toDay = toDay;
        return {req: req, fromDay: fromDay, toDay: toDay, month: month, fromDate: fromDate, toDate: toDate};
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

        fromDate  = new Date('2021-'+month+'-'+day+'T'+(fromHours)+':00:00.000Z');
        fromDate = this.setDateWithTimezone(fromDate, 'in');

        toDate  = new Date('2021-'+month+'-'+day+'T'+(toHours)+':59:59.000Z');
        toDate = this.setDateWithTimezone(toDate, 'in');

        return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate, fromHours: fromHours, toHours: toHours};
    }

    static getChunks(totalCount){
        let chunks = 1, lastChunkCount = 0;

        if (totalCount > config.cron_db_query_data_limit){
            chunks = Math.floor(totalCount / config.cron_db_query_data_limit) ;
            chunks = chunks > 0 ? chunks : 1;

            lastChunkCount = totalCount % config.cron_db_query_data_limit;
        }

        return {chunks: chunks, lastChunkCount: lastChunkCount}
    }

    static async getTotalCount (req, from, to, collectionName, query=null) {
        return await new Promise(async(resolve, reject) => {
            req.db.collection(collectionName, async function (err, collection){
                if (!err){
                    if (query === null) {
                        console.log('getTotalCount - if case');
                        try {
                            let condition;
                            if (collectionName === 'billinghistories')
                                condition = [ {billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}} ];
                            else
                                condition = [ {added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}} ];

                            req.db.collection(collectionName, async function (err, collection) {
                                if (!err)
                                    resolve(await collection.countDocuments({ $and: condition }));

                                resolve(0);
                            });
                        }catch (e) {
                            await resolve(0);
                        }
                    }
                    else{
                        console.log('getTotalCount - Else case');

                        try {
                            await collection.aggregate(query,{ allowDiskUse: true }).toArray(async function(err, count) {
                                if(err){
                                    console.error(collectionName, ' count query - err: ', err.message);
                                    await resolve(0);
                                }
                                (count.length > 0) ? await resolve(count[0].count) : await resolve(0);
                            });
                        }catch (e) {
                            await resolve(0);
                        }
                    }
                }
            });
        });
    }
}

module.exports = Helper;