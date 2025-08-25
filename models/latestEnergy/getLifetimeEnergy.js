const sql = require('mssql');
const config = require('../../config/config');

async function getLifetimeEnergy(stationDn, timeZone) {
  try {
    const pool = await sql.connect(config.db);
    const plantQuery = `
      SELECT Plant
      FROM [Trek_Solar].[dbo].[Plants]
      WHERE StationDn = @StationDn AND PlantTimeZone = @PlantTimeZone;
    `;
    
    const plantResult = await pool.request()
      .input('StationDn', sql.VarChar, stationDn)
      .input('PlantTimeZone', sql.VarChar, timeZone)
      .query(plantQuery);

    if (plantResult.recordset.length === 0) {
      throw new Error(`No plant found for StationDn: ${stationDn} and timeZone: ${timeZone}`);
    }

    const plant = plantResult.recordset[0].Plant;

    // Step 2
    const query = `
      DECLARE @Plant NVARCHAR(50) = @PlantParam;
      DECLARE @DeviceModel1 NVARCHAR(50) = CASE WHEN @Plant = 'Bodyknits' THEN '100KTL-M1' ELSE 'SUN2000-60KTL-M0' END;
      DECLARE @DeviceModel2 NVARCHAR(50) = CASE WHEN @Plant = 'Bodyknits' THEN '30KTL-M3' ELSE 'SUN2000-50KTL-M3' END;

      WITH DailyMaxEnergy AS (
        SELECT
            CAST(time AS DATE) AS Date,
            DeviceModel,
            MAX(DailyEnergy) AS MaxDailyEnergy
        FROM [Trek_Solar].[dbo].[Inverter]
        WHERE Plant = @Plant
        GROUP BY CAST(time AS DATE), DeviceModel
      ),
      MonthlyEnergySums AS (
        SELECT
            YEAR(Date) AS YearNumber,
            MONTH(Date) AS MonthNumber,
            SUM(CASE WHEN DeviceModel = @DeviceModel1 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice1,
            SUM(CASE WHEN DeviceModel = @DeviceModel2 THEN MaxDailyEnergy ELSE 0 END) AS SummedMaxEnergyDevice2
        FROM DailyMaxEnergy
        GROUP BY YEAR(Date), MONTH(Date)
      ),
      YearlyTotalEnergy AS (
        SELECT
            SUM(SummedMaxEnergyDevice1 + SummedMaxEnergyDevice2) AS TotalYearlyEnergy
        FROM MonthlyEnergySums
      )

      SELECT
          CAST(ROUND(SUM(TotalYearlyEnergy) / 1000, 2) AS VARCHAR(20)) AS LifetimeTotalEnergyYield
      FROM YearlyTotalEnergy;
    `;

    const result = await pool.request()
      .input('PlantParam', sql.NVarChar(50), plant)
      .query(query);

    return result.recordset[0].LifetimeTotalEnergyYield;
  } catch (error) {
    throw new Error(`Error retrieving lifetime energy yield: ${error.message}`);
  }
}

module.exports = {
  getLifetimeEnergy
};
