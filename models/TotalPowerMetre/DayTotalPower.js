
const sql = require('mssql');
const config = require('../../config/config');

async function getDailyReverseActiveEnergy(plant, date) {
  try {
    const pool = await sql.connect(config);
    
    let query;
    
    if (plant === 'Bodyknits') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    } else if (plant === 'Sweelee') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === 'SLS') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }
    else if (plant === 'NicoSteel') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    } else if (plant === '32tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === '36tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === '73tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    } else if (plant === '40tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === '80tuas') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === '15Tech') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])), 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date;
      `;
    }else if (plant === '110tuas1') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date
          AND CAST([time] AS TIME) > '01:00:00';
      `;
    }else if (plant === '110tuas2') {
      query = `
        SELECT 
          ROUND((MAX([ReverseactiveEnergy]) - MIN([ReverseactiveEnergy])) / 1000, 2) AS DayTotalPower
        FROM 
          [PowerSensor]
        WHERE 
          plant = @PlantName
          AND CONVERT(date, [time]) = @Date
          AND CAST([time] AS TIME) > '01:00:00';
      `;
    }
    else {
      
      return { DayTotalPower: null }; 
    }

    const result = await pool.request()
      .input('PlantName', sql.VarChar, plant)
      .input('Date', sql.Date, date)
      .query(query);

    return result.recordset[0] || { DayTotalPower: null }; 

  } catch (error) {
    console.error('SQL error', error);
    
    return { DayTotalPower: null }; 
  }
}

module.exports = {
  getDailyReverseActiveEnergy
};
