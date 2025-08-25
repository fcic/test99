const energyModel = require('../models/Graph2Energy/monthEnergyGraphModel');

const getMonthEnergyData = async (req, res) => {
    const { plant, Date } = req.body;
    const formattedDate = Date === "" ? new Date().toISOString().slice(0, 7) : Date;

    try {
        const energyData = await energyModel.getEnergyData(plant, formattedDate);
        res.json(energyData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getMonthEnergyData
};
