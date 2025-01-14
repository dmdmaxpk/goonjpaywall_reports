const container = require("../configurations/container");
const reportsValidator = container.resolve("reportsValidator");
const reportsApiService = require('../services/apis/ReportsApiService');

exports.getReports = async (req,res) => {
    try {
        let response = await reportsValidator.validateParams(req.query, res);
        if (response.status){
            if (req.query.type === 'ccd_api_data')
                return await reportsApiService.generateReportsData(req, res);
            else
                res.send( await reportsApiService.generateReportsData(req, res));
        }
        else
            res.send({ 'status': response.status, 'message': response.reasons });
    }catch (e) {
        res.send({ 'status': false, 'message': e.message });
    }
};
