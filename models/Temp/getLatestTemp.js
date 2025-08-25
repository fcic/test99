
// const sql = require('mssql');
// const config = require('../../config/config');

// async function getLatestTemp(plant) {
//   try {
//     const pool = await sql.connect(config.db);

//     const query = `
//       SELECT TOP 1 [Temp]
//       FROM [Trek_solar].[dbo].[Temp]
//       WHERE [Plant] = @Plant 
//         AND CAST([Time] AS DATE) = CAST(GETDATE() AS DATE)
//       ORDER BY [Time] DESC;
//     `;

//     const result = await pool.request()
//       .input('Plant', sql.VarChar, plant)
//       .query(query);

//     if (result.recordset.length === 0) {
//       return null; // No temperature data for today
//     }

//     return parseFloat(result.recordset[0].Temp).toFixed(2);
//   } catch (error) {
//     throw new Error(`Error retrieving the latest temperature: ${error.message}`);
//   }
// }

// module.exports = {
//   getLatestTemp,
// };
const sql = require('mssql');
const config = require('../../config/config');

async function getLatestTemp(plant) {
  try {
    const pool = await sql.connect(config.db);

    let query = `
      SELECT TOP 1 [Temp]
      FROM [Trek_solar].[dbo].[Temp]
      WHERE [Plant] = @Plant 
        AND CAST([Time] AS DATE) = CAST(GETDATE() AS DATE)
    `;

    // Add additional condition for plant = 'SLS'
    if (plant === 'SLS') {
      query += ` AND [SN] = 'AMTemp'`;
    }

    query += ' ORDER BY [Time] DESC;';

    const result = await pool.request()
      .input('Plant', sql.VarChar, plant)
      .query(query);

    if (result.recordset.length === 0) {
      return null; // No temperature data for today
    }

    return parseFloat(result.recordset[0].Temp).toFixed(2);
  } catch (error) {
    throw new Error(`Error retrieving the latest temperature: ${error.message}`);
  }
}

module.exports = {
  getLatestTemp,
};
