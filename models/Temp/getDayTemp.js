const sql = require('mssql');
const config = require('../../config/config');

async function getDayTemperatureData(plant, date) {
  try {
    const pool = await sql.connect(config.db);

    let query = `
      SELECT 
        FORMAT([Time], 'HH:mm') AS TimeFormatted,
        CAST([Temp] AS FLOAT) AS Temperature
      FROM [Trek_solar].[dbo].[Temp]
      WHERE 
        [Plant] = @Plant
        AND CAST([Time] AS DATE) = @Date
    `;

    if (plant === 'SLS') {
        query += ` AND [SN] = 'AMTemp'`;
      } else if (plant === 'Sweelee') {
        query += ` AND [SN] = 'EM00102225368375'`;
      }

    query += ` ORDER BY [Time] ASC;`;

    const result = await pool.request()
      .input('Plant', sql.VarChar, plant)
      .input('Date', sql.Date, date)
      .query(query);

    const xAxis = result.recordset.map(row => row.TimeFormatted);
    const tempValues = result.recordset.map(row => parseFloat(row.Temperature.toFixed(2)));

    return {
      data: {
        xAxis,
        "Temperature °C": tempValues
      }
    };
  } catch (error) {
    console.error("Error fetching day temperature data:", error.message);
    throw new Error("Failed to retrieve temperature data");
  }
}

module.exports = {
  getDayTemperatureData,
};
