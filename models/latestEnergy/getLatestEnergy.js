const sql = require('mssql');
const config = require('../../config/config');

async function getLatestEnergy(stationDn, timeZone) {
  try {
    let pool = await sql.connect(config.db);
  
    const plantQuery = `
      SELECT Plant
      FROM [Trek_Solar].[dbo].[Plants]
      WHERE StationDn = @StationDn AND PlantTimeZone = @PlantTimeZone;
    `;
    
    const plantResult = await pool.request()
      .input('StationDn', sql.VarChar, stationDn)
      .input('PlantTimeZone', sql.VarChar, timeZone)
      .query(plantQuery);

    if (plantResult.recordset.length === 0) {
      throw new Error(`No plant found for StationDn: ${stationDn} and timeZone: ${timeZone}`);
    }

    const plant = plantResult.recordset[0].Plant;

    
    let query;
    
    if (plant === 'Bodyknits') {
      query = `
        WITH LatestEnergy AS (
          SELECT TOP (1) [DailyEnergy], '100KTL-M1' AS Model
          FROM [Trek_Solar].[dbo].[Inverter]
          WHERE DeviceModel = '100KTL-M1' AND CAST([time] AS DATE) = CAST(GETDATE() AS DATE) AND plant = @Plant
          ORDER BY [time] DESC

          UNION ALL

          SELECT TOP (1) [DailyEnergy], '30KTL-M3' AS Model
          FROM [Trek_Solar].[dbo].[Inverter]
          WHERE DeviceModel = '30KTL-M3' AND CAST([time] AS DATE) = CAST(GETDATE() AS DATE) AND plant = @Plant
          ORDER BY [time] DESC
        )
        SELECT CONCAT('[', STRING_AGG(CAST([DailyEnergy] AS VARCHAR), ','), ']') AS EnergyArray,
               SUM([DailyEnergy]) AS TotalEnergy
        FROM LatestEnergy;
      `;
    } else if (plant === 'Sweelee') {
      query = `
        WITH LatestEnergy AS (
          SELECT TOP (1) [DailyEnergy], 'SUN2000-60KTL-M0' AS Model
          FROM [Trek_Solar].[dbo].[Inverter]
          WHERE DeviceModel = 'SUN2000-60KTL-M0' AND CAST([time] AS DATE) = CAST(GETDATE() AS DATE) AND plant = @Plant
          ORDER BY [time] DESC

          UNION ALL

          SELECT TOP (1) [DailyEnergy], 'SUN2000-50KTL-M3' AS Model
          FROM [Trek_Solar].[dbo].[Inverter]
          WHERE DeviceModel = 'SUN2000-50KTL-M3' AND CAST([time] AS DATE) = CAST(GETDATE() AS DATE) AND plant = @Plant
          ORDER BY [time] DESC
        )
        SELECT CONCAT('[', STRING_AGG(CAST([DailyEnergy] AS VARCHAR), ','), ']') AS EnergyArray,
               SUM([DailyEnergy]) AS TotalEnergy
        FROM LatestEnergy;
      `;
    } else {
      throw new Error(`Unsupported plant: ${plant}`);
    }

    const result = await pool.request()
      .input('Plant', sql.VarChar, plant)
      .query(query);

    const totalEnergy = parseFloat(result.recordset[0].TotalEnergy).toFixed(2);
    return totalEnergy;

  } catch (error) {
    throw new Error(`Error retrieving latest energy data: ${error.message}`);
  }
}

module.exports = {
  getLatestEnergy
};
