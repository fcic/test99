
const sql = require('mssql');
const config = require('../../config/config');

async function getYearlyEnergy(stationDn, timeZone) {
  try {
    const pool = await sql.connect(config.db);

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

    // Step 2: Construct the query based on the plant name
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear + 1}-01-01`;

    const deviceModels = plant === 'Bodyknits' ? ['100KTL-M1', '30KTL-M3'] : ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3'];
    const results = [];

    for (const deviceModel of deviceModels) {
      const query = `
        DECLARE @YearStart DATE = '${yearStart}';
        DECLARE @YearEnd DATE = '${yearEnd}';

        SELECT
          SUM(TotalMaxYearlyEnergy) / 1000 AS TotalEnergy
        FROM (
          SELECT
            YEAR([Date]) AS [Year],
            SUM(MaxYearlyEnergy) AS TotalMaxYearlyEnergy
          FROM (
            SELECT
              CAST([time] AS DATE) AS [Date],
              MAX(DailyEnergy) AS MaxYearlyEnergy
            FROM
              Inverter
            WHERE
              [time] >= @YearStart AND [time] < @YearEnd
              AND plant = @Plant
              AND DeviceModel = '${deviceModel}'
            GROUP BY
              CAST([time] AS DATE)
          ) AS DeviceMaxYearlyEnergy
          GROUP BY
            YEAR([Date])
        ) AS YearlyMax;
      `;

      const result = await pool.request()
        .input('Plant', sql.VarChar, plant)
        .query(query);
      results.push(result.recordset[0].TotalEnergy);
    }

    const totalEnergy = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Round up 
    const roundedTotalEnergy = Math.round(totalEnergy * 100) / 100;

    return roundedTotalEnergy;
  } catch (error) {
    throw new Error(`Error retrieving yearly energy data: ${error.message}`);
  }
}

module.exports = {
  getYearlyEnergy
};
