const sql = require('mssql');
const config = require('../../config/config');

async function fetchInverterInfo(plant, deviceModel) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    request.input('plant', sql.VarChar, plant);
    request.input('deviceModel', sql.VarChar, deviceModel);

   
    const query = `
      SELECT TOP 1 * 
      FROM Inverter 
      WHERE Plant = @plant AND DeviceModel = @deviceModel
      ORDER BY Time DESC;
    `;

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching inverter info: ${error.message}`);
  }
}

module.exports = {
  fetchInverterInfo,
};
