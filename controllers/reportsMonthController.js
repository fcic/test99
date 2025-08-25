const reportModel = require('../models/reportsMonthModel');

async function getMonthlyReport(req, res) {
    try {
        const plant = req.body.plant;
        const month = req.body.month || new Date().toISOString().slice(0, 7); 
        const data = await reportModel.getMonthlyReport(plant, month);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getMonthlyReport
};
