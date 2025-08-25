

const sql = require('mssql');
const config = require('../../config/config');

async function getLifetimeReverseActiveEnergy(plant) {
  try {
    const pool = await sql.connect(config);

    // Adjust query dynamically based on the plant
    let query = '';
    if (plant === '32tuas') {
      query = `
         SELECT TOP 1 
          [ReverseactiveEnergy]  AS LifetimeTotalPower,
          [Time] AS LatestTime
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else if (plant === '36tuas') {
      query = `
         SELECT TOP 1 
          [ReverseactiveEnergy]  AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else if (plant === '73tuas') {
      query = `
         SELECT TOP 1 
          [ReverseactiveEnergy]  AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else if (plant === '40tuas') {
      query = `
         SELECT TOP 1 
          [ReverseactiveEnergy]  AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }
    else if (plant === '80tuas') {
      query = `
         SELECT TOP 1 
        [ReverseactiveEnergy] AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else if (plant === '15Tech') {
      query = `
         SELECT TOP 1 
        [ReverseactiveEnergy] AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    } else  if (plant === 'NicoSteel') {
      query = `
         SELECT TOP 1 
          ROUND([ReverseactiveEnergy] / 1000, 2) AS LifetimeTotalPower
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }else  if (plant === 'Sweelee') {
      query = `
         SELECT TOP 1 
          ROUND([ReverseactiveEnergy] / 1000, 2) AS LifetimeTotalPower,
          [Time] AS LatestTime
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
          [Time] AS LatestTime
        FROM 
          [Trek_Solar].[dbo].[PowerSensor]
        WHERE 
          plant = @plant
        ORDER BY 
          [time] DESC;
      `;
    }
    // else  if (plant === '110tuas2') {
    //   query = `
    //      SELECT TOP 1 
    //       ROUND([TotalPositiveActiveEly] / 1000000, 2) AS LifetimeTotalPower,
    //       [Time] AS LatestTime
    //     FROM 
    //       [Trek_Solar].[dbo].[PowerSensor]
    //     WHERE 
    //       plant = @plant
    //     ORDER BY 
    //       [time] DESC;
    //   `;
    // }
    else {
      query = `
        SELECT TOP 1 
          ROUND([ReverseactiveEnergy] / 1000000, 2) AS LifetimeTotalPower
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
