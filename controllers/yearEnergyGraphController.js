const yearEnergyModel = require('../models/Graph2Energy/yearEnergyGraphModel'); 

const getYearEnergyData = async (req, res) => {
    const { plant, year } = req.body; 
    const formattedYear = year === "" ? new Date().getFullYear().toString() : year; 

    try {
        const energyData = await yearEnergyModel.getYearlyEnergyData(plant, formattedYear); 
        res.json(energyData); 
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    }
};

module.exports = {
    getYearEnergyData
};
