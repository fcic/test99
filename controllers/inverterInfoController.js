const fetchUserInfo = require('../models/InverterDetails');

const getInverterDetails = async (req, res) => {
  try {
    const { plant } = req.body;

    if (!plant) {
      return res.status(400).json({ error: 'Plant name is required' });
    }

    const inverterData = await fetchUserInfo(plant);

    res.status(200).json(inverterData);
  } catch (error) {
    console.error('Error in getInverterDetails:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getInverterDetails,
};
