
const sql = require('mssql');
const config = require('../../config/config');

const getLifetimeData = async (plant) => {
    const pool = await sql.connect(config.db);


    let deviceModel100KTL, deviceModel30KTL,deviceModel115KTL;
    
    let deviceModel4 = '', deviceModel5 = '', deviceModel6 = '', deviceModel7 = '';


    if (plant === "Bodyknits") {
        deviceModel100KTL = '100KTL-M1';
        deviceModel30KTL = '30KTL-M3';
        deviceModel115KTL='';
    } else if (plant === "Sweelee") {
        deviceModel100KTL = 'SUN2000-60KTL-M0';
        deviceModel30KTL = 'SUN2000-50KTL-M3';
        deviceModel115KTL='';
    } else if (plant === "32tuas") {
        deviceModel100KTL = '115KTL-M2';
        deviceModel30KTL = '100KTL-M2';
        deviceModel115KTL='';
    }else if (plant === "36tuas") {
        deviceModel100KTL = '115KTL-M2';
        deviceModel30KTL = '50KTL-M3';
        deviceModel115KTL='';
    }else if (plant === "NicoSteel") {
        deviceModel100KTL = '100KTL-M2';
        deviceModel30KTL = '';
        deviceModel115KTL='';
    }else if (plant === "Demo") {
        deviceModel100KTL = '100KTL-M2';
        deviceModel30KTL = '';
        deviceModel115KTL='';
    }else if (plant === "40tuas") {
        deviceModel100KTL = '115KTL-M2';
        deviceModel30KTL = '';
        deviceModel115KTL='';
    }
    else if (plant === "73tuas") {
        deviceModel100KTL = '115KTL-M2';
        deviceModel30KTL = '';
        deviceModel115KTL='';
    }else if (plant === "15Tech") {
        deviceModel100KTL = '115KTL-M2';
        deviceModel30KTL = '';
        deviceModel115KTL='';
    }
    else if (plant === "80tuas") {
        deviceModel100KTL = '115KTL-M2a';
        deviceModel30KTL = '115KTL-M2b';
        deviceModel115KTL= '115KTL-M2c';
    }
    else if (plant === "SLS") {
        deviceModel100KTL = '50KTL-M3';
        deviceModel30KTL = '60KTL-M0';
       
    }    else if (plant === "110tuas1") {
    deviceModel100KTL = '125KTL3-Xa';
    deviceModel30KTL = '125KTL3-Xb';
    deviceModel115KTL = '125KTL3-Xc';
    deviceModel4 = '125KTL3-Xd';
    deviceModel5 = '125KTL3-Xe';
    deviceModel6 = '110KTL3-Xf';
    deviceModel7 = '110KTL3-Xg';
}
else if (plant === "110tuas2") {
    deviceModel100KTL = '125KTL3-Xa';
    deviceModel30KTL = '125KTL3-Xb';
    deviceModel115KTL = '125KTL3-Xc';
    deviceModel4 = '125KTL3-Xd';
    deviceModel5 = '125KTL3-Xe';
    deviceModel6 = '110KTL3-Xf';
    deviceModel7 = '110KTL3-Xg';
}

        else {
        throw new Error('Unsupported plant name');
    }

    const query = `
        WITH Months AS (
            SELECT 1 AS MonthNumber
            UNION ALL SELECT 2
            UNION ALL SELECT 3
            UNION ALL SELECT 4
            UNION ALL SELECT 5
            UNION ALL SELECT 6
            UNION ALL SELECT 7
            UNION ALL SELECT 8
            UNION ALL SELECT 9
            UNION ALL SELECT 10
            UNION ALL SELECT 11
            UNION ALL SELECT 12
        ),
        DailyMaxEnergy AS (
            SELECT
                CAST(time AS DATE) AS Date, -- Ensure time is treated as a Date for accurate grouping
                DeviceModel,
                MAX(DailyEnergy) AS MaxDailyEnergy
            FROM [Trek_Solar].[dbo].[Inverter]
            WHERE Plant = @inputPlant
            AND CAST([Time] AS TIME) >= '01:00:00'
            GROUP BY CAST(time AS DATE), DeviceModel
        ),
        MonthlyEnergySums AS (
            SELECT
                YEAR(Date) AS YearNumber,
                MONTH(Date) AS MonthNumber,
                SUM(CASE WHEN DeviceModel = @deviceModel100KTL THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy100KTL,
                SUM(CASE WHEN DeviceModel = @deviceModel30KTL THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy30KTL,
                 SUM(CASE WHEN DeviceModel = @deviceModel115KTL THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy115KTL,
                 SUM(CASE WHEN DeviceModel = @deviceModel4 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy4,
                SUM(CASE WHEN DeviceModel = @deviceModel5 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy5,
               SUM(CASE WHEN DeviceModel = @deviceModel6 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy6,
               SUM(CASE WHEN DeviceModel = @deviceModel7 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergy7
                FROM DailyMaxEnergy
            GROUP BY YEAR(Date), MONTH(Date)
        ),
        YearlyTotalEnergy AS (
            SELECT
                YearNumber,
                CAST(ROUND(SUM(SummedMaxEnergy100KTL + 
                SummedMaxEnergy30KTL + 
                SummedMaxEnergy115KTL +
                SummedMaxEnergy4 +
                SummedMaxEnergy5 +
                SummedMaxEnergy6 +
                SummedMaxEnergy7
                ), 2) AS VARCHAR) AS TotalYearlyEnergy
            FROM MonthlyEnergySums
            GROUP BY YearNumber
        )

        SELECT
            CONCAT('[[', STRING_AGG(QUOTENAME(CAST(YearNumber AS VARCHAR(10)), '""'), ','), '],[', STRING_AGG(CAST(TRIM(TotalYearlyEnergy) AS VARCHAR(20)), ','), ']]') AS Combined
        FROM YearlyTotalEnergy
    `;

    try {
        const result = await pool.request()
            .input('inputPlant', sql.VarChar, plant)
            .input('deviceModel100KTL', sql.VarChar, deviceModel100KTL)
            .input('deviceModel30KTL', sql.VarChar, deviceModel30KTL)
            .input('deviceModel115KTL', sql.VarChar, deviceModel115KTL)
            .input('deviceModel4', sql.VarChar, deviceModel4)
            .input('deviceModel5', sql.VarChar, deviceModel5)
            .input('deviceModel6', sql.VarChar, deviceModel6)
            .input('deviceModel7', sql.VarChar, deviceModel7)

            .query(query);

        const lifetimeData = result.recordset[0].Combined;
        const parsedData = JSON.parse(lifetimeData);

        const response = {
            data: {
                xAxis: parsedData[0],
                "Yield kWh": parsedData[1].map(value => parseFloat(value)), 
            }
        };

        return response;
    } catch (err) {
        throw new Error('Database query error: ' + err.message);
    }
};

module.exports = {
    getLifetimeData
};
