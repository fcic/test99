const { getYearlyData } = require('../models/powerOut/yearlyPower');

async function fetchYearlyIrradiance(req, res) {
  const { plant,Date } = req.body;

  try {
    if (!plant || !Date) {
      return res.status(400).json({ error: 'Both Date and plant parameters are required' });
    }

    const data = await getYearlyData(plant,Date);

    res.json(data);
  } catch (error) {
    console.error('Error fetching yearly irradiance:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchYearlyIrradiance
};
