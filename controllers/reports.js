const container = require("../configurations/container");
const reportsValidator = container.resolve("reportsValidator");
const reportsService = require('../services/ReportsService');

exports.getReports = async (req,res) => {
    try {
        let response = await reportsValidator.validateParams(req.query, res);
        if (response.status)
            res.send( await reportsService.generateReportsData(req.query, res) );
        else
            res.send({ 'status': response.status, 'message': response.reasons });
    }catch (e) {
        res.send({ 'status': false, 'message': e.message });
    }
};
