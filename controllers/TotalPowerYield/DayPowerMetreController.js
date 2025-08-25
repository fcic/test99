const { getDailyReverseActiveEnergy } = require('../../models/TotalPowerMetre/DayTotalPower');


const getDayPowerMetre = async (req, res) => {
  try {
   
    const { plant, date } = req.body;

   
    if (!plant || !date) {
      return res.status(400).json({ error: 'Plant name and date are required' });
    }

   
    const energyData = await getDailyReverseActiveEnergy(plant, date);

    res.status(200).json(energyData);
  } catch (error) {
    console.error('Error fetching daily energy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDayPowerMetre,
};
