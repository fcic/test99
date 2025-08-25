const sql = require('mssql');
const config = require('../../config/config');

async function getConsumptionEnergy(plant) {
  try {
    const pool = await sql.connect(config);

    let query = '';
    if (plant === '110tuas1' || plant === '110tuas2') {
      query = `
        SELECT TOP 1 
          ROUND([TotalPositiveActiveEly] / 1000000, 2) AS LifetimeTotalPower,
          [Time] AS LatestTime
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    } else {
      console.warn(`No query configured for plant: ${plant}`);
      return {
        LifetimeTotalPower: 0,
        LatestTime: null
      };
    }

    const result = await pool.request()
      .input('plant', sql.VarChar, plant)
      .query(query);

    // ✅ Check if result exists
    if (!result.recordset || result.recordset.length === 0) {
      console.warn(`No data found for plant: ${plant}`);
      return {
        LifetimeTotalPower: 0,
        LatestTime: null
      };
    }

    return result.recordset[0];
  } catch (error) {
    console.error('SQL error', error);
    throw error;
  }
}

module.exports = {
  getConsumptionEnergy
};
