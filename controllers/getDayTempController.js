const { getDayTemperatureData } = require('../models/Temp/getDayTemp');

const getDayTempGraphController = async (req, res) => {
  const { plant, date } = req.body;

  if (!plant || !date) {
    return res.status(400).json({ message: 'Plant and date are required parameters.' });
  }

  try {
    const response = await getDayTemperatureData(plant, date);

    if (!response || !response.data || response.data.xAxis.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified plant and date.' });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getDayTempGraphController:", error);
    return res.status(500).json({ message: 'Error fetching temperature graph data.', error: error.message });
  }
};

module.exports = { getDayTempGraphController };
