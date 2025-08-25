
const sql = require('mssql');
const config = require('../../config/config');

async function getLMData(plant, LM) {
  try {
    const pool = await sql.connect(config.db);
    let deviceModel1 = '100KTL-M1';
        let deviceModel2 = '30KTL-M3';
        let deviceModel3='';
        let deviceModel4 = '', deviceModel5 = '', deviceModel6 = '', deviceModel7 = '';
        let theoreticalYieldFactor = 147.42;

        if (plant.toLowerCase() === "sweelee") {
            deviceModel1 = 'SUN2000-60KTL-M0';
            deviceModel2 = 'SUN2000-50KTL-M3';
            
            theoreticalYieldFactor = 134.865;
        }
        else if (plant.toLowerCase() === "32tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '100KTL-M2';
            theoreticalYieldFactor = 242.77;
        }
        else if (plant.toLowerCase() === "36tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '50KTL-M3';
        }
        else if (plant.toLowerCase() === "80tuas") {
            deviceModel1 = '115KTL-M2a';
            deviceModel2 = '115KTL-M2b';
            deviceModel3='115KTL-M2c'
        }else if (plant.toLowerCase() === "40tuas") {
            deviceModel1 = '';
            deviceModel2 = '115KTL-M2';
        }else if (plant.toLowerCase() === "73tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '';
        }
        else if (plant.toLowerCase() === "15tech") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '';
        } else if (plant.toLowerCase() === 'nicosteel') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = ''; 
            theoreticalYieldFactor = 115.83;
          } else if (plant.toLowerCase() === 'demo') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = ''; 

          }else if (plant.toLowerCase() === 'sls') {
            deviceModel1 = '60KTL-M0';
            deviceModel2 = '50KTL-M3';

          }else if (plant.toLowerCase() === "110tuas1") {
  deviceModel1 = '125KTL3-Xa';
  deviceModel2 = '125KTL3-Xb';
  deviceModel3 = '125KTL3-Xc';
  deviceModel4 = '125KTL3-Xd';
  deviceModel5 = '125KTL3-Xe';
  deviceModel6 = '110KTL3-Xf';
  deviceModel7 = '110KTL3-Xg';
  theoreticalYieldFactor=1049.61
 
}
else if (plant.toLowerCase() === "110tuas2") {
    deviceModel1 = '125KTL3-Xa';
    deviceModel2 = '125KTL3-Xb';
    deviceModel3 = '125KTL3-Xc';
    deviceModel4 = '125KTL3-Xd';
    deviceModel5 = '125KTL3-Xe';
    deviceModel6 = '110KTL3-Xf';
    deviceModel7 = '110KTL3-Xg';
  }

    const query = `
    DECLARE @Month DATE = '${LM}-01';

    ;WITH CombinedData AS (
        SELECT 
            DAY(E.time) AS DayOfMonth, 
            MAX(E.DailyIrrad) * 0.27778 AS TotalIrrad, 
            TotalActivePower = (
                SELECT SUM(MaxDailyEnergy)
                FROM (
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel2}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)
                    UNION ALL
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel1}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)
                            UNION ALL
                         SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel3}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)

                       UNION ALL
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel4}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)
                        UNION ALL
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel5}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)
                        UNION ALL
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel6}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)
                        UNION ALL
                    SELECT
                        DAY(i.time) AS [Date],
                        MAX(i.DailyEnergy) AS MaxDailyEnergy
                    FROM
                        inverter i
                    WHERE
                        i.[time] >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month), 0) AS DATE)
                        AND i.[time] < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, @Month) + 1, 0) AS DATE)
                          AND CAST(i.[time] AS TIME) >= '01:00:00' 
                        AND i.DeviceModel = '${deviceModel7}'
                        AND DAY(i.time) = DAY(E.time)
                        AND i.Plant = @plant
                    GROUP BY
                        DAY(i.time)



                ) AS DeviceMaxDailyEnergy
            )
        FROM EMI5 E
        INNER JOIN Inverter I ON DAY(E.time) = DAY(I.time) AND MONTH(E.time) = MONTH(I.time) AND YEAR(E.time) = YEAR(I.time)
        WHERE MONTH(E.time) = MONTH(@Month) AND YEAR(E.time) = YEAR(@Month)
              AND CAST(E.Time AS TIME) > '01:00:00' AND E.Plant = @plant AND I.Plant = @plant
        GROUP BY DAY(E.time)
    )

      SELECT 
          STRING_AGG(CONCAT('["', CONVERT(VARCHAR, DayOfMonth), '"]'), ', ')
 
              WITHIN GROUP (ORDER BY DayOfMonth) AS TimeArray,
          STRING_AGG(CAST(TotalIrrad AS VARCHAR), ', ') 
              WITHIN GROUP (ORDER BY DayOfMonth) AS IrradArray,
          STRING_AGG(CAST(TotalActivePower AS VARCHAR), ', ') 
              WITHIN GROUP (ORDER BY DayOfMonth) AS PowerArray,
          SUM(TotalActivePower) AS TotalPower
      FROM CombinedData;
    `;

    const request = pool.request();
    request.input('plant', sql.NVarChar(100), plant);

    const result = await request.query(query);

    const timeArray = result.recordset[0].TimeArray.split(', ').map(time => time.slice(2, -2));

    const formattedResult = {
      data: {
        xAxis: timeArray,
        "Irradiation kWh/m2": result.recordset[0].IrradArray.split(', ').map(value => parseFloat(value)),
    
        "Yield kWh": result.recordset[0].PowerArray.split(', ').map(value => parseFloat(value).toFixed(3)),
        totalUsePower: parseFloat(result.recordset[0].TotalPower).toFixed(3)
      },
      success: true,
      failCode: 0
    };

    return formattedResult;
  } catch (error) {
    console.error('Error fetching LM data:', error.message); 
    throw new Error('Error fetching LM data');
  }
}

module.exports = {
  getLMData
};

