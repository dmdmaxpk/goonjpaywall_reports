const container = require("../../configurations/container");
const reportsRepo = require('../../repos/ReportsRepo');

const transactionsRepo = container.resolve('transactionsRepo');
const  _ = require('lodash');

computeTransactionsAvgReports = async(req, res) => {
    console.log('computeTransactionsAvgReports');

    let fromDate, toDate, day, month, transactionAvg = [];
    reportsRepo.checkLastDocument().then(function (result) {
        console.log('result: ', result.length);

        day = req.day ? req.day : 1;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : 9;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        console.log('day : ', day, req.day);
        console.log('month : ', month, req.month);

        fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
        toDate  = _.clone(fromDate);
        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);

        console.log('computeTransactionsAvgReports: ', fromDate, toDate);
        transactionsRepo.getTransactionsAvgByDateRange(req, fromDate, toDate).then(function (transaction) {
            console.log('transaction: ', transaction.length);

            if (transaction.length > 0){
                transactionAvg = computeTransactionAvgData(transaction, fromDate);

                console.log('transactionAvg.length : ', transactionAvg.length, transactionAvg);
                insertNewRecord(transactionAvg, new Date(setDate(fromDate, 0, 0, 0, 0)));

                req.day = Number(req.day) + 1;
                console.log('getChargeDetailsByDateRange -> day : ', day, req.day, getDaysInMonth(month));

                if (req.day <= getDaysInMonth(month))
                    computeTransactionsAvgReports(req, res);
                else{
                    req.month = Number(req.month) + 1;
                    console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());

                    if (req.month <= new Date().getMonth())
                        computeTransactionsAvgReports(req, res);
                }
            }
        });
    });
};

function computeTransactionAvgData(transactions, fromDate) {

    let transaction, totalSubscribers = 0, totalTransactions = 0, totalPrice = 0, transactionList = [];

    let transactionObj = {avg_transactions: 0, avg_value: 0};
    for (let k=0; k < transactions.length; k++) {
        transaction = transactions[k];

        totalSubscribers = totalSubscribers + 1;
        totalTransactions = totalTransactions + transaction.size;
        totalPrice = transactions.reduce((a, b) => a + (b['price'] || 0), 0);
    }

    // Add Timestemps

    transactionObj.avg_value = ( totalPrice > 0  && totalTransactions> 0 )? totalTransactions / totalPrice : 0;
    transactionObj.avg_transactions = ( totalSubscribers > 0 && totalTransactions> 0 )? totalTransactions / totalSubscribers : 0;
    transactionObj.added_dtm = fromDate;
    transactionObj.added_dtm_hours = setDate(new Date(fromDate), null, 0, 0, 0);
    transactionList.push(transactionObj);

    return transactionList;
}

function insertNewRecord(transactionAvg, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('getReportByDateString - result : ', transactionAvg);
        if (result.length > 0) {
            result = result[0];
            result.transactions.avg = transactionAvg;

            reportsRepo.updateReport(result, result._id);
        }
        else{
            let transactions = {};
            transactions.avg = transactionAvg;
            reportsRepo.createReport({transactions: transactions, date: dateString});
        }
    });
}

function setDate(date, h=null,m, s, mi){
    if (h !== null)
        date.setHours(h);

    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}
function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    computeTransactionsAvgReports: computeTransactionsAvgReports,
};