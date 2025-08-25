const sql = require('mssql');
const config = require('../../config/config');

async function getMonthTotalPower(plant,date) {
  try {
    const pool = await sql.connect(config);
    
    let query = '';
    if (plant === '32tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS MonthTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy-MM') = @date;
      `;
    }else if (plant === 'NicoSteel') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS MonthTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy-MM') = @date;
      `;
    }
    else {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000000, 2) AS MonthTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy-MM') = @date;
      `;
    }

    const result = await pool.request()
      .input('plant', sql.VarChar, plant)
      .input('date', sql.VarChar, date)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('SQL error', error);
    throw error;
  }
}

module.exports = {
  getMonthTotalPower,
};
