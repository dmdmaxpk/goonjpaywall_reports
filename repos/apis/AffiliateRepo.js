const mongoose = require('mongoose');
const AffiliateReport = mongoose.model('AffiliateReport');

getReportByDateString = async (dateString) => {
    console.log('getReportByDateString => dateString: ', dateString);
    return await AffiliateReport.find({"date": dateString});
};

createReport = async (data) => {
    let report = new AffiliateReport(data);
    return await report.save();
};

updateReport = async (data, id) => {
    return await AffiliateReport.updateOne({ '_id': id }, data);
};

generateAffiliateReportsData = async (params) => {

    let fromDate  = new Date(params.from_date).setHours(0, 0, 0);
    let toDate  = new Date(params.to_date);
    toDate.setHours(23, 59, 59);

    console.log('generateAffiliateReportsData: ', new Date(fromDate), new Date(toDate));
    return await AffiliateReport.find( { $and:[{date:{$gte: fromDate}}, {date:{$lt: toDate}}] }).sort({date: 1});
};

module.exports = {
    generateAffiliateReportsData: generateAffiliateReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}