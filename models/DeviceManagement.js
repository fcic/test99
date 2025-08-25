const sql = require('mssql');
const config = require('../config/config');

// Fetch Devices
async function fetchDevices() {
  try {
    const query = `
      SELECT DeviceId, DeviceStatus, Name, PlantName, DeviceType, SerialNumber, DeviceModel, DeviceDn, Plant 
      FROM Devices;
    `;

    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching devices: ${error.message}`);
  }
}

// Add a Device
async function addDevice(device) {
  try {
    const query = `
      INSERT INTO Devices (DeviceStatus, Name, PlantName, DeviceType, SerialNumber, DeviceModel, DeviceDn, Plant)
      VALUES (@DeviceStatus, @Name, @PlantName, @DeviceType, @SerialNumber, @DeviceModel, @DeviceDn, @Plant);
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('DeviceStatus', sql.NVarChar, device.DeviceStatus)
      .input('Name', sql.NVarChar, device.Name)
      .input('PlantName', sql.NVarChar, device.PlantName)
      .input('DeviceType', sql.NVarChar, device.DeviceType)
      .input('SerialNumber', sql.NVarChar, device.SerialNumber)
      .input('DeviceModel', sql.NVarChar, device.DeviceModel)
      .input('DeviceDn', sql.NVarChar, device.DeviceDn)
      .input('Plant', sql.NVarChar, device.Plant);

    await request.query(query);
    return { message: 'Device added successfully' };
  } catch (error) {
    throw new Error(`Error adding device: ${error.message}`);
  }
}

// Update Device
async function updateDevice(deviceId, updatedDevice) {
  try {
    const query = `
      UPDATE Devices
      SET DeviceStatus = @DeviceStatus, Name = @Name, PlantName = @PlantName, DeviceType = @DeviceType,
          SerialNumber = @SerialNumber, DeviceModel = @DeviceModel, DeviceDn = @DeviceDn, Plant = @Plant
      WHERE DeviceId = @DeviceId;
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('DeviceId', sql.Int, deviceId)
      .input('DeviceStatus', sql.NVarChar, updatedDevice.DeviceStatus)
      .input('Name', sql.NVarChar, updatedDevice.Name)
      .input('PlantName', sql.NVarChar, updatedDevice.PlantName)
      .input('DeviceType', sql.NVarChar, updatedDevice.DeviceType)
      .input('SerialNumber', sql.NVarChar, updatedDevice.SerialNumber)
      .input('DeviceModel', sql.NVarChar, updatedDevice.DeviceModel)
      .input('DeviceDn', sql.NVarChar, updatedDevice.DeviceDn)
      .input('Plant', sql.NVarChar, updatedDevice.Plant);

    await request.query(query);
    return { message: 'Device updated successfully' };
  } catch (error) {
    throw new Error(`Error updating device: ${error.message}`);
  }
}

// Delete Device
async function deleteDevice(deviceId) {
  try {
    const query = `
      DELETE FROM Devices
      WHERE DeviceId = @DeviceId;
    `;

    const pool = await sql.connect(config);
    const request = pool.request().input('DeviceId', sql.Int, deviceId);

    await request.query(query);
    return { message: 'Device deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting device: ${error.message}`);
  }
}

module.exports = {
  fetchDevices,
  addDevice,
  updateDevice,
  deleteDevice
};
