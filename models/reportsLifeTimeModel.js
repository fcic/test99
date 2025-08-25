
// const sql = require('mssql');
// const config = require('../config/config');

// const getLifeTimeData = async (plant, dateRange) => {
//     try {
//         let pool = await sql.connect(config.db);

//         let interceptingMessage = `
// WITH InverterAggregates AS (
//     SELECT
//         CAST(I.[Time] AS DATE) AS Day,
//         MAX(CASE WHEN I.DeviceModel = '100KTL-M1' THEN I.DailyEnergy ELSE 0 END) +
//         MAX(CASE WHEN I.DeviceModel = '30KTL-M3' THEN I.DailyEnergy ELSE 0 END) +
//         MAX(CASE WHEN I.DeviceModel = 'null' THEN I.DailyEnergy ELSE 0 END) AS Energy
//     FROM [Trek_Solar].[dbo].[Inverter] I
//     WHERE I.Plant = '${plant}'
//     GROUP BY CAST(I.[Time] AS DATE)
// ),
// DailyMaxValues AS (
//     SELECT
//         FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
//         MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
//         MAX(EMI5.Irrad) AS MaxIrradiance,
//         MAX(EMI5.DailyIrrad) * 0.27778 * 147.42 AS TheoreticalYield,
//         COALESCE(IA.Energy, 0) AS InverterYield
//     FROM [Trek_Solar].[dbo].[EMI5] EMI5
//     LEFT JOIN InverterAggregates IA ON FORMAT(EMI5.[Time], 'yyyy-MM-dd') = IA.Day
//     WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
//     AND EMI5.Plant = '${plant}'
//     GROUP BY FORMAT(EMI5.[Time], 'yyyy-MM-dd'), IA.Energy
// ),
// MonthlyValues AS (
//     SELECT
//         FORMAT(CONVERT(DATE, Day), 'yyyy') AS StatisticalPeriod,
//         SUM(MaxDailyIrradiance) AS DailyIrradiance,
//         SUM(MaxIrradiance) AS Irradiance,
//         SUM(TheoreticalYield) AS TheoreticalYield,
//         SUM(InverterYield) AS TotalInverterYield
//     FROM DailyMaxValues
//     GROUP BY FORMAT(CONVERT(DATE, Day), 'yyyy')
// )
// SELECT JSON_QUERY(
//     '[' + STRING_AGG(
//         JSON_QUERY(
//             '{"Statistical Period":"' + StatisticalPeriod + '",'
//             + '"Daily Irradiance":' + CAST(ROUND(DailyIrradiance, 2) AS VARCHAR) + ','
//             + '"Irradiance (W/m²)":' + CAST(Irradiance AS VARCHAR) + ','
//             + '"Theoretical Yield (kWh)":' + CAST(ROUND(TheoreticalYield, 2) AS VARCHAR) + ','
//             + '"PV Yield (kWh)":' + CAST(ROUND(TotalInverterYield, 2) AS VARCHAR) + ','
//             + '"Inverter Yield (kWh)":' + CAST(ROUND(TotalInverterYield, 2) AS VARCHAR) + ','
//             + '"Performance_ratio (%)":' + CAST(ROUND((TotalInverterYield / NULLIF(TheoreticalYield, 0)) * 100, 1) AS VARCHAR) + '}'
//         ), ','
//     ) + ']'
// ) AS response
// FROM MonthlyValues;
// `;

        

//         if (plant === "Sweelee" && dateRange) {
//             // Specific logic for Sweelee with dateRange
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "SUN2000-60KTL-M0")
//                                                      .replace("30KTL-M3", "SUN2000-50KTL-M3")
//                                                      .replace("147.42", "134.650");
//         } else if (plant === "Sweelee") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "SUN2000-60KTL-M0")
//                                                      .replace("30KTL-M3", "SUN2000-50KTL-M3")
//                                                      .replace("147.42", "134.865");
//         } else if (plant === "32tuas") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2")
//                                                      .replace("30KTL-M3", "100KTL-M2")
//                                                      .replace("147.42", "242.77");
        
//         } else if (plant === "36tuas") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2")
//                                                      .replace("30KTL-M3", "50KTL-M3")
//                                                      .replace("147.42", "189.54");
        
//         } else if (plant === "40tuas") {
//             // Logic for 40tuas with only one device model
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2")
//                                                      .replace("30KTL-M3", "") 
//                                                      .replace("147.42", "119.34");
//         }
//         else if (plant === "73tuas") {
//             // Logic for 40tuas with only one device model
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2")
//                                                      .replace("30KTL-M3", "") 
//                                                      .replace("147.42", "103.54");
//         }else if (plant === "15Tech") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2")
//                                                      .replace("30KTL-M3", "") 
//                                                      .replace("147.42", "91.845");
//         }
//         else if (plant === "80tuas") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "115KTL-M2a")
//                                                      .replace("30KTL-M3", "115KTL-M2b") 
//                                                      .replace("null", "115KTL-M2c") 
//                                                      .replace("147.42", "375.2");
//         }

//         else if (plant === "NicoSteel") {
//             // Logic for NicoSteel with only one device model
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "100KTL-M2")
//                                                      .replace("30KTL-M3", "") 
//                                                      .replace("147.42", "115.83");
//         }
//         else if (plant === "SLS") {
            
//             interceptingMessage = interceptingMessage.replace("100KTL-M1", "60KTL-M0")
//                                                      .replace("30KTL-M3", "50KTL-M3")
//                                                      .replace("147.42", "134.865");
//         }

//         const result = await pool.request().query(interceptingMessage);
//         const rawData = result.recordset[0]?.response;

        
//        // console.log('Raw Data:', rawData);

//         if (!rawData) {
//             return {
//                 success: false,
//                 error: 'No data returned from the query'
//             };
//         }

//         let dataArray;
//         try {
//             dataArray = JSON.parse(rawData);
//         } catch (e) {
//             return {
//                 success: false,
//                 error: `Failed to parse JSON: ${e.message}`
//             };
//         }

//         const formattedResponse = {
//             success: true,
//             data: dataArray
//         };

//         return formattedResponse;
//     } catch (err) {
//         return {
//             success: false,
//             error: err.message
//         };
//     }
// };

// module.exports = {
//     getLifeTimeData
// };
const sql = require('mssql');
const config = require('../config/config');

const getLifeTimeData = async (plant, dateRange) => {
    try {
        const pool = await sql.connect(config.db);

        const deviceMap = {
            Bodyknits: {
                models: ['100KTL-M1', '30KTL-M3', null],
                factor: 147.42,
            },
            Sweelee: {
                models: ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3', null],
                factor: 134.865,
            },
            '32tuas': {
                models: ['115KTL-M2', '100KTL-M2', null],
                factor: 242.77,
            },
            '36tuas': {
                models: ['115KTL-M2', '50KTL-M3', null],
                factor: 189.54,
            },
            '40tuas': {
                models: ['115KTL-M2', null, null],
                factor: 119.34,
            },
            '73tuas': {
                models: ['115KTL-M2', null, null],
                factor: 103.54,
            },
            '15Tech': {
                models: ['115KTL-M2', null, null],
                factor: 91.845,
            },
            '80tuas': {
                models: ['115KTL-M2a', '115KTL-M2b', '115KTL-M2c'],
                factor: 375.2,
            },
            NicoSteel: {
                models: ['100KTL-M2', null, null],
                factor: 115.83,
            },
            SLS: {
                models: ['60KTL-M0', '50KTL-M3', null],
                factor: 134.865,
            },
            "110tuas1": {
    models: [
        '125KTL3-Xa','125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg'
    ],
    factor: 1049.61
},
"110tuas2": {
    models: [
        '125KTL3-Xa','125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg'
    ],
    factor: 1049.61
}

        };

        const { models = ['100KTL-M1', '30KTL-M3', null,null,null,null,null], factor = 147.42 } = deviceMap[plant] || {};

        // const [model1, model2, model3,model4,model5,model6,model7] = models.map(m => m ? `'${m}'` : 'NULL');
const paddedModels = [...models, null, null, null, null, null, null, null].slice(0, 7);
const [model1, model2, model3, model4, model5, model6, model7] = paddedModels.map(m => m ? `'${m}'` : 'NULL');

        const query = `
            WITH InverterAggregates AS (
                SELECT
                    CAST(I.[Time] AS DATE) AS Day,
                    MAX(CASE WHEN I.DeviceModel = ${model1} THEN I.DailyEnergy ELSE 0 END) +
                    MAX(CASE WHEN I.DeviceModel = ${model2} THEN I.DailyEnergy ELSE 0 END) +
                     MAX(CASE WHEN I.DeviceModel = ${model3} THEN I.DailyEnergy ELSE 0 END) +
                      MAX(CASE WHEN I.DeviceModel = ${model4} THEN I.DailyEnergy ELSE 0 END) +
                       MAX(CASE WHEN I.DeviceModel = ${model5} THEN I.DailyEnergy ELSE 0 END) +
                        MAX(CASE WHEN I.DeviceModel = ${model6} THEN I.DailyEnergy ELSE 0 END) +
                    MAX(CASE WHEN I.DeviceModel = ${model7} THEN I.DailyEnergy ELSE 0 END) AS Energy
                FROM [Trek_Solar].[dbo].[Inverter] I
                WHERE I.Plant = '${plant}'
                  AND CAST(I.Time AS TIME) > '01:00:00'
                GROUP BY CAST(I.[Time] AS DATE)
            ),
            DailyMaxValues AS (
                SELECT
                    FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
                    MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
                    MAX(EMI5.Irrad) AS MaxIrradiance,
                    MAX(EMI5.DailyIrrad) * 0.27778 * ${factor} AS TheoreticalYield,
                    COALESCE(IA.Energy, 0) AS InverterYield
                FROM [Trek_Solar].[dbo].[EMI5] EMI5
                LEFT JOIN InverterAggregates IA ON FORMAT(EMI5.[Time], 'yyyy-MM-dd') = IA.Day
                WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
                AND EMI5.Plant = '${plant}'
                GROUP BY FORMAT(EMI5.[Time], 'yyyy-MM-dd'), IA.Energy
            ),
            MonthlyValues AS (
                SELECT
                    FORMAT(CONVERT(DATE, Day), 'yyyy') AS StatisticalPeriod,
                    SUM(MaxDailyIrradiance) AS DailyIrradiance,
                    SUM(MaxIrradiance) AS Irradiance,
                    SUM(TheoreticalYield) AS TheoreticalYield,
                    SUM(InverterYield) AS TotalInverterYield
                FROM DailyMaxValues
                GROUP BY FORMAT(CONVERT(DATE, Day), 'yyyy')
            )
            SELECT JSON_QUERY(
                '[' + STRING_AGG(
                    JSON_QUERY(
                        '{"Statistical Period":"' + StatisticalPeriod + '",' +
                        '"Daily Irradiance":' + CAST(ROUND(DailyIrradiance, 2) AS VARCHAR) + ',' +
                        '"Irradiance (W/m²)":' + CAST(Irradiance AS VARCHAR) + ',' +
                        '"Theoretical Yield (kWh)":' + CAST(ROUND(TheoreticalYield, 2) AS VARCHAR) + ',' +
                        '"PV Yield (kWh)":' + CAST(ROUND(TotalInverterYield, 2) AS VARCHAR) + ',' +
                        '"Inverter Yield (kWh)":' + CAST(ROUND(TotalInverterYield, 2) AS VARCHAR) + ',' +
                        '"Performance_ratio (%)":' + CAST(ROUND((TotalInverterYield / NULLIF(TheoreticalYield, 0)) * 100, 1) AS VARCHAR) + '}'
                    ), ','
                ) + ']'
            ) AS response
            FROM MonthlyValues;
        `;

        const result = await pool.request().query(query);
        const rawData = result.recordset[0]?.response;

        if (!rawData) {
            return { success: false, error: 'No data returned from the query' };
        }

        let dataArray;
        try {
            dataArray = JSON.parse(rawData);
        } catch (e) {
            return { success: false, error: `Failed to parse JSON: ${e.message}` };
        }

        return { success: true, data: dataArray };

    } catch (err) {
        return { success: false, error: err.message };
    }
};

module.exports = { getLifeTimeData };
