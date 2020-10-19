
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
        console.log('dateString: ', dateString, typeof dateString);
        if (dateString > 0)
            return true;
        else
            return false
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
}

module.exports = Helper;