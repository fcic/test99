const sql = require('mssql');
const config = require('../config/config');

async function fetchInverterInfo(plant) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Use parameterized query to avoid SQL injection
    request.input('plant', sql.VarChar, plant);

  
    const query = `
    SELECT TOP 5 * 
    FROM Inverter 
    WHERE Plant = @plant 
    ORDER By(Time) DESC;
  `;
  

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching user info: ${error.message}`);
  }
}

module.exports = fetchInverterInfo;
