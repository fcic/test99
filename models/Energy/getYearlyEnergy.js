const sql = require('mssql');
const config = require('../../config/config');

async function getYearlyEnergy(plant, timeZone) {
  try {
    const yearStart = `${timeZone}-01-01`;
    const yearEnd = `${parseInt(timeZone) + 1}-01-01`;

    const deviceModels = 
      plant === 'Bodyknits' 
        ? ['100KTL-M1', '30KTL-M3']
        : plant === 'Sweelee'
        ? ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3']
        : plant === '32tuas'
        ? ['115KTL-M2', '100KTL-M2']
        : plant === '36tuas'
        ? ['115KTL-M2', '50KTL-M3']
        : plant === '80tuas'
        ? ['115KTL-M2a','115KTL-M2b','115KTL-M2c']
        : plant === '40tuas'
        ? ['115KTL-M2']
        : plant === '73tuas'
        ? ['115KTL-M2']
        : plant === '15Tech'
        ? ['115KTL-M2']
        : plant === 'NicoSteel'
        ? ['100KTL-M2'] 
        : plant === 'Demo'
        ? ['100KTL-M2']
        : plant === 'SLS'
        ? ['60KTL-M0','50KTL-M3']
        : plant === '110tuas1'
        ? ['125KTL3-Xa','125KTL3-Xb','125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg']
        : plant === '110tuas2'
        ? ['125KTL3-Xa','125KTL3-Xb','125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg']
        : []; 

    if (deviceModels.length === 0) {
      throw new Error(`Unknown plant: ${plant}`);
    }

    const pool = await sql.connect(config.db);
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
              AND plant = '${plant}'
              AND DeviceModel = '${deviceModel}'
              AND CAST([time] AS TIME) >= '01:00:00'
            GROUP BY
              CAST([time] AS DATE)
          ) AS DeviceMaxYearlyEnergy
          GROUP BY
            YEAR([Date])
        ) AS YearlyMax;
      `;

      const result = await pool.request().query(query);
      results.push(result.recordset[0]?.TotalEnergy || 0); 
    }

 
    const totalEnergy = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const roundedTotalEnergy = Math.round(totalEnergy * 100) / 100;

    return roundedTotalEnergy;
  } catch (error) {
    console.error(`Error retrieving yearly energy data: ${error.message}`);
    throw new Error(`Error retrieving yearly energy data: ${error.message}`);
  }
}

module.exports = {
  getYearlyEnergy
};
