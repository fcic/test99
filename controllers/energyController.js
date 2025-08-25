const { getLatestEnergy } = require('../models/Energy/dailyEnergy');
const { calculateLMYield } = require('../models/Energy/getMonthlyEnergy');
const { getYearlyEnergy } = require('../models/Energy/getYearlyEnergy');
const { getLifetimeEnergy } = require('../models/Energy/getLifetimeEnergy');

async function fetchStationRealKPI(req, res) {
  const { plant, timeZone } = req.body;

  // console.log('Received plant:', plant);
  // console.log('Received timeZone:', timeZone);

  try {
    if (!plant) {
      return res.status(400).json({ error: 'Plant parameter is required' });
    }

    const data = {
      existMeter: false // Hardcoded as false
    };

    // Fetch daily energy
    data.dailyEnergy = await getLatestEnergy(plant, timeZone);

    if (timeZone) {
      
      if (timeZone.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const monthYear = timeZone.substring(0, 7); 
        const year = timeZone.substring(0, 4);
        
        data.monthEnergy = await calculateLMYield(plant, monthYear);
        data.yearEnergy = await getYearlyEnergy(plant, year);
      } else if (timeZone.match(/^\d{4}-\d{2}$/)) {
        
        data.monthEnergy = await calculateLMYield(plant, timeZone);
      } else if (timeZone.match(/^\d{4}$/)) {
        
        data.yearEnergy = await getYearlyEnergy(plant, timeZone);
      }
    }

    // Fetch lifetime energy
    data.cumulativeEnergy = await getLifetimeEnergy(plant);

    res.json({
      data,
      success: true,
      failCode: 0
    });
  } catch (error) {
    console.error('Error fetching Energy Data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchStationRealKPI
};
