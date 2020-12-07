const mongoose = require('mongoose');
const Report = mongoose.model('Report');

getReportByDateString = async (dateString) => {
    console.log('getReportByDateString => dateString: ', dateString);
    return await Report.find({"date": dateString});
};

createReport = async (data) => {
    let report = new Report(data);
    return await report.save();
};

updateReport = async (data, id) => {
    return await Report.updateOne({ '_id': id }, data);
};

generateReportsData = async (params) => {
    console.log('generateReportsData: ', params.from_date, params.to_date);
    return await Report.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] });
};

generateReportsDataWithDates = async (dateArr) => {
    console.log('generateReportsDataWithDates: ', dateArr);
    return await Report.aggregate([
        { $match:{
                date: { $in: dateArr }
            }
        }
    ])
};

module.exports = {
    generateReportsData: generateReportsData,
    generateReportsDataWithDates: generateReportsDataWithDates,
    getReportByDateString: getReportByDateString,
    createReport: createReport,
    updateReport: updateReport
}