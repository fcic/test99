

const sql = require('mssql');
const config = require('../../config/config');

const deviceModelsByPlant = {
  bodyknits: ['100KTL-M1', '30KTL-M3'],
  sweelee: ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3'],
  '32tuas': ['115KTL-M2', '100KTL-M2'],
  '36tuas': ['115KTL-M2', '50KTL-M3'],
  '80tuas': ['115KTL-M2a', '115KTL-M2b', '115KTL-M2c'],
  nicosteel: ['100KTL-M2'],
  '40tuas': ['115KTL-M2'],
  '73tuas': ['115KTL-M2'],
  '15tech': ['115KTL-M2'],
  demo: ['100KTL-M2'],
  sls: ['50KTL-M3', '60KTL-M0'],
  "110tuas1": [ '125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg'],
  "110tuas2": [ '125KTL3-Xa', '125KTL3-Xb', '125KTL3-Xc','125KTL3-Xd', '125KTL3-Xe', '110KTL3-Xf', '110KTL3-Xg']

};

const getYearlyEnergyData = async (plant, year) => {
  const pool = await sql.connect(config.db);
  const models = deviceModelsByPlant[plant.toLowerCase()];
  if (!models) throw new Error('Unsupported plant');

  const energyCases = models.map((model, i) => `SUM(CASE WHEN DeviceModel = '${model}' THEN MaxDailyEnergy ELSE 0 END) AS Summed${i}`).join(',\n');
  const sumColumns = models.map((_, i) => `Summed${i}`).join(' + ');

  const query = `
    DECLARE @Year INT = ${year};
    WITH Months AS (
      SELECT TOP 12 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS MonthNumber FROM master..spt_values
    ),
    DailyMaxEnergy AS (
      SELECT CAST([Time] AS DATE) AS Date, DeviceModel, MAX(DailyEnergy) AS MaxDailyEnergy
      FROM [Trek_Solar].[dbo].[Inverter]
      WHERE YEAR([Time]) = @Year AND Plant = @inputPlant
      AND CAST([Time] AS TIME) >= '01:00:00'
      GROUP BY CAST([Time] AS DATE), DeviceModel
    ),
    MonthlyEnergySums AS (
      SELECT MONTH(Date) AS MonthNumber, ${energyCases}
      FROM DailyMaxEnergy
      GROUP BY MONTH(Date)
    ),
    MonthlyTotalEnergy AS (
      SELECT MonthNumber, CAST(ROUND(SUM(${sumColumns}), 2) AS VARCHAR) AS TotalMonthlyEnergy
      FROM MonthlyEnergySums
      GROUP BY MonthNumber
    )
    SELECT CONCAT(
      '["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],',
      '[', STRING_AGG(ISNULL(TotalMonthlyEnergy, '0'), ',') WITHIN GROUP (ORDER BY Months.MonthNumber), ']'
    ) AS MonthlyEnergyArray
    FROM Months
    LEFT JOIN MonthlyTotalEnergy ON Months.MonthNumber = MonthlyTotalEnergy.MonthNumber;
  `;

  try {
    const result = await pool.request().input('inputPlant', sql.VarChar, plant).query(query);
    if (!result.recordset[0]?.MonthlyEnergyArray) throw new Error('No data returned');
    const [xAxis, values] = JSON.parse(`[${result.recordset[0].MonthlyEnergyArray}]`);
    return { data: { xAxis, "Yield kWh": values.map(v => parseFloat(v)) } };
  } catch (err) {
    throw new Error('Database query error: ' + err.message);
  } finally {
    await sql.close();
  }
};

module.exports = { getYearlyEnergyData };
