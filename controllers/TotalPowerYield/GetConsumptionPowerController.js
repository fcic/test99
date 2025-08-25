const { getConsumptionEnergy } = require('../../models/TotalPowerMetre/ConsumptionPower');

const getConsumptionPower = async (req, res) => {
  try {
    const { plant } = req.body;

    if (!plant) {
      return res.status(400).json({ error: 'Plant name is required' });
    }

    const energyData = await getConsumptionEnergy(plant);
    res.status(200).json(energyData);
  } catch (error) {
    console.error('Error fetching lifetime energy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getConsumptionPower,
};
