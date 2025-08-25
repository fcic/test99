const { getLatestPowerOutput } = require('../models/svgDiagramValue'); // Adjust the path to your service file

// Controller function
const getLatestPowerOutputController = async (req, res) => {
  try {
    const { Date, plant } = req.body;

    // Validate input
    if (!Date || !plant) {
      return res.status(400).json({
        success: false,
        failCode: 2,
        message: 'Date and plant are required',
      });
    }

    // Call the service function to get the latest power output
    const result = await getLatestPowerOutput(Date, plant);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({
        success: false,
        failCode: result.failCode,
        message: result.message || 'No data found for the given date and plant',
      });
    }
  } catch (error) {
    console.error('Error in getLatestPowerOutputController:', error);
    return res.status(500).json({
      success: false,
      failCode: 3,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getLatestPowerOutputController,
};
