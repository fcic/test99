const sql = require('mssql');
const config = require('../../config/config');

async function getYearlyData(plant, year) {
    try {
        let pool = await sql.connect(config);
        let request = pool.request();
        request.timeout = 30000;

    
        const yearParam = year || new Date().getFullYear();

    
        const query = `
        DECLARE @Year INT = ${yearParam};
        DECLARE @JanIrrad FLOAT = 0, @FebIrrad FLOAT = 0, @MarIrrad FLOAT = 0, @AprIrrad FLOAT = 0, @MayIrrad FLOAT = 0, @JunIrrad FLOAT = 0,
                @JulIrrad FLOAT = 0, @AugIrrad FLOAT = 0, @SepIrrad FLOAT = 0, @OctIrrad FLOAT = 0, @NovIrrad FLOAT = 0, @DecIrrad FLOAT = 0,
                @JanYield FLOAT = 0, @FebYield FLOAT = 0, @MarYield FLOAT = 0, @AprYield FLOAT = 0, @MayYield FLOAT = 0, @JunYield FLOAT = 0,
                @JulYield FLOAT = 0, @AugYield FLOAT = 0, @SepYield FLOAT = 0, @OctYield FLOAT = 0, @NovYield FLOAT = 0, @DecYield FLOAT = 0;

        WITH InverterAggregates AS (
            SELECT
                CAST(I.[Time] AS DATE) AS Day,
                MAX(CASE
                        WHEN I.DeviceModel = '100KTL-M1' THEN I.DailyEnergy
                        ELSE 0
                    END) +
                MAX(CASE
                        WHEN I.DeviceModel = '30KTL-M3' THEN I.DailyEnergy
                        ELSE 0
                    END) AS Energy
            FROM [Trek_Solar].[dbo].[Inverter] I
            WHERE I.Plant = '${plant}'
                AND YEAR(I.[Time]) = @Year
            GROUP BY CAST(I.[Time] AS DATE)
        ),
        DailyMaxValues AS (
            SELECT
                FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
                MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
                MAX(EMI5.Irrad) AS MaxIrradiance,
                MAX(EMI5.DailyIrrad) * 0.27778 * 147.42 AS TheoreticalYield,
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
                SUM(TheoreticalYield) AS TheoreticalYield,
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

    
        let result = await request.query(query);

// let response = {
//     data: result.recordset.map(row => ({
//         StatisticalPeriod: row.StatisticalPeriod,
//         TotalDailyIrradiance: row.TotalDailyIrradiance.toFixed(3), 
//         TotalInverterYield: row.TotalInverterYield.toFixed(3) 
//     }))
// };
let response = {
    data: {
        xAxis: [], 
        radiationDosePower: [], 
        stationDn: "NE=34030545", 
        productPower: [],
        totalUsePower: "37.02", 
    },
    success: true,
    failCode: 0
};


response.data.xAxis = result.recordset.map(row => row.StatisticalPeriod + "-01 00:00:00");
response.data.radiationDosePower = result.recordset.map(row => row.TotalDailyIrradiance.toFixed(3));
response.data.productPower = result.recordset.map(row => row.TotalInverterYield.toFixed(1)); 
response.data.totalUsePower = result.recordset.reduce((acc, row) => acc + parseFloat(row.TotalInverterYield), 0).toFixed(2);

return response;

    } catch (err) {
        console.error('SQL error', err);
        throw err;
    }
}

module.exports = {
    getYearlyData
};
