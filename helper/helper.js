
//Helper class - define all basic functions
class Helper {

    constructor() {
        this.isConnected = undefined;
    }

    static paywallIsConnected(){
        return this.isConnected;
    }

    static connectPaywall(){
        this.isConnected = true;
    }

    static getDaysInMonth(month) {
        return new Date(2020, month, 0).getDate();
    }
}

module.exports = Helper;