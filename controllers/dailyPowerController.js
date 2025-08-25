const { getDailyIrradiance } = require('../models/powerOut/dailyPower');

async function fetchDailyIrradiance(req, res) {
  const { Date, plant } = req.body;

  try {
    if (!Date || !plant) {
      return res.status(400).json({ error: 'Both Date and plant parameters are required' });
    }

    const data = await getDailyIrradiance(Date, plant);

    res.json(data);
  } catch (error) {
    console.error('Error fetching daily irradiance:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchDailyIrradiance
};
