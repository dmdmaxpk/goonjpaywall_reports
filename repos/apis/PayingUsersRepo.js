const mongoose = require('mongoose');
const PayingUser = mongoose.model('PayingUser');

getReportByDateString = async (dateString) => {
    console.log('getReportByDateString => dateString: ', dateString);
    return await PayingUser.find({"date": dateString});
};

createReport = async (data) => {
    let payingUser = new PayingUser(data);
    return await payingUser.save();
};

updateReport = async (data, id) => {
    return await PayingUser.updateOne({ '_id': id }, data);
};

generateReportsData = async (params) => {
    let fromDate  = new Date(params.from_date).setHours(0, 0, 0);
    let toDate  = new Date(params.to_date);
    toDate.setHours(23, 59, 59);

    console.log('generateReportsData: ', new Date(fromDate), new Date(toDate));
    return await PayingUser.find( { $and:[{date:{$gte: fromDate}}, {date:{$lt: toDate}}] }).sort({date: 1});
};

module.exports = {
    generateReportsData: generateReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}