
const sql = require('mssql');
const config = require('../../config/config');

async function getYearlyData(plant, date) {
    try {
        let pool = await sql.connect(config.db);

        const yearParam = new Date(date).getFullYear();

        let deviceModel1 = '100KTL-M1';
        let deviceModel2 = '30KTL-M3';
        let deviceModel3='';
         let deviceModel4 = '', deviceModel5 = '', deviceModel6 = '', deviceModel7 = '';



        if (plant.toLowerCase() === "sweelee") {
            deviceModel1 = 'SUN2000-60KTL-M0';
            deviceModel2 = 'SUN2000-50KTL-M3';
           
        } else if (plant.toLowerCase() === "32tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '100KTL-M2';
           
        }
        else if (plant.toLowerCase() === "36tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '50KTL-M3';
            
        } else if (plant.toLowerCase() === "40tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
        }else if (plant.toLowerCase() === "73tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
        }else if (plant.toLowerCase() === "15tech") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
        }else if (plant.toLowerCase() === "80tuas") {
            deviceModel1 = '115KTL-M2a';
            deviceModel2 = '115KTL-M2b';
            deviceModel3='115KTL-M2c';
        }else if (plant.toLowerCase() === 'nicosteel') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = null; 
          
          }else if (plant.toLowerCase() === 'demo') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = null; 
            
          }else if (plant.toLowerCase() === 'sls') {
            deviceModel1 = '60KTL-M0';
          deviceModel2 = '50KTL-M3'; 
           
          } else if (plant.toLowerCase() === "110tuas1") {
             deviceModel1 = '125KTL3-Xa';
             deviceModel2 = '125KTL3-Xb';
             deviceModel3 = '125KTL3-Xc';
             deviceModel4 = '125KTL3-Xd';
             deviceModel5 = '125KTL3-Xe';
             deviceModel6 = '110KTL3-Xf';
            deviceModel7 = '110KTL3-Xg';
           
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
        DECLARE @Year INT = ${yearParam};
        DECLARE @JanIrrad FLOAT = 0, @FebIrrad FLOAT = 0, @MarIrrad FLOAT = 0, @AprIrrad FLOAT = 0, @MayIrrad FLOAT = 0, @JunIrrad FLOAT = 0,
                @JulIrrad FLOAT = 0, @AugIrrad FLOAT = 0, @SepIrrad FLOAT = 0, @OctIrrad FLOAT = 0, @NovIrrad FLOAT = 0, @DecIrrad FLOAT = 0,
                @JanYield FLOAT = 0, @FebYield FLOAT = 0, @MarYield FLOAT = 0, @AprYield FLOAT = 0, @MayYield FLOAT = 0, @JunYield FLOAT = 0,
                @JulYield FLOAT = 0, @AugYield FLOAT = 0, @SepYield FLOAT = 0, @OctYield FLOAT = 0, @NovYield FLOAT = 0, @DecYield FLOAT = 0;

        WITH InverterAggregates AS (
    SELECT
        CAST(I.[Time] AS DATE) AS Day,
        MAX(CASE WHEN I.DeviceModel = '${deviceModel1}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel2}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel3}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel4}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel5}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel6}' THEN I.DailyEnergy ELSE 0 END) +
        MAX(CASE WHEN I.DeviceModel = '${deviceModel7}' THEN I.DailyEnergy ELSE 0 END)
        AS Energy
    FROM [Trek_Solar].[dbo].[Inverter] I
    WHERE I.Plant = '${plant}'
      AND YEAR(I.[Time]) = @Year
      AND CAST(I.[Time] AS TIME) >= '01:00:00' 
    GROUP BY CAST(I.[Time] AS DATE)
),

        DailyMaxValues AS (
            SELECT
                FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
                MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
                MAX(EMI5.Irrad) AS MaxIrradiance,
               
                COALESCE(IA.Energy, 0) AS InverterYield
            FROM [Trek_Solar].[dbo].[EMI5] EMI5
            LEFT JOIN InverterAggregates IA ON FORMAT(EMI5.[Time], 'yyyy-MM-dd') = IA.Day
            WHERE CAST(EMI5.[Time] AS TIME) > '01:00:00'
                AND EMI5.Plant = '${plant}'
                AND YEAR(EMI5.[Time]) = @Year
            GROUP BY FORMAT(EMI5.[Time], 'yyyy-MM-dd'), IA.Energy
        ),
        MonthlyValues AS (
            SELECT
                FORMAT(CONVERT(DATE, Day), 'yyyy-MM') AS StatisticalPeriod,
                SUM(MaxDailyIrradiance) AS DailyIrradiance,
                SUM(MaxIrradiance) AS Irradiance,
             
                SUM(InverterYield) AS TotalInverterYield
            FROM DailyMaxValues
            GROUP BY FORMAT(CONVERT(DATE, Day), 'yyyy-MM')
        )
        SELECT
            StatisticalPeriod,
            SUM(DailyIrradiance) AS TotalDailyIrradiance,
            SUM(TotalInverterYield) AS TotalInverterYield
        FROM MonthlyValues
        GROUP BY StatisticalPeriod
        ORDER BY StatisticalPeriod ASC;
    `;
        let result = await pool.request().query(query);

        // Format the response
        const getMonthName = (monthNumber) => {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return monthNames[monthNumber - 1];
        };

        let response = {
            data: {
                xAxis: result.recordset.map(row => {
                    const [year, month] = row.StatisticalPeriod.split("-");
                    return getMonthName(parseInt(month));
                }),
                "Irradiation kWh/m2": result.recordset.map(row => row.TotalDailyIrradiance.toFixed(3)),
                stationDn: plant,
                "Yield kWh": result.recordset.map(row => row.TotalInverterYield.toFixed(1)),
                totalUsePower: result.recordset.reduce((acc, row) => acc + parseFloat(row.TotalInverterYield), 0).toFixed(2)
            },
            success: true,
            failCode: 0
        };

        return response;

    } catch (err) {
        console.error(err);
        throw new Error('Error fetching yearly data');
    }
}

module.exports = { getYearlyData };
