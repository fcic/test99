
const sql = require('mssql');
const config = require('../../config/config');

const plantInverterMapping = {
  Bodyknits: ['100KTL-M1', '30KTL-M3'],
  Sweelee: ['SUN2000-60KTL-M0', 'SUN2000-50KTL-M3'],
  '32tuas': ['115KTL-M2', '100KTL-M2'],
  '36tuas': ['115KTL-M2', '50KTL-M3'],
  NicoSteel: ['100KTL-M2'],
  '40tuas': ['115KTL-M2'],
  Demo: ['100KTL-M2'],
  '73tuas': ['115KTL-M2'],
  '15Tech': ['115KTL-M2'],
  '80tuas': ['115KTL-M2a', '115KTL-M2b', '115KTL-M2c'],
   SLS:['50KTL-M3','60KTL-M0'],
   '110tuas1':['125KTL3-Xa','125KTL3-Xb','125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg'],
   '110tuas2':['125KTL3-Xa','125KTL3-Xb','125KTL3-Xc','125KTL3-Xd','125KTL3-Xe','110KTL3-Xf','110KTL3-Xg']
};

async function getLatestEnergy(plant, time) {
  try {
    let pool = await sql.connect(config.db);
    if (!plantInverterMapping[plant]) {
      throw new Error(`Unsupported plant: ${plant}`);
    }

    const deviceModels = plantInverterMapping[plant];

    let subQueries = deviceModels.map(deviceModel => `
      SELECT MAX(DailyEnergy) AS DailyEnergy
      FROM [Trek_Solar].[dbo].[Inverter]
      
      WHERE [time] >= '${time}T01:00:00'
  AND [time] < DATEADD(DAY, 1, '${time}T01:00:00')

        AND DeviceModel = '${deviceModel}'
        AND plant='${plant}'
    `);

    let query = `
      SELECT SUM(DailyEnergy) AS TotalEnergy
      FROM (${subQueries.join(' UNION ALL ')}) AS SubQuery;
    `;

    const result = await pool.request().query(query);
    const totalEnergy = parseFloat(result.recordset[0].TotalEnergy || 0).toFixed(2);
    return totalEnergy;
  } catch (error) {
    throw new Error(`Error retrieving latest daily energy data: ${error.message}`);
  }
}

module.exports = {
  getLatestEnergy
};


// WHERE CAST([time] AS DATE) = '${time}'