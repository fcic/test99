const { getLatestTemp } = require('../models/Temp/getLatestTemp');

const getTempController = async (req, res) => {
  const { plant } = req.body; 

  if (!plant) {
    return res.status(400).json({ message: 'Plant is required parameters.' });
  }

  try {
    const temperature = await getLatestTemp(plant);

    if (temperature === null) {
      return res.status(404).json({ message: 'No temperature data found for the specified Plant.' });
    }

    return res.status(200).json({ temperature });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching temperature data.', error: error.message });
  }
};

module.exports = { getTempController };
