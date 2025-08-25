const { getLifetimeData } = require('../models/powerOut/lifetimePower');

async function fetchLifeTimeIrradiance(req, res) {
  const { plant } = req.body;

  try {
    if (!plant) {
      return res.status(400).json({ error: 'Plant parameter is required' });
    }

    const data = await getLifetimeData(plant);

    res.json(data);
  } catch (error) {
    console.error('Error fetching Lifetime irradiance:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchLifeTimeIrradiance
};
