const sql = require('mssql');
const config = require('../config/config');

async function getMonthlyReport(plant, month) {
    try {
        let pool = await sql.connect(config.db);

        let deviceModel1, deviceModel2, deviceModel3,deviceModel4,deviceModel5,deviceModel6,deviceModel7, energyFactor;
        if (plant === "Bodyknits") {
            deviceModel1 = '100KTL-M1';
            deviceModel2 = '30KTL-M3';
            energyFactor = 147.42;
        } else if (plant === "Sweelee") {
            deviceModel1 = 'SUN2000-60KTL-M0';
            deviceModel2 = 'SUN2000-50KTL-M3';
            energyFactor = 134.865;
        }else if (plant.toLowerCase() === "32tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '100KTL-M2';
            energyFactor = 242.77;
        }else if (plant.toLowerCase() === 'nicosteel') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = null; 
            energyFactor = 115.83;
          }
          else if (plant.toLowerCase() === "36tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '50KTL-M3';
            energyFactor = 189.54;
        }
        else if (plant.toLowerCase() === "40tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 119.34;
        }
        else if (plant.toLowerCase() === "73tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 103.54;
        }
        else if (plant.toLowerCase() === "80tuas") {
            deviceModel1 = '115KTL-M2a';
            deviceModel2 = '115KTL-M2b';
            deviceModel3='115KTL-M2c';
            energyFactor = 375.2;
        } else if (plant.toLowerCase() === "15tech") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 91.845;
        }
        else if (plant === "SLS") {
            deviceModel1 = '60KTL-M0';
            deviceModel2 = '50KTL-M3';
            energyFactor = 134.865;
        }
        else if (plant.toLowerCase() === '110tuas1') {
        deviceModel1 = '125KTL3-Xa';
        deviceModel2 = '125KTL3-Xb';
        deviceModel3 = '125KTL3-Xc';
        deviceModel4 = '125KTL3-Xd';
         deviceModel5 = '125KTL3-Xe';
         deviceModel6 = '110KTL3-Xf';
         deviceModel7 = '110KTL3-Xg';
          energyFactor = 1049.61;
         }
         else if (plant.toLowerCase() === '110tuas2') {
            deviceModel1 = '125KTL3-Xa';
            deviceModel2 = '125KTL3-Xb';
            deviceModel3 = '125KTL3-Xc';
            deviceModel4 = '125KTL3-Xd';
             deviceModel5 = '125KTL3-Xe';
             deviceModel6 = '110KTL3-Xf';
             deviceModel7 = '110KTL3-Xg';
              energyFactor = 1049.61;
             }

let query = `
DECLARE @TargetDate AS VARCHAR(7) = @month;
DECLARE @Results NVARCHAR(MAX);

;WITH InverterPerModel AS (
    SELECT 
        CONVERT(DATE, I.Time) AS ReportDate,
        I.DeviceModel,
        MAX(I.DailyEnergy) AS MaxEnergy
    FROM [Trek_Solar].[dbo].[Inverter] I
    WHERE I.Plant = @plant
        AND I.DeviceModel IN (@deviceModel1, @deviceModel2, @deviceModel3, @deviceModel4, @deviceModel5, @deviceModel6, @deviceModel7)
        AND CONVERT(VARCHAR(7), I.Time, 120) = @TargetDate
         AND CAST(I.Time AS TIME) > '01:00:00'
    GROUP BY CONVERT(DATE, I.Time), I.DeviceModel
),
InverterDailyYield AS (
    SELECT 
        ReportDate,
        SUM(MaxEnergy) AS TotalDailyEnergy
    FROM InverterPerModel
    GROUP BY ReportDate
),
IrradianceDaily AS (
    SELECT 
        CONVERT(DATE, EMI5.Time) AS ReportDate,
        MAX(EMI5.DailyIrrad) * 0.27778 AS IrradKWhPerM2,
        MAX(EMI5.Irrad) AS MaxIrrad,
        MAX(EMI5.DailyIrrad) * 0.27778 * @energyFactor AS TheoreticalEnergy
    FROM [Trek_Solar].[dbo].[EMI5] EMI5
    WHERE CONVERT(VARCHAR(7), EMI5.Time, 120) = @TargetDate
        AND CAST(EMI5.Time AS TIME) > '01:00:00'
        AND EMI5.Plant = @plant
    GROUP BY CONVERT(DATE, EMI5.Time)
)

SELECT @Results = (
    SELECT 
        CONVERT(VARCHAR, I.ReportDate, 120) AS [dateRange],
        CAST(ROUND(I.IrradKWhPerM2, 2) AS VARCHAR) AS [irradDifference],
        CAST(ROUND(I.MaxIrrad, 2) AS VARCHAR) AS [maxIrrad],
        CAST(ROUND(I.TheoreticalEnergy, 2) AS VARCHAR) AS [calculatedEnergy],
        CAST(ROUND(ISNULL(Y.TotalDailyEnergy, 0), 2) AS VARCHAR) AS [energyDifference],
        CAST(ROUND(
            ISNULL(
                (Y.TotalDailyEnergy / NULLIF(I.TheoreticalEnergy, 0)) * 100, 0
            ), 2) AS VARCHAR) AS [performancePercentage],
        '' AS [other],
        '' AS [additionalInfo]
    FROM IrradianceDaily I
    LEFT JOIN InverterDailyYield Y ON I.ReportDate = Y.ReportDate
    ORDER BY I.ReportDate
    FOR JSON PATH
)

SELECT @Results AS CombinedResult;
`;

        let result = await pool.request()
            .input('month', sql.VarChar, month)
            .input('plant', sql.VarChar, plant)
            .input('deviceModel1', sql.VarChar, deviceModel1)
            .input('deviceModel2', sql.VarChar, deviceModel2)
            .input('deviceModel3', sql.VarChar, deviceModel3)
            .input('deviceModel4', sql.NVarChar, deviceModel4)
            .input('deviceModel5', sql.NVarChar, deviceModel5)
            .input('deviceModel6', sql.NVarChar, deviceModel6)
            .input('deviceModel7', sql.NVarChar, deviceModel7)
            .input('energyFactor', sql.Float, energyFactor)
            .query(query);

    
        //console.log(result.recordset[0].CombinedResult);

        let dataArray = JSON.parse(result.recordset[0].CombinedResult);
        
        function formatData(dataArray) {
            return dataArray.map(item => {
               
                if (item && typeof item === 'object') {
                    return {
                        "Statistical Period": item.dateRange,
                        "Daily Irradiance (kWh/m²)": parseFloat(item.irradDifference),
                        "Irradiance (W/m²)": parseInt(item.maxIrrad, 10),
                        "Theoretical Yield (kWh)": parseFloat(item.calculatedEnergy),
                        "PV Yield (kWh)": parseFloat(item.energyDifference),
                        "Inverter Yield (kWh)": parseFloat(item.energyDifference),
                        "Performance_ratio (%)":parseFloat(item.performancePercentage),
                    };
                }
                
                console.error('Unexpected data format:', item);
                return null;
            }).filter(item => item !== null); 
        }
        
        const formattedData = formatData(dataArray);
       // console.log(formattedData);

        return formattedData;

    } catch (err) {
        throw new Error(`Error fetching monthly report data: ${err.message}`);
    }
}

module.exports = {
    getMonthlyReport
};
