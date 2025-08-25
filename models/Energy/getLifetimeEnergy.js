
const sql = require('mssql');
const config = require('../../config/config');

async function getLifetimeEnergy(plant) {
  try {
    const query = `
      DECLARE @Plant NVARCHAR(50) = @PlantParam;

      -- Assign DeviceModel1 and DeviceModel2 dynamically based on the plant
      DECLARE @DeviceModel1 NVARCHAR(50) = 
        CASE 
          WHEN @Plant = 'Bodyknits' THEN '100KTL-M1' 
          WHEN @Plant = 'Sweelee' THEN 'SUN2000-60KTL-M0' 
          WHEN @Plant = '32Tuas' THEN '115KTL-M2'
          WHEN @Plant = '36Tuas' THEN '115KTL-M2'
          WHEN @Plant = '40Tuas' THEN '115KTL-M2'  
          WHEN @Plant = 'NicoSteel' THEN '100KTL-M2'
           WHEN @Plant = 'Demo' THEN '100KTL-M2'
            WHEN @Plant = '73tuas' THEN '115KTL-M2'
            WHEN @Plant = '15Tech' THEN '115KTL-M2'
             WHEN @Plant = '80tuas' THEN '115KTL-M2a'
             WHEN @Plant = 'SLS' THEN '60KTL-M0'
             WHEN @Plant = '110tuas1' THEN '125KTL3-Xa'
             WHEN @Plant = '110tuas2' THEN '125KTL3-Xa'
          ELSE NULL
        END;

      DECLARE @DeviceModel2 NVARCHAR(50) = 
        CASE 
          WHEN @Plant = 'Bodyknits' THEN '30KTL-M3' 
          WHEN @Plant = 'Sweelee' THEN 'SUN2000-50KTL-M3' 
          WHEN @Plant = '32Tuas' THEN '100KTL-M2' 
          WHEN @Plant = '36Tuas' THEN '50KTL-M3'
          WHEN @Plant = '80tuas' THEN '115KTL-M2b'
          WHEN @Plant = 'SLS' THEN '50KTL-M3'
           WHEN @Plant = '110tuas1' THEN '125KTL3-Xb'
           WHEN @Plant = '110tuas2' THEN '125KTL3-Xb'
          ELSE NULL
        END;
 DECLARE @DeviceModel3 NVARCHAR(50) = 
        CASE 
        WHEN @Plant = '80tuas' THEN '115KTL-M2c'
         WHEN @Plant = '110tuas1' THEN '125KTL3-Xc'
         WHEN @Plant = '110tuas2' THEN '125KTL3-Xc'
        ELSE NULL
        END;
DECLARE @DeviceModel4 NVARCHAR(50) = 
  CASE 
    WHEN @Plant = '110tuas1' THEN '125KTL3-Xd' 
    WHEN @Plant = '110tuas2' THEN '125KTL3-Xd'
    ELSE NULL
  END;

DECLARE @DeviceModel5 NVARCHAR(50) = 
  CASE 
    WHEN @Plant = '110tuas1' THEN '125KTL3-Xe' 
    WHEN @Plant = '110tuas2' THEN '125KTL3-Xe'
    ELSE NULL
  END;

DECLARE @DeviceModel6 NVARCHAR(50) = 
  CASE 
    WHEN @Plant = '110tuas1' THEN '110KTL3-Xf' 
    WHEN @Plant = '110tuas2' THEN '110KTL3-Xf'
    ELSE NULL
  END;

DECLARE @DeviceModel7 NVARCHAR(50) = 
  CASE 
    WHEN @Plant = '110tuas1' THEN '110KTL3-Xg' 
    WHEN @Plant = '110tuas2' THEN '110KTL3-Xg'
    ELSE NULL
  END;

      -- Calculate lifetime energy
      WITH DailyMaxEnergy AS (
        SELECT
            CAST(time AS DATE) AS Date,
            DeviceModel,
            MAX(DailyEnergy) AS MaxDailyEnergy
        FROM [Trek_Solar].[dbo].[Inverter]
        WHERE Plant = @Plant
        AND CAST([time] AS TIME) >= '01:00:00'
        GROUP BY CAST(time AS DATE), DeviceModel
      ),
      MonthlyEnergySums AS (
        SELECT
            YEAR(Date) AS YearNumber,
            MONTH(Date) AS MonthNumber,
            SUM(CASE WHEN DeviceModel = @DeviceModel1 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice1,
            SUM(CASE WHEN DeviceModel = @DeviceModel2 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice2,
            SUM(CASE WHEN DeviceModel = @DeviceModel3 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice3,
            SUM(CASE WHEN DeviceModel = @DeviceModel4 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice4,
            SUM(CASE WHEN DeviceModel = @DeviceModel5 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice5,
            SUM(CASE WHEN DeviceModel = @DeviceModel6 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice6,
           SUM(CASE WHEN DeviceModel = @DeviceModel7 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice7
            FROM DailyMaxEnergy
        GROUP BY YEAR(Date), MONTH(Date)
      ),
      YearlyTotalEnergy AS (
        SELECT
            SUM(
              COALESCE(SummedMaxEnergyDevice1, 0) + 
              COALESCE(SummedMaxEnergyDevice2, 0) +
              COALESCE(SummedMaxEnergyDevice3, 0) +
              COALESCE(SummedMaxEnergyDevice4, 0) +
              COALESCE(SummedMaxEnergyDevice5, 0) +
              COALESCE(SummedMaxEnergyDevice6, 0) +
              COALESCE(SummedMaxEnergyDevice7, 0)
            ) AS TotalYearlyEnergy
        FROM MonthlyEnergySums
      )

      SELECT
          CAST(ROUND(SUM(TotalYearlyEnergy) / 1000, 2) AS VARCHAR(20)) AS LifetimeTotalEnergyYield
      FROM YearlyTotalEnergy;
    `;

    const pool = await sql.connect(config.db);
    const result = await pool.request()
      .input('PlantParam', sql.NVarChar(50), plant)
      .query(query);

    return result.recordset[0]?.LifetimeTotalEnergyYield || '0.00'; 
  } catch (error) {
    console.error(`Error retrieving lifetime energy yield: ${error.message}`);
    throw new Error(`Error retrieving lifetime energy yield: ${error.message}`);
  }
}

module.exports = {
  getLifetimeEnergy
};
