const sql = require('mssql');
const config = require('../config/config');

async function getPlantAlarms(plantName) {
  try {
    const query = `
      DECLARE @Plant NVARCHAR(50) = @PlantNameParam;

      SELECT  Top 50
          PlantName,
          DeviceType,
          DeviceName,
          AlarmID,
          AlarmName,
          ClearanceTime,
          OccurrenceTime,
          Status
      FROM PlantAlarms
      WHERE PlantName = @Plant AND Status = 'Active'
      ORDER BY OccurrenceTime DESC;
    `;

    const pool = await sql.connect(config.db);
    const result = await pool.request()
      .input('PlantNameParam', sql.NVarChar(50), plantName)  
      .query(query);

    return result.recordset;  
  } catch (error) {
    throw new Error(`Error retrieving alarms: ${error.message}`);
  }
}

module.exports = {
  getPlantAlarms
};
