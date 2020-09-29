
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
}

module.exports = Helper;