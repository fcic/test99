const { fetchInverterInfo } = require('../../models/Remote/RemoteControllModel'); 

const getInverterDetails = async (req, res) => {
  try {
    const { plant,deviceModel } = req.body;

    if (!plant && !deviceModel) {
      return res.status(400).json({ error: 'Plant and devicemodel parameters are required' });
    }

  
    const inverterInfo = await fetchInverterInfo(plant,deviceModel);


    if (inverterInfo.length === 0) {
      return res.status(404).json({ message: 'No inverter data found for the specified plant' });
    }

    
    res.status(200).json(inverterInfo);
  } catch (error) {
    res.status(500).json({ error: `Error fetching inverter info: ${error.message}` });
  }
};

module.exports = {
  getInverterDetails,
};
