const reportModel = require('../models/reportsYearModel');

const getReport = async (req, res) => {
    try {
        const year = req.body.year;
        const plant = req.body.plant;

        if (!plant) {
            return res.status(400).send("Plant is required");
        }

        const data = await reportModel.getReportData(year, plant);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    getReport
};
