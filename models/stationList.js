
const sql = require('mssql');
const config = require('../config/config');
const { getLatestEnergy } = require('./latestEnergy/getLatestEnergy');

async function getStationList(curPage, pageSize, sortId, sortDir) {
  const page = parseInt(curPage) || 1;
  const size = parseInt(pageSize) || 10;
  const sortColumn = sortId || 'createTime'; 
  const sortDirection = sortDir === 'ASC' ? 'ASC' : 'DESC'; 
  const offset = (page - 1) * size;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT *
      FROM Plants
      ORDER BY ${sortColumn} ${sortDirection}
      OFFSET ${offset} ROWS
      FETCH NEXT ${size} ROWS ONLY
    `);


    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM Plants');
    const total = countResult.recordset[0].total;
    const pageCount = Math.ceil(total / size);


    const energyPromises = result.recordset.map(async (plant) => {
      try {
        
        const dailyEnergy = await getLatestEnergy(plant.StationDn, plant.PlantTimeZone);
        
        return {
          ...plant,
          dailyEnergy: parseFloat(dailyEnergy).toFixed(2) || '0.00',
        };
      } catch (error) {
        console.error(`Error fetching energy data for plant ${plant.Plant}: ${error.message}`);
    
        return {
          ...plant,
          dailyEnergy: '0.00', 
        };
      }
    });


    const plantsWithData = await Promise.all(energyPromises);

    // Format the final response
    const response = {
      data: {
        list: plantsWithData.map(plant => ({
          plantStatus:  'connected',
          dailyEnergy: plant.dailyEnergy,
          currentPower:'0.00',
          latitude: plant.latitude,
          longitude: plant.longitude,
          areaName: "Singapore",
          plantAddress: plant.Address || 'unknown',
          parentDn: plant.StationDn || 'unknown',
          dailyIncome: parseFloat(plant.dailyIncome) || '0.0',
        })),
        pageCount: pageCount,
        pageNo: page,
        pageSize: size,
        total: total,
      },
      success: true,
      failCode: 0,
    };

    return response;
  } catch (error) {
    throw new Error(`Error fetching station list: ${error.message}`);
  }
}

module.exports = {
  getStationList,
};
