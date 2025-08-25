
const { fetchDailyIrradiance } = require('../models/dailyIrradiance');

async function fetchDailyIrradianceAndEnergy(req, res) {
  const { plant, D } = req.body; // Assuming D is the date parameter sent from the client

  try {
    const DIdt = D ? D : 'CAST(GETDATE() AS DATE)';


    const { dailyIrrad, latestIrradSweelee } = await fetchDailyIrradiance(DIdt, plant);

    const dailyIrradMJ = dailyIrrad !== null ? parseFloat(dailyIrrad.toFixed(3)) : null;
    const dailyIrradKWh = dailyIrradMJ !== null ? parseFloat((dailyIrradMJ * 0.27778).toFixed(2)) : null;

    
    const latestIrradMJ = latestIrradSweelee !== null ? parseFloat(latestIrradSweelee.toFixed(3)) : null;
    

    res.json({ 
      dailyIrradianceMJ: dailyIrradMJ,
      dailyIrradianceKWh: dailyIrradKWh,
      latestIrradMJ: latestIrradMJ
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchDailyIrradianceAndEnergy
};
