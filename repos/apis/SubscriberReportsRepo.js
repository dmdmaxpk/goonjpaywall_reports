const mongoose = require('mongoose');
const SubscriberReport = mongoose.model('SubscriberReport');

getReportByDateString = async (dateString) => {
    console.log('getReportByDateString => dateString: ', dateString);
    return await SubscriberReport.find({"date": dateString});
};

createReport = async (data) => {
    let report = new SubscriberReport(data);
    console.log('createReport: ', data);
    return await report.save();
};

updateReport = async (data, id) => {
    return await SubscriberReport.updateOne({ '_id': id }, data);
};

generateReportsData = async (params) => {
    console.log('generateReportsData: ', params.from_date, params.to_date);
    return await SubscriberReport.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] });
};

module.exports = {
    generateReportsData: generateReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}