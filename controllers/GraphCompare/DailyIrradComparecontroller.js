const { getMonthlyIrradiance } = require('../../models/GraphCompare/DailyIrradcompare'); 


const getMonthlyIrradianceController = async (req, res) => {
    try {
        const { plant, month } = req.body;

        if (!plant || !month) {
            return res.status(400).json({
                error: "Missing required query parameters: 'plant' and 'month' (format: YYYY-MM)"
            });
        }

        const data = await getMonthlyIrradiance(plant, month);
        res.json(data);

    } catch (error) {
        console.error('Error in getMonthlyIrradianceController:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getMonthlyIrradianceController
};
