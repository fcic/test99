
const sql = require('mssql');
const config = require('../config/config');

const getReportData = async (year, plant) => {
    try {
        let pool = await sql.connect(config.db);

        // Assign device models and energy factor based on the plant
        let deviceModel1, deviceModel2, deviceModel3,deviceModel4,deviceModel5,deviceModel6,deviceModel7, energyFactor;
        if (plant === "Bodyknits") {
            deviceModel1 = '100KTL-M1';
            deviceModel2 = '30KTL-M3';
            energyFactor = 147.42;
        } else if (plant === "Sweelee") {
            deviceModel1 = 'SUN2000-60KTL-M0';
            deviceModel2 = 'SUN2000-50KTL-M3';
            energyFactor = 134.865;
        } else if (plant.toLowerCase() === "32tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '100KTL-M2';
            energyFactor = 242.77;
        }else if (plant.toLowerCase() === 'nicosteel') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = null; 
            energyFactor = 115.83;
          }else if (plant.toLowerCase() === "36tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '50KTL-M3';
            energyFactor = 189.54;
        }
        else if (plant.toLowerCase() === "40tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 119.34;
        } else if (plant.toLowerCase() === "73tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 103.54;
        }else if (plant.toLowerCase() === "15tech") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            energyFactor = 91.845;
        } else if (plant.toLowerCase() === "80tuas") {
            deviceModel1 = '115KTL-M2a';
            deviceModel2 = '115KTL-M2b';
            deviceModel3='115KTL-M2c';
            energyFactor = 375.2;
        }else if (plant === "SLS") {
            deviceModel1 = '60KTL-M0';
            deviceModel2 = '50KTL-M3';
            energyFactor = 134.865;
        } else if (plant.toLowerCase() === '110tuas1') {
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
         else {
            throw new Error(`Plant "${plant}" is not recognized.`);
        }

        // Construct the query with dynamic variables
        let query = `
            DECLARE @Year INT = ${year};
            WITH InverterAggregates AS (
                SELECT
                    FORMAT(I.[Time], 'yyyy-MM-dd') AS Day,
                    MAX(CASE WHEN I.DeviceModel = '${deviceModel1}' THEN I.DailyEnergy ELSE 0 END) AS Energy1,
                    MAX(CASE WHEN I.DeviceModel = '${deviceModel2}' THEN I.DailyEnergy ELSE 0 END) AS Energy2,
                     MAX(CASE WHEN I.DeviceModel = '${deviceModel3}' THEN I.DailyEnergy ELSE 0 END) AS Energy3,
                     MAX(CASE WHEN I.DeviceModel = '${deviceModel4}' THEN I.DailyEnergy ELSE 0 END) AS Energy4,
                     MAX(CASE WHEN I.DeviceModel = '${deviceModel5}' THEN I.DailyEnergy ELSE 0 END) AS Energy5,
                     MAX(CASE WHEN I.DeviceModel = '${deviceModel6}' THEN I.DailyEnergy ELSE 0 END) AS Energy6,
                     MAX(CASE WHEN I.DeviceModel = '${deviceModel7}' THEN I.DailyEnergy ELSE 0 END) AS Energy7
                FROM [Trek_Solar].[dbo].[Inverter] I
                WHERE I.Plant = '${plant}'
                AND YEAR(I.[Time]) = @Year
                 AND CONVERT(TIME, I.Time) > '01:00:00'
                GROUP BY FORMAT(I.[Time], 'yyyy-MM-dd')
            ), DailyMaxValues AS (
                SELECT
                    FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
                    MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
                    MAX(EMI5.Irrad) AS MaxIrrad,
                    MAX(EMI5.DailyIrrad) * 0.27778 * ${energyFactor} AS TheoreticalYield,
                    IA.Energy1 + IA.Energy2 + IA.Energy3 +IA.Energy4 + IA.Energy5 + IA.Energy6 + IA.Energy7 AS InverterYield
                FROM  EMI5
                LEFT JOIN InverterAggregates IA ON FORMAT(EMI5.[Time], 'yyyy-MM-dd') = IA.Day
                WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
                AND EMI5.Plant = '${plant}'
                AND YEAR(EMI5.Time) = @Year
                GROUP BY FORMAT(EMI5.[Time], 'yyyy-MM-dd'), IA.Energy1, IA.Energy2,IA.Energy3,IA.Energy4,IA.Energy5,IA.Energy6,IA.Energy7
            ), MonthlyValues AS (
                SELECT
                    FORMAT(CONVERT(DATE, Day), 'yyyy-MM') AS StatisticalPeriod,
                    SUM(MaxDailyIrradiance) AS DailyIrradiance,
                    SUM(MaxIrrad) AS MaxIrrad,
                    SUM(TheoreticalYield) AS TheoreticalYield,
                    SUM(InverterYield) AS PVYield
                FROM DailyMaxValues
                GROUP BY FORMAT(CONVERT(DATE, Day), 'yyyy-MM')
            )

            SELECT JSON_QUERY('{"success": true, "data": ' + 
                '[' + STRING_AGG(CONCAT(
                    '{', 
                    '"Statistical Period":"', StatisticalPeriod, '",',
                    '"Daily Irradiance":', ROUND(DailyIrradiance, 2), ',',
                    '"Irradiance (W/m²)":', MaxIrrad, ',',
                    '"Theoretical Yield (kWh)":', ROUND(TheoreticalYield, 2), ',',
                    '"PV Yield (kWh)":', PVYield, ',',
                    '"Inverter Yield (kWh)":', PVYield, ',',
                    '"Performance_ratio (%)":', ROUND((PVYield / NULLIF(TheoreticalYield, 0)) * 100, 2),
                    '}'
                    ), ',') WITHIN GROUP (ORDER BY StatisticalPeriod) + ']}') AS response
            FROM MonthlyValues;
        `;

        const result = await pool.request().query(query);
        return JSON.parse(result.recordset[0].response);
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getReportData
};
