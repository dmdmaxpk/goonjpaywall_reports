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
    console.log('generateReportsData: ', params.from_date, params.to_date);
    return await PayingUser.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] }).sort({date: 1});
};

module.exports = {
    generateReportsData: generateReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}