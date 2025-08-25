
const sql = require('mssql');
const config = require('../config/config');

async function getAlarmCountsBySeverity(plant) {
  try {
    let pool = await sql.connect(config.db);

    const query = `
      SELECT
        SUM(CASE WHEN alarmseverity = 'Critical' THEN 1 ELSE 0 END) AS A1,
        SUM(CASE WHEN alarmseverity = 'Major' THEN 1 ELSE 0 END) AS A2,
        SUM(CASE WHEN alarmseverity = 'Minor' THEN 1 ELSE 0 END) AS A3,
        SUM(CASE WHEN alarmseverity = 'Warning' THEN 1 ELSE 0 END) AS A4
      FROM plantalarms
      WHERE status='active' AND plantName = @plant
    `;
// WHERE status='active' AND plantName = '${plant === 'Bodyknits' ? 'Bodynits' : 'Sweelee'}'
    // const result = await pool.request().query(query);

    const result = await pool.request()
      .input('plant', sql.NVarChar, plant) // Properly bind parameter
      .query(query);
    const alarmCounts = result.recordset[0];

    // Check if the result is valid and properly formatted
    if (!alarmCounts) {
      throw new Error('No alarm data found');
    }

    // Return the counts as a valid object
    return {
      A1: alarmCounts.A1 || 0,
      A2: alarmCounts.A2 || 0,
      A3: alarmCounts.A3 || 0,
      A4: alarmCounts.A4 || 0
    };
  } catch (error) {
    throw new Error(`Error retrieving alarm counts: ${error.message}`);
  }
}

module.exports = {
  getAlarmCountsBySeverity
};
