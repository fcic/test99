const { fetchPlants, addPlant, updatePlant, deletePlant } = require('../models/PlantManagement');

// Fetch Plant Info (All or by plantId)
async function getPlantInfo(req, res) {
  const { plantId } = req.body;

  try {
    const plantInfo = await fetchPlants(plantId ? parseInt(plantId, 10) : null);
    if (!plantInfo || plantInfo.length === 0) {
      return res.status(404).json({ error: 'Plant info not found' });
    }
    res.status(200).json(plantInfo);
  } catch (error) {
    console.error('Error fetching plant info:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Add New Plant
async function createPlant(req, res) {
  const plant = req.body;

  try {
    const result = await addPlant(plant);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding plant:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update Existing Plant
async function modifyPlant(req, res) {
  const { plantId } = req.params;
  const updatedPlant = req.body;

  try {
    const result = await updatePlant(parseInt(plantId, 10), updatedPlant);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating plant:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete Plant
async function removePlant(req, res) {
  const { plantId } = req.params;

  try {
    const result = await deletePlant(parseInt(plantId, 10));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting plant:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getPlantInfo,
  createPlant,
  modifyPlant,
  removePlant,
};
