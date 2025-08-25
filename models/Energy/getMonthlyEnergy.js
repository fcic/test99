const sql = require('mssql');
const config = require('../../config/config');

async function calculateLMYield(plant, timeZone) {
  try {
    const monthStart = `${timeZone}-01`;
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const formattedMonthEnd = `${monthEnd.getFullYear()}-${('0' + (monthEnd.getMonth() + 1)).slice(-2)}-${('0' + monthEnd.getDate()).slice(-2)}`;

    let deviceModels;
    if (plant === 'Bodyknits') {
      deviceModels = ["'100KTL-M1'", "'30KTL-M3'"];
    } else if (plant === 'Sweelee') {
      deviceModels = ["'SUN2000-60KTL-M0'", "'SUN2000-50KTL-M3'"];
    } else if (plant === '32tuas') {
      deviceModels = ["'115KTL-M2'", "'100KTL-M2'"];
    } else if (plant === '36tuas') {
      deviceModels = ["'115KTL-M2'", "'50KTL-M3'"];
    } else if (plant === 'NicoSteel') {
      deviceModels = ["'100KTL-M2'"];
    } else if (plant === 'Demo') {
      deviceModels = ["'100KTL-M2'"];
    } else if (plant === '40tuas') {
      deviceModels = ["'115KTL-M2'"];
    } else if (plant === '73tuas') {
      deviceModels = ["'115KTL-M2'"];
    } else if (plant === '15Tech') {
      deviceModels = ["'115KTL-M2'"];
    } else if (plant === '80tuas') {
      deviceModels = ["'115KTL-M2a'", "'115KTL-M2b'", "'115KTL-M2c'"];
    } else if (plant === 'SLS') {
      deviceModels = ["'50KTL-M3'", "'60KTL-M0'"];
    } else if (plant === '110tuas1') {
      deviceModels = ["'125KTL3-Xa'", "'125KTL3-Xb'", "'125KTL3-Xc'", "'125KTL3-Xd'", "'125KTL3-Xe'", "'110KTL3-Xf'", "'110KTL3-Xg'"];
    }else if (plant === '110tuas2') {
      deviceModels = ["'125KTL3-Xa'", "'125KTL3-Xb'", "'125KTL3-Xc'", "'125KTL3-Xd'", "'125KTL3-Xe'", "'110KTL3-Xf'", "'110KTL3-Xg'"];
    } else {
      throw new Error('Unknown plant');
    }

    let query;
    if (deviceModels.length > 1) {
      const unionQueries = deviceModels.map(device => `
        SELECT
          CAST([time] AS DATE) AS [Date],
          MAX(DailyEnergy) AS MaxDailyEnergy
        FROM
          Inverter
        WHERE
          [time] >= @MonthStart AND [time] < @MonthEnd
          AND plant = '${plant}'
          AND DeviceModel = ${device}
          AND CAST([time] AS TIME) >= '01:00:00'
        GROUP BY
          CAST([time] AS DATE)
      `).join(' UNION ALL ');

      query = `
        DECLARE @MonthStart DATE = '${monthStart}';
        DECLARE @MonthEnd DATE = '${formattedMonthEnd}';

        SELECT
          ROUND(SUM(MaxDailyEnergy) / 1000, 2) AS TotalEnergy
        FROM (
          ${unionQueries}
        ) AS DeviceMaxDailyEnergy;
      `;
    } else {
      query = `
        DECLARE @MonthStart DATE = '${monthStart}';
        DECLARE @MonthEnd DATE = '${formattedMonthEnd}';

        WITH DailyMaxEnergy AS (
          SELECT
            CAST([time] AS DATE) AS [Date],
            MAX(DailyEnergy) AS MaxDailyEnergy
          FROM
            Inverter
          WHERE
            [time] >= @MonthStart AND [time] < @MonthEnd
            AND plant = '${plant}'
            AND DeviceModel = ${deviceModels[0]}
            AND CAST([time] AS TIME) >= '01:00:00'
          GROUP BY
            CAST([time] AS DATE)
        )
        SELECT
          ROUND(SUM(MaxDailyEnergy) / 1000, 2) AS TotalEnergy
        FROM DailyMaxEnergy;
      `;
    }

    const pool = await sql.connect(config.db);
    const result = await pool.request().query(query);
    return result.recordset[0].TotalEnergy;
  } catch (err) {
    console.error('Error calculating LMYield:', err);
    throw new Error('Error calculating LMYield');
  }
}

module.exports = {
  calculateLMYield
};
