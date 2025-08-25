const { getPlantAlarms } = require('../models/AlarmHistory');

async function fetchAlarmsByPlantName(req, res) {
  const { plantName } = req.body;  

  if (!plantName) {
    return res.status(400).json({ message: 'PlantName is required' });
  }

  try {
    const alarms = await getPlantAlarms(plantName);  
    res.status(200).json(alarms);  
  } catch (error) {
    res.status(500).json({ message: `Error fetching alarms: ${error.message}` });
  }
}

module.exports = {
  fetchAlarmsByPlantName
};
