
const sql = require('mssql');
const config = require('../config/config');

const getReportData = async (year, plant) => {
    try {
        let pool = await sql.connect(config.db);
        let query;

        if(plant==='Sweelee') {
         query = `
            DECLARE @Year INT = ${year};
            DECLARE @Day INT = 10; -- Day of the month

            -- Calculate the start and end dates for the data range
            DECLARE @StartDate DATE = DATEADD(MONTH, -1, DATEFROMPARTS(@Year, 1, @Day)); -- Previous December
            DECLARE @EndDate DATE = DATEADD(DAY, -1, DATEFROMPARTS(@Year + 1, 1, @Day)); -- Up to (@Day - 1) of January next year

            WITH InverterAggregates AS (
                SELECT
                    CAST(I.[Time] AS DATE) AS Day,
                    MAX(CASE WHEN I.DeviceModel = 'SUN2000-60KTL-M0' THEN I.DailyEnergy ELSE 0 END) AS Energy100KTL,
                    MAX(CASE WHEN I.DeviceModel = 'SUN2000-50KTL-M3' THEN I.DailyEnergy ELSE 0 END) AS Energy30KTL
                FROM [Trek_Solar].[dbo].[Inverter] I
                WHERE I.Plant = '${plant}'
                    AND I.[Time] >= @StartDate 
                    AND I.[Time] <= @EndDate
                GROUP BY CAST(I.[Time] AS DATE)
            ), DailyMaxValues AS (
                SELECT
                    CAST(EMI5.[Time] AS DATE) AS Day,
                    MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
                    MAX(EMI5.Irrad) AS MaxIrradiance,
                    MAX(EMI5.DailyIrrad) * 0.27778 * 147.42 AS TheoreticalYield,
                    ISNULL(IA.Energy100KTL, 0) + ISNULL(IA.Energy30KTL, 0) AS InverterYield
                FROM [Trek_Solar].[dbo].[EMI5] EMI5
                LEFT JOIN InverterAggregates IA ON EMI5.[Time] >= IA.Day AND EMI5.[Time] < DATEADD(DAY, 1, IA.Day)
                WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
                    AND EMI5.Plant = '${plant}'
                    AND EMI5.[Time] >= @StartDate 
                    AND EMI5.[Time] <= @EndDate
                GROUP BY CAST(EMI5.[Time] AS DATE), IA.Energy100KTL, IA.Energy30KTL
            ), MonthlyValues AS (
                SELECT
                    DATEFROMPARTS(
                        YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
                        MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
                        1
                    ) AS StatisticalPeriod,
                    SUM(MaxDailyIrradiance) AS DailyIrradiance,
                    SUM(MaxIrradiance) AS Irradiance,
                    SUM(TheoreticalYield) AS TheoreticalYield,
                    SUM(InverterYield) AS TotalInverterYield
                FROM DailyMaxValues
                GROUP BY 
                    DATEFROMPARTS(
                        YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
                        MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
                        1
                    )
            )
            SELECT 
                FORMAT(StatisticalPeriod, 'yyyy-MM') AS StatisticalPeriod,
                DailyIrradiance,
                Irradiance,
                TheoreticalYield,
                TotalInverterYield
            FROM MonthlyValues
            WHERE YEAR(StatisticalPeriod) = @Year
            ORDER BY StatisticalPeriod;
        `;
        }
       else if(plant==='Bodyknits')
       {
        query=`-- Declare Year and Day variables
DECLARE @Year INT = ${year};
DECLARE @Day INT = 15; -- Day of the month
DECLARE @DeviceModel1 NVARCHAR(50) = '100KTL-M1';
DECLARE @DeviceModel2 NVARCHAR(50) = '30KTL-M3';
DECLARE @Plant NVARCHAR(50) = 'bodyknits';

-- Calculate the start and end dates for the data range
DECLARE @StartDate DATE = DATEADD(MONTH, -1, DATEFROMPARTS(@Year, 1, @Day)); -- Previous December
DECLARE @EndDate DATE = DATEADD(DAY, -1, DATEFROMPARTS(@Year + 1, 1, @Day)); -- Up to (@Day - 1) of January next year

WITH InverterAggregates AS (
    SELECT
        CAST(I.[Time] AS DATE) AS Day,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel1 THEN I.DailyEnergy ELSE 0 END) AS Energy100KTL,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel2 THEN I.DailyEnergy ELSE 0 END) AS Energy30KTL
    FROM [Trek_Solar].[dbo].[Inverter] I
    WHERE I.Plant = @Plant
      AND I.[Time] >= @StartDate 
      AND I.[Time] <= @EndDate
    GROUP BY CAST(I.[Time] AS DATE)
), DailyMaxValues AS (
    SELECT
        CAST(EMI5.[Time] AS DATE) AS Day,
        MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
        MAX(EMI5.Irrad) AS MaxIrradiance,
        MAX(EMI5.DailyIrrad)  * 0.27778 * 147.42 AS TheoreticalYield,
        ISNULL(IA.Energy100KTL, 0) + ISNULL(IA.Energy30KTL, 0) AS InverterYield
    FROM [Trek_Solar].[dbo].[EMI5] EMI5
    LEFT JOIN InverterAggregates IA 
        ON EMI5.[Time] >= IA.Day 
        AND EMI5.[Time] < DATEADD(DAY, 1, IA.Day)
    WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
      AND EMI5.Plant = @Plant
      AND EMI5.[Time] >= @StartDate 
      AND EMI5.[Time] <= @EndDate
    GROUP BY CAST(EMI5.[Time] AS DATE), IA.Energy100KTL, IA.Energy30KTL
), MonthlyValues AS (
    SELECT
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        ) AS StatisticalPeriod,
        SUM(MaxDailyIrradiance) AS DailyIrradiance,
        SUM(MaxIrradiance) AS Irradiance,
        SUM(TheoreticalYield) AS TheoreticalYield,
        SUM(InverterYield) AS TotalInverterYield
    FROM DailyMaxValues
    GROUP BY 
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        )
)
SELECT 
    FORMAT(StatisticalPeriod, 'yyyy-MM') AS StatisticalPeriod,
    DailyIrradiance,
    Irradiance,
    TheoreticalYield,
    TotalInverterYield
FROM MonthlyValues
WHERE YEAR(StatisticalPeriod) = @Year
ORDER BY StatisticalPeriod;
`;
       }else if(plant==='NicoSteel') {
        query=`-- Declare common variables
DECLARE @Day INT = 25;
DECLARE @DeviceModel1 NVARCHAR(50) = '100KTL-M2';
DECLARE @DeviceModel2 NVARCHAR(50) = '30KTL-M3';
DECLARE @Plant NVARCHAR(50) = 'nicosteel';

-- Query for 2024
DECLARE @Year1 INT = ${year -1};
DECLARE @StartDate1 DATE = DATEADD(MONTH, -1, DATEFROMPARTS(@Year1, 1, @Day)); -- Dec 25, 2023
DECLARE @EndDate1 DATE = DATEADD(DAY, -1, DATEFROMPARTS(@Year1 + 1, 1, @Day)); -- Jan 24, 2025

WITH InverterAggregates1 AS (
    SELECT
        CAST(I.[Time] AS DATE) AS Day,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel1 THEN I.DailyEnergy ELSE 0 END) AS Energy100KTL,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel2 THEN I.DailyEnergy ELSE 0 END) AS Energy30KTL
    FROM [Trek_Solar].[dbo].[Inverter] I
    WHERE I.Plant = @Plant
      AND I.[Time] >= @StartDate1 
      AND I.[Time] <= @EndDate1
    GROUP BY CAST(I.[Time] AS DATE)
), DailyMaxValues1 AS (
    SELECT
        CAST(EMI5.[Time] AS DATE) AS Day,
        MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
        MAX(EMI5.Irrad) AS MaxIrradiance,
        MAX(EMI5.DailyIrrad) * 0.27778 * 115.83 AS TheoreticalYield,
        ISNULL(IA.Energy100KTL, 0) + ISNULL(IA.Energy30KTL, 0) AS InverterYield
    FROM [Trek_Solar].[dbo].[EMI5] EMI5
    LEFT JOIN InverterAggregates1 IA 
        ON EMI5.[Time] >= IA.Day 
        AND EMI5.[Time] < DATEADD(DAY, 1, IA.Day)
    WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
      AND EMI5.Plant = @Plant
      AND EMI5.[Time] >= @StartDate1 
      AND EMI5.[Time] <= @EndDate1
    GROUP BY CAST(EMI5.[Time] AS DATE), IA.Energy100KTL, IA.Energy30KTL
), MonthlyValues1 AS (
    SELECT
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        ) AS StatisticalPeriod,
        SUM(MaxDailyIrradiance) AS DailyIrradiance,
        SUM(MaxIrradiance) AS Irradiance,
        SUM(TheoreticalYield) AS TheoreticalYield,
        SUM(InverterYield) AS TotalInverterYield
    FROM DailyMaxValues1
    GROUP BY 
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        )
)
SELECT 
    FORMAT(StatisticalPeriod, 'yyyy-MM') AS StatisticalPeriod,
    DailyIrradiance,
    Irradiance,
    TheoreticalYield,
    TotalInverterYield
INTO #Temp2024
FROM MonthlyValues1
WHERE YEAR(StatisticalPeriod) = @Year1;

-- Query for 2025
DECLARE @Year2 INT = 2025;
DECLARE @StartDate2 DATE = DATEADD(MONTH, -1, DATEFROMPARTS(@Year2, 1, @Day)); -- Dec 25, 2024
DECLARE @EndDate2 DATE = DATEADD(DAY, -1, DATEFROMPARTS(@Year2 + 1, 1, @Day)); -- Jan 24, 2026

WITH InverterAggregates2 AS (
    SELECT
        CAST(I.[Time] AS DATE) AS Day,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel1 THEN I.DailyEnergy ELSE 0 END) AS Energy100KTL,
        MAX(CASE WHEN I.DeviceModel = @DeviceModel2 THEN I.DailyEnergy ELSE 0 END) AS Energy30KTL
    FROM [Trek_Solar].[dbo].[Inverter] I
    WHERE I.Plant = @Plant
      AND I.[Time] >= @StartDate2 
      AND I.[Time] <= @EndDate2
    GROUP BY CAST(I.[Time] AS DATE)
), DailyMaxValues2 AS (
    SELECT
        CAST(EMI5.[Time] AS DATE) AS Day,
        MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
        MAX(EMI5.Irrad) AS MaxIrradiance,
        MAX(EMI5.DailyIrrad) * 0.27778 * 115.83 AS TheoreticalYield,
        ISNULL(IA.Energy100KTL, 0) + ISNULL(IA.Energy30KTL, 0) AS InverterYield
    FROM [Trek_Solar].[dbo].[EMI5] EMI5
    LEFT JOIN InverterAggregates2 IA 
        ON EMI5.[Time] >= IA.Day 
        AND EMI5.[Time] < DATEADD(DAY, 1, IA.Day)
    WHERE CAST(EMI5.Time AS TIME) > '01:00:00'
      AND EMI5.Plant = @Plant
      AND EMI5.[Time] >= @StartDate2 
      AND EMI5.[Time] <= @EndDate2
    GROUP BY CAST(EMI5.[Time] AS DATE), IA.Energy100KTL, IA.Energy30KTL
), MonthlyValues2 AS (
    SELECT
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        ) AS StatisticalPeriod,
        SUM(MaxDailyIrradiance) AS DailyIrradiance,
        SUM(MaxIrradiance) AS Irradiance,
        SUM(TheoreticalYield) AS TheoreticalYield,
        SUM(InverterYield) AS TotalInverterYield
    FROM DailyMaxValues2
    GROUP BY 
        DATEFROMPARTS(
            YEAR(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            MONTH(DATEADD(MONTH, CASE WHEN DAY(Day) >= @Day THEN 1 ELSE 0 END, Day)),
            1
        )
)
SELECT 
    FORMAT(StatisticalPeriod, 'yyyy-MM') AS StatisticalPeriod,
    DailyIrradiance,
    Irradiance,
    TheoreticalYield,
    TotalInverterYield
INTO #Temp2025
FROM MonthlyValues2
WHERE YEAR(StatisticalPeriod) = @Year2;

-- Combine and merge the results
SELECT 
    CASE 
        WHEN StatisticalPeriod IN ('2024-12', '2025-01') THEN '2025-01'
        ELSE StatisticalPeriod
    END AS StatisticalPeriod,
    
    SUM(DailyIrradiance) AS DailyIrradiance,
    SUM(Irradiance) AS Irradiance,
    SUM(TheoreticalYield) AS TheoreticalYield,
    SUM(TotalInverterYield) AS TotalInverterYield
FROM (
    SELECT * FROM #Temp2024
    UNION ALL
    SELECT * FROM #Temp2025
) AS Combined
GROUP BY 
    CASE 
        WHEN StatisticalPeriod IN ('2024-12', '2025-01') THEN '2025-01'
        ELSE StatisticalPeriod
    END
ORDER BY StatisticalPeriod;

-- Clean up temporary tables
DROP TABLE #Temp2024;
DROP TABLE #Temp2025;`;
       }
        const result = await pool.request().query(query);

        // console.log("Query Result:", result.recordset);  

        return result.recordset.map(item => ({
            StatisticalPeriod: item.StatisticalPeriod ,
            DailyIrradiance: item.DailyIrradiance,
            Irradiance: item.Irradiance,
            TheoreticalYield: item.TheoreticalYield,
            TotalInverterYield: item.TotalInverterYield.toFixed(2)
        }));
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getReportData
};
