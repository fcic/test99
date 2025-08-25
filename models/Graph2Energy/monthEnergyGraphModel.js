const sql = require('mssql');
const config = require('../../config/config');

const getEnergyData = async (plant, Date) => {
    const pool = await sql.connect(config.db);

    // Define device models for different plants
    const deviceModels = {
        "Bodyknits": ['100KTL-M1', '30KTL-M3'],
        "Sweelee": ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3'],
        "32tuas":['115KTL-M2','100KTL-M2'],
        "36tuas":['115KTL-M2','50KTL-M3'],
        "80tuas":['115KTL-M2a','115KTL-M2b','115KTL-M2c'],
        "40tuas":['115KTL-M2'],
        "73tuas":['115KTL-M2'],
        "15Tech":['115KTL-M2'],
        "NicoSteel":['100KTL-M2'],
        "Demo":['100KTL-M2'],
        "SLS":['60KTL-M0','50KTL-M3'],
        "110tuas1": [ '125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg'],
        "110tuas2": [ '125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg']


        
    };

    const models = deviceModels[plant] || [];

    const deviceModel1 = models[0] || null;
    const deviceModel2 = models[1] || null;
    const deviceModel3 = models[2] || null;
    const deviceModel4 = models[3] || null;
    const deviceModel5 = models[4] || null;
    const deviceModel6 = models[5] || null;
     const deviceModel7 = models[6] || null;

    const query = `
        DECLARE @Month DATE = @inputDate + '-01'; -- Set to the first day of the desired month

        WITH EnergyAggregation AS (
            SELECT
                [Date],
                SUM(MaxDailyEnergy) AS SummedDailyEnergy
            FROM (
                SELECT
                    DAY([time]) AS [Date],
                    MAX(DailyEnergy) AS MaxDailyEnergy
                FROM
                    inverter
                WHERE
                    [time] >= @Month
                AND [time] < DATEADD(MONTH, 1, @Month)
                AND CAST([time] AS TIME) >= '01:00:00'
                    AND plant = @inputPlant
                    AND DeviceModel = @deviceModel1
                GROUP BY
                    DAY([time])

                UNION ALL

                SELECT
                    DAY([time]) AS [Date],
                    MAX(DailyEnergy) AS SummedDailyEnergy
                FROM
                    inverter
                WHERE
                    [time] >= @Month
                AND [time] < DATEADD(MONTH, 1, @Month)
                AND CAST([time] AS TIME) >= '01:00:00'
                    AND plant = @inputPlant
                    AND DeviceModel = @deviceModel2
                GROUP BY
                    DAY([time])

              UNION ALL
              
              SELECT
                    DAY([time]) AS [Date],
                    MAX(DailyEnergy) AS MaxDailyEnergy
                FROM
                    inverter
                WHERE
                    [time] >= @Month
                AND [time] < DATEADD(MONTH, 1, @Month)
                AND CAST([time] AS TIME) >= '01:00:00'
                    AND plant = @inputPlant
                    AND DeviceModel = @deviceModel3
                GROUP BY
                    DAY([time])     
                    
                    UNION ALL
SELECT
    DAY([time]) AS [Date],
    MAX(DailyEnergy) AS MaxDailyEnergy
FROM inverter
WHERE [time] >= @Month
  AND [time] < DATEADD(MONTH, 1, @Month)
  AND CAST([time] AS TIME) >= '01:00:00'
  AND plant = @inputPlant
  AND DeviceModel = @deviceModel4
GROUP BY DAY([time])

UNION ALL
SELECT
    DAY([time]) AS [Date],
    MAX(DailyEnergy) AS MaxDailyEnergy
FROM inverter
WHERE [time] >= @Month
  AND [time] < DATEADD(MONTH, 1, @Month)
  AND CAST([time] AS TIME) >= '01:00:00'
  AND plant = @inputPlant
  AND DeviceModel = @deviceModel5
GROUP BY DAY([time])

UNION ALL
SELECT
    DAY([time]) AS [Date],
    MAX(DailyEnergy) AS MaxDailyEnergy
FROM inverter
WHERE [time] >= @Month
  AND [time] < DATEADD(MONTH, 1, @Month)
  AND CAST([time] AS TIME) >= '01:00:00'
  AND plant = @inputPlant
  AND DeviceModel = @deviceModel6
GROUP BY DAY([time])

UNION ALL
SELECT
    DAY([time]) AS [Date],
    MAX(DailyEnergy) AS MaxDailyEnergy
FROM inverter
WHERE [time] >= @Month
  AND [time] < DATEADD(MONTH, 1, @Month)
  AND CAST([time] AS TIME) >= '01:00:00'
  AND plant = @inputPlant
  AND DeviceModel = @deviceModel7
GROUP BY DAY([time])


            ) AS DeviceMaxDailyEnergy
            GROUP BY
                [Date]
        )

        SELECT
            CONCAT('[[', STRING_AGG(CAST([Date] AS VARCHAR), ', ') WITHIN GROUP (ORDER BY [Date]), '],',
                   '[', STRING_AGG(CAST(SummedDailyEnergy AS VARCHAR), ', ') WITHIN GROUP (ORDER BY [Date]), ']]') AS EnergyArray
        FROM
            EnergyAggregation;
    `;

    try {
        const result = await pool.request()
            .input('inputPlant', sql.VarChar, plant)
            .input('inputDate', sql.VarChar, Date)
            .input('deviceModel1', sql.VarChar, deviceModel1)
            .input('deviceModel2', sql.VarChar, deviceModel2)
            .input('deviceModel3', sql.VarChar, deviceModel3)
            .input('deviceModel4', sql.VarChar, deviceModel4)
            .input('deviceModel5', sql.VarChar, deviceModel5)
            .input('deviceModel6', sql.VarChar, deviceModel6)
            .input('deviceModel7', sql.VarChar, deviceModel7)

            .query(query);
        const energyArray = result.recordset[0].EnergyArray;
        const parsedArray = JSON.parse(energyArray);

        const response = {
            data: {
                xAxis: parsedArray[0],
                "Yield kWh": parsedArray[1].map(value => parseFloat(value)), 
            }
        };

        return response;
    } catch (err) {
        throw new Error('Database query error: ' + err.message);
    } 
    
};

module.exports = {
    getEnergyData
};
