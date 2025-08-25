// Controller.js
const plantModel = require('../models/stationList');

async function fetchStationList(req, res) {
  const { curPage, pageSize, sortId, sortDir } = req.body;

  try {
    const response = await plantModel.getStationList(curPage, pageSize, sortId, sortDir);
    res.json(response);
  } catch (error) {
    console.error('Error fetching station list:', error);
    res.status(500).json({
      success: false,
      failCode: 1,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  fetchStationList,
};
