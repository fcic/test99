

const sql = require('mssql');
const config = require('../../config/config');

async function getLifetimeReverseActiveEnergy(plant) {
  try {
    const pool = await sql.connect(config);

    // Adjust query dynamically based on the plant
    let query = '';
    
    if (plant === 'Sweelee') {
      query = `
         SELECT TOP 1 
          ROUND([ReverseactiveEnergy] / 1000, 2) AS LifetimeTotalPower,
            CONVERT(VARCHAR(33), [Time], 127) AS time 
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else  if (plant === 'SLS') {
      query = `
         SELECT TOP 1 
          ROUND([ReverseactiveEnergy] / 1000, 2) AS LifetimeTotalPower,
          CONVERT(VARCHAR(33), [Time], 127) AS time 
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }

    const result = await pool.request()
      .input('plant', sql.VarChar, plant)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('SQL error', error);
    throw error;
  }
}

module.exports = {
  getLifetimeReverseActiveEnergy
};
