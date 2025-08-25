const { getLatestEnergy } = require('../models/latestEnergy/getLatestEnergy');
 const { calculateLMYield } = require('../models/latestEnergy/getLatestMonthEnergy');
const { getYearlyEnergy } = require('../models/latestEnergy/getLatestYearEnergy');
const { getLifetimeEnergy } = require('../models/latestEnergy/getLifetimeEnergy');

async function fetchStationRealKPI(req, res) {
  const { stationDn,timeZone } = req.body;

  try {
    if (!stationDn && !timeZone) {
      return res.status(400).json({ error: 'Plant parameter is required' });
    }

    const data = {
      existMeter: false // Hardcoded as false
    };

    // Fetch daily energy
    try {
      data.dailyEnergy = await getLatestEnergy(stationDn,timeZone);
    } catch (error) {
      throw new Error(`Error fetching daily energy: ${error.message}`);
    }
        
    // Calculate monthly energy
    try {
      data.monthEnergy = await calculateLMYield(stationDn,timeZone);
    } catch (error) {
      throw new Error(`Error calculating monthly energy: ${error.message}`);
    }
            
    // Fetch yearly energy
    try {
      data.yearEnergy = await getYearlyEnergy(stationDn,timeZone);
    } catch (error) {
      throw new Error(`Error fetching yearly energy: ${error.message}`);
    }
    
    // // Fetch cumulative energy
    try {
      data.cumulativeEnergy = await getLifetimeEnergy(stationDn,timeZone);
    } catch (error) {
      throw new Error(`Error fetching cumulative energy: ${error.message}`);
    }

    res.json({
      data,
      success: true,
      failCode: 0
    });
  } catch (error) {
    console.error('Error fetching station real KPI:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchStationRealKPI
};
