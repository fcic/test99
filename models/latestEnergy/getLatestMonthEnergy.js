//
const sql = require('mssql');
const config = require('../../config/config');

async function calculateLMYield(stationDn, timeZone) {
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
    const currentDate = new Date(); // Get current date
    const monthStart = `${currentDate.getFullYear()}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-01`;
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of current month
    const formattedMonthEnd = `${monthEnd.getFullYear()}-${('0' + (monthEnd.getMonth() + 1)).slice(-2)}-${('0' + monthEnd.getDate()).slice(-2)}`;

    let deviceModels;
    if (plant === 'Bodyknits') {
      deviceModels = "('100KTL-M1', '30KTL-M3')";
    } else if (plant === 'Sweelee') {
      deviceModels = "('SUN2000-60KTL-M0', 'SUN2000-50KTL-M3')";
    } else {
      throw new Error('Unknown plant');
    }

    query = `
      DECLARE @MonthStart DATE = '${monthStart}';
      DECLARE @MonthEnd DATE = '${formattedMonthEnd}';

      SELECT
        ROUND(SUM(TotalMaxDailyEnergy) / 1000, 2) AS TotalEnergy
      FROM (
        SELECT
          [Date],
          SUM(MaxDailyEnergy) AS TotalMaxDailyEnergy
        FROM (
          SELECT
            CAST([time] AS DATE) AS [Date],
            MAX(DailyEnergy) AS MaxDailyEnergy
          FROM
            Inverter
          WHERE
            [time] >= @MonthStart AND [time] < @MonthEnd
            AND plant = @Plant
            AND DeviceModel IN ${deviceModels}
          GROUP BY
            CAST([time] AS DATE)

          UNION ALL

          SELECT
            CAST([time] AS DATE) AS [Date],
            MAX(DailyEnergy) AS MaxDailyEnergy
          FROM
            Inverter
          WHERE
            [time] >= @MonthStart AND [time] < @MonthEnd
            AND plant = @Plant
            AND DeviceModel = ${deviceModels.split(', ')[1].replace(")", "")}
          GROUP BY
            CAST([time] AS DATE)
        ) AS DeviceMaxDailyEnergy
        GROUP BY
          [Date]
      ) AS DailyMax;
    `;

    const result = await pool.request()
      .input('Plant', sql.VarChar, plant)
      .query(query);

    return result.recordset[0].TotalEnergy;
  } catch (err) {
    console.error('Error calculating LMYield:', err);
    throw new Error('Error calculating LMYield');
  }
}

module.exports = {
  calculateLMYield
};
