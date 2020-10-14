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
    console.log('generateAffiliateReportsData: ', params.from_date, params.to_date);
    return await AffiliateReport.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] });
};

module.exports = {
    generateAffiliateReportsData: generateAffiliateReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}