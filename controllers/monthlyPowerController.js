const { getLMData } = require('../models/powerOut/monthlyPower');

async function fetchLMData(req, res) {
  try {
    const { plant, LM } = req.body;
    const date = LM === '' ? new Date().toISOString().slice(0, 7) : LM;

    const data = await getLMData(plant, date);

    res.json(data);

  } catch (error) {
    console.error('Error in fetching LMs data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching LM data'
    });
  }
}

module.exports = {
  fetchLMData
};
