const { getDayEnergyData } = require('../models/Graph2Energy/dayEnergyGraphModel');

async function fetchDayEnergyData(req, res) {
  const { plant,Date } = req.body;

  try {
    if (!plant || !Date) {
      return res.status(400).json({ error: 'Plant and Date parameters are required' });
    }

    const data = await getDayEnergyData(plant,Date);

    res.json(data);
  } catch (error) {
    console.error('Error fetching Day Energy Data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchDayEnergyData
};
