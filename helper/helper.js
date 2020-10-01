
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

    static getDaysInMonth(month) {
        return new Date(2020, month, 0).getDate();
    }
}

module.exports = Helper;