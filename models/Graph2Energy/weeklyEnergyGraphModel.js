
const sql = require('mssql');
const config = require('../../config/config');

const getEnergyData = async (plant, Date) => {
    const pool = await sql.connect(config.db);

    // Device models map (same as before)
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
            .input('deviceModel1', sql.VarChar, models[0] || null)
            .input('deviceModel2', sql.VarChar, models[1] || null)
            .input('deviceModel3', sql.VarChar, models[2] || null)
            .input('deviceModel4', sql.VarChar, models[3] || null)
            .input('deviceModel5', sql.VarChar, models[4] || null)
            .input('deviceModel6', sql.VarChar, models[5] || null)
            .input('deviceModel7', sql.VarChar, models[6] || null)
            .query(query);

        const energyArray = result.recordset[0].EnergyArray;
        const parsedArray = JSON.parse(energyArray);

        const dailyDates = parsedArray[0]; // [1, 2, 3, ...]
        const dailyValues = parsedArray[1]; // [441.36, 119.03, ...]

        // Group into weeks
        const weekLabels = ["01-07", "08-14", "15-21", "22-28", "29-31"];
        const weekSums = [0, 0, 0, 0, 0];

        dailyDates.forEach((day, index) => {
            const value = dailyValues[index];
            if (day >= 1 && day <= 7) weekSums[0] += value;
            else if (day >= 8 && day <= 14) weekSums[1] += value;
            else if (day >= 15 && day <= 21) weekSums[2] += value;
            else if (day >= 22 && day <= 28) weekSums[3] += value;
            else weekSums[4] += value;
        });

        const response = {
            data: {
                xAxis: weekLabels,
                "Yield kWh": weekSums.map(v => parseFloat(v.toFixed(2)))
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
