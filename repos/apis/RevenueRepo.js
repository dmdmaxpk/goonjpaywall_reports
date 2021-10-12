const mongoose = require('mongoose');
const Revenue = mongoose.model('Revenue');

getReportByDateString = async (dateString) => {
    console.log('getReportByDateString => dateString: ', dateString);
    return await Revenue.find({"date": dateString});
};

createReport = async (data) => {
    let revenue = new Revenue(data);
    return await revenue.save();
};

updateReport = async (data, id) => {
    return await Revenue.updateOne({ '_id': id }, data);
};

generateRevenueReportsData = async (params) => {
    console.log('generateRevenueReportsData: ', params.from_date, params.to_date);
    return await Revenue.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] }).sort({date: 1});
};

module.exports = {
    generateRevenueReportsData: generateRevenueReportsData,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}