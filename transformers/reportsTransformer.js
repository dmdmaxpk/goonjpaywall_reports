
class ReportsTransformer {

    //Transform Error catch Data
    transformErrorCatchData (status, message) {
        return {
            status: status,
            statusTest: (status ? 'Success' : 'Failed'),
            message: message
        };
    }

    //Transform The Data
    transformTheData (treeLevel, status, totalCount, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, message) {
        return {
            status: status,
            statusTest: (status ? 'Success' : 'Failed'),
            reportType: params.type,
            reportSubType: params.sub_type,
            groupBy: params.response_type,
            totalCount: totalCount,
            hourlyBasisTotalCount: hourlyBasisTotalCount,
            dayWiseTotalCount: dayWiseTotalCount,
            weekWiseTotalCount: weekWiseTotalCount,
            monthWiseTotalCount: monthWiseTotalCount,
            treeLevel: treeLevel,
            message: message,
        };
    }
}

module.exports = ReportsTransformer;
