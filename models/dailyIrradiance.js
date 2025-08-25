
const sql = require('mssql');
const config = require('../config/config');

async function fetchDailyIrradiance(DIdt, plant) {
  try {
    
    const queryDailyIrrad = `
      SELECT TOP 1 DailyIrrad
      FROM EMI5 
      WHERE CAST([time] AS DATE) = '${DIdt}'
      AND plant = '${plant}'
      ORDER BY [Time] DESC;
    `;


    const queryLatestIrrad = `
      SELECT TOP 1 Irrad
      FROM EMI5 
      WHERE plant = '${plant}'
      ORDER BY [Time] DESC;
    `;

    const pool = await sql.connect(config.db);

    
    const [resultDailyIrrad, resultLatestIrrad] = await Promise.all([
      pool.request().query(queryDailyIrrad),
      pool.request().query(queryLatestIrrad)
    ]);

    
    const dailyIrrad = resultDailyIrrad.recordset.length > 0 ? resultDailyIrrad.recordset[0].DailyIrrad : null;
    const latestIrradSweelee = resultLatestIrrad.recordset.length > 0 ? resultLatestIrrad.recordset[0].Irrad : null;

    return { dailyIrrad, latestIrradSweelee };
  } catch (error) {
    throw new Error(`Error fetching daily irradiance: ${error.message}`);
  }
}

module.exports = {
  fetchDailyIrradiance
};
