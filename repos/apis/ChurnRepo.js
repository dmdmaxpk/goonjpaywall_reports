const mongoose = require('mongoose');
const ChurnReport = mongoose.model('ChurnReport');

getChurnByDateString = async (dateString) => {
    console.log('getChurnByDateString => dateString: ', dateString);
    return await ChurnReport.find({"date": dateString});
};

createChrunReport = async (data) => {
    console.log('ChurnRep =======');

    let ChurnReport = new ChurnReport(data);
    return await ChurnReport.save();
};

updateChurnReport = async (data, id) => {
    return await ChurnReport.updateOne({ '_id': id }, data);
};

generateChurnReportsData = async (params) => {
    console.log('generateChurnReportsData: ', params.from_date, params.to_date);
    return await ChurnReport.find( { $and:[{date:{$gte:new Date(params.from_date)}}, {date:{$lte:new Date(params.to_date)}}] }).sort({date: 1});
};

module.exports = {
    generateChurnReportsData: generateChurnReportsData,
    getChurnByDateString: getChurnByDateString,
    createChrunReport: createChrunReport,
    updateChurnReport: updateChurnReport
}