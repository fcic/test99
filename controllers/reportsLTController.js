const reportModel = require('../models/reportsLifeTimeModel');

const getLifeTimeReport = async (req, res) => {
    const { plant, dateRange } = req.body;

    try {
        const data = await reportModel.getLifeTimeData(plant, dateRange);
        // res.json({
        //     data: data
        // });
        res.json(data);

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

module.exports = {
    getLifeTimeReport
};
