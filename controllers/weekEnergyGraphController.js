const energyModel = require('../models/Graph2Energy/weeklyEnergyGraphModel');

const getWeekEnergyData = async (req, res) => {
    const { plant, Date } = req.body;
    let formattedDate;
    if (!Date || Date.trim() === "") {
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday as start
        formattedDate = firstDayOfWeek.toISOString().slice(0, 10); // YYYY-MM-DD
    } else {
        formattedDate = Date;
    }

    try {
        const energyData = await energyModel.getEnergyData(plant, formattedDate);
        res.json(energyData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getWeekEnergyData
};
