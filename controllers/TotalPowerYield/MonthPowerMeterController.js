const { getMonthTotalPower } = require('../../models/TotalPowerMetre/MonthTotalPower');

const getMonthTotalYield = async (req, res) => {
  try {

    const { plant,date } = req.body;

    
    if (!plant || !date) {
      return res.status(400).json({ error: 'Plant name and date (yyyy-MM) are required' });
    }

    
    const energyData = await getMonthTotalPower(plant,date);

    res.status(200).json(energyData);
  } catch (error) {
    console.error('Error fetching monthly energy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMonthTotalYield,
};
