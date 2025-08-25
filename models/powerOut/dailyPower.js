
const sql = require('mssql');
const config = require('../../config/config');

async function getDailyIrradiance(Date, plant) {
  try {
    const pool = await sql.connect(config.db);
    
    const query=`

  DECLARE @TodayDate DATE = @Date;

WITH TimeData AS (
    SELECT FORMAT(time, 'HH:mm') AS FormattedTime
    FROM EMI5
    WHERE CAST(time AS TIME) BETWEEN '06:00:00' AND '20:00:00'
      AND CAST(time AS DATE) = @TodayDate
      AND plant = @plant
    GROUP BY FORMAT(time, 'HH:mm')
), IrradData AS (
    SELECT
        FORMAT(time, 'HH:mm') AS FormattedTime,
        SUM(Irrad) AS TotalIrrad
    FROM EMI5
    WHERE CAST(time AS TIME) BETWEEN '06:00:00' AND '20:00:00'
      AND CAST(time AS DATE) = @TodayDate
      AND plant = @plant
    GROUP BY FORMAT(time, 'HH:mm')
), PowerData AS (
    SELECT
        FORMAT(time, 'HH:mm') AS FormattedTime,
        SUM(ActivePower) AS TotalActivePower
    FROM Inverter
    WHERE CAST(time AS TIME) BETWEEN '06:00:00' AND '20:00:00'
      AND CAST(time AS DATE) = @TodayDate
      AND plant = @plant
    GROUP BY FORMAT(time, 'HH:mm')
), CombinedData AS (
    SELECT
        t.FormattedTime,
        COALESCE(i.TotalIrrad, 0) AS TotalIrrad,
        COALESCE(p.TotalActivePower, 0) AS TotalActivePower
    FROM TimeData t
    LEFT JOIN IrradData i ON t.FormattedTime = i.FormattedTime
    LEFT JOIN PowerData p ON t.FormattedTime = p.FormattedTime
)
SELECT
    STRING_AGG(c.FormattedTime, ', ') WITHIN GROUP (ORDER BY c.FormattedTime) AS TimeArray,
    STRING_AGG(CAST(c.TotalIrrad AS VARCHAR), ', ') WITHIN GROUP (ORDER BY c.FormattedTime) AS IrradArray,
    STRING_AGG(CAST(c.TotalActivePower AS VARCHAR), ', ') WITHIN GROUP (ORDER BY c.FormattedTime) AS PowerArray,
    SUM(c.TotalActivePower) AS TotalPower
FROM CombinedData c 
WHERE NOT (c.FormattedTime >= '07:00' AND c.TotalActivePower = 0);

`;
 
    const request = pool.request();
    request.input('Date', sql.Date, Date);
    request.input('plant', sql.NVarChar(100), plant);

    const result = await request.query(query);

    const formattedResult = {
      data: {
        xAxis: result.recordset[0].TimeArray.split(', ').map(time => `${time}`),
        "Irradiance W/m2": result.recordset[0].IrradArray.split(', ').map(value => parseFloat(value)),
        "PowerOut kW": result.recordset[0].PowerArray.split(', ').map(value => parseFloat(value).toFixed(3)),
        totalUsePower: parseFloat(result.recordset[0].TotalPower).toFixed(3)
      },
      success: true,
      failCode: 0
    };

    return formattedResult;
  } catch (err) {
    console.error('Error fetching daily irradiance data:', err);
    throw new Error('Error fetching daily irradiance data');
  }
}

module.exports = {
  getDailyIrradiance
};
