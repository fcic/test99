const { fetchDevices, addDevice, updateDevice, deleteDevice } = require('../models/DeviceManagement');

// Fetch Devices
async function getDevices(req, res) {
  try {
    const devices = await fetchDevices();
    if (!devices || devices.length === 0) {
      return res.status(404).json({ error: 'No devices found' });
    }
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Add Device
async function createDevice(req, res) {
  const device = req.body;

  try {
    const result = await addDevice(device);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding device:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update Device
async function modifyDevice(req, res) {
  const { deviceId } = req.params;
  const updatedDevice = req.body;

  try {
    const result = await updateDevice(deviceId, updatedDevice);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating device:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete Device
async function removeDevice(req, res) {
  const { deviceId } = req.params;

  try {
    const result = await deleteDevice(deviceId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting device:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getDevices,
  createDevice,
  modifyDevice,
  removeDevice
};
