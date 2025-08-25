const sql = require('mssql');
const config = require('../config/config');

async function getLatestPowerOutput(Date, plant) {
  try {
    const pool = await sql.connect(config.db);

    // Set device models based on the plant
    let deviceModels;
    if (plant === 'Bodyknits') {
      deviceModels = "('100KTL-M1', '30KTL-M3')";
    } else if (plant === 'Sweelee') {
      deviceModels = "('SUN2000-60KTL-M0', 'SUN2000-50KTL-M3')";
    }else if (plant === '32tuas') {
      deviceModels = "('115KTL-M2', '100KTL-M2')";
    }else if (plant === '36tuas') {
      deviceModels = "('115KTL-M2', '50KTL-M3')";
    }else if (plant === '40tuas') {
      deviceModels = "('115KTL-M2')";
    } else if (plant === '73tuas') {
      deviceModels = "('115KTL-M2')";
     
     } else if (plant === '80tuas') {
        deviceModels = "('115KTL-M2a','115KTL-M2b','115KTL-M2c')";
      
    }else if (plant === '15Tech') {
      deviceModels = "('115KTL-M2')";
    }else if (plant === 'NicoSteel') {
      deviceModels = "('100KTL-M2')";
    }else if (plant === 'Demo') {
      deviceModels = "('100KTL-M2')";
    }else if (plant === 'SLS') {
      deviceModels = "('60KTL-M0', '50KTL-M3')";
    }else if (plant === '110tuas1') {
      deviceModels = "('125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc', '125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg')";
    }
    else if (plant === '110tuas2') {
      deviceModels = "('125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc', '125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg')";
    }
    else {
      throw new Error('Unknown plant');
    }

    const query = `
      DECLARE @TodayDate DATE = @Date;

      SELECT TOP 1
        SUM(i.ActivePower) AS LatestPowerOutput
      FROM Inverter i
      WHERE
        CAST(i.time AS DATE) = @TodayDate
        AND i.plant = @plant
        AND i.DeviceModel IN ${deviceModels}
      GROUP BY FORMAT(i.time, 'HH:mm')
      ORDER BY MAX(i.time) DESC;
    `;

    const request = pool.request();
    request.input('Date', sql.Date, Date);
    request.input('plant', sql.NVarChar(100), plant);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      const latestPower = parseFloat(result.recordset[0].LatestPowerOutput).toFixed(2);

      const formattedResult = {
        data: {
          latestPowerOut: latestPower,
        },
        success: true,
        failCode: 0,
      };

      return formattedResult;
    } else {
      return {
        data: null,
        success: false,
        failCode: 1,
        message: 'No data found for the specified plant and date',
      };
    }

  } catch (err) {
    console.error('Error fetching latest power output:', err);
    throw new Error('Error fetching latest power output');
  }
}

module.exports = {
  getLatestPowerOutput
};
