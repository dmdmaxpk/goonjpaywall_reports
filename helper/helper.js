
//Helper class - define all basic functions
class Helper {

    constructor() {
        this.isConnected = undefined;
    }

    static paywallIsConnected(){
        console.log('paywallIsConnected - this.isConnected: ', this.isConnected);
        return this.isConnected;
    }

    static connectPaywall(){
        this.isConnected = true;
        console.log('connectPaywall - this.isConnected: ', this.isConnected);
    }

    static getCurrentDate() {
        let now = new Date();
        let strDateTime = [
            [now.getFullYear(),
                this.addZero(now.getMonth() + 1),
                this.addZero(now.getDate())].join("-"),
            [this.addZero(now.getHours()),
                this.addZero(now.getMinutes())].join(":")];
        return strDateTime;
    }

    static addZero(num) {
        return (num >= 0 && num < 10) ? "0" + num : num + "";
    }

}

module.exports = Helper;