const { getYearTotalPower } = require('../../models/TotalPowerMetre/YearTotalPower');

const getYearTotalPowerYield = async (req, res) => {
  try {
   
    const { plant, date } = req.body;

   
    if (!plant || !date) {
      return res.status(400).json({ error: 'Plant and date (yyyy) are required' });
    }

    
    const energyData = await getYearTotalPower(plant, date);

    
    res.status(200).json(energyData);
  } catch (error) {
    console.error('Error fetching yearly energy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getYearTotalPowerYield,
};
