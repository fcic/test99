const { getAlarmCountsBySeverity } = require('../models/AlarmModels');

async function fetchAlarm(req, res) {
  const { plant } = req.body;

  
  if (!plant) {
    return res.status(400).json({ error: 'Plant parameter is required' });
  }

  try {
    // Fetch alarm counts based on the plant
    const alarmData = await getAlarmCountsBySeverity(plant);

    res.json({
      data: alarmData,
      success: true,
      failCode: 0
    });
  } catch (error) {
    console.error('Error fetching Alarm Data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  fetchAlarm
};
