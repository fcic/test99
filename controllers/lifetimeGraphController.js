const { getLifetimeData } = require('../models/Graph2Energy/lifetimeenergyGraphModel'); // Adjust the path as needed

const getLifetimeEnergyData = async (req, res) => {
    const { plant } = req.body;

    if (!plant) {
        return res.status(400).json({ error: 'Plant parameter is required' });
    }

    try {
        const data = await getLifetimeData(plant);
        res.json(data);
    } catch (err) {
        console.error('Error fetching lifetime data:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getLifetimeEnergyData
};
