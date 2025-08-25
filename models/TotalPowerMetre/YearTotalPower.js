// const sql = require('mssql');
// const config=require('../../config/config');

// async function getYearTotalPower(plant, date) {
//   try {
//     const pool = await sql.connect(config);
//     const result = await pool.request()
//       .input('plant', sql.VarChar, plant)  
//       .input('date', sql.VarChar, date)           
//       .query(`
//         SELECT 
//           ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000000, 2) AS YearTotalPower
//         FROM 
//           [PowerSensor]
//         WHERE 
//           plant = @plant
//           AND FORMAT([time], 'yyyy') = @date;
//       `);

//     return result.recordset[0];
//   } catch (error) {
//     console.error('SQL error', error);
//     throw error;
//   }
// }
// module.exports={
//     getYearTotalPower
// }

const sql = require('mssql');
const config = require('../../config/config');

async function getYearTotalPower(plant, date) {
  try {
    const pool = await sql.connect(config);

    // Adjust query dynamically based on the plant
    let query = '';
    if (plant === '32tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS YearTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy') = @date;
      `;
    } else if (plant === 'NicoSteel') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS YearTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy') = @date;
      `;
    }
    else if (plant === 'Sweelee') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS YearTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy') = @date;
      `;
    }
    else if (plant === 'SLS') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS YearTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy') = @date;
      `;
    }
     else {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000000, 2) AS YearTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @plant
          AND FORMAT([time], 'yyyy') = @date;
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
  getYearTotalPower,
};
