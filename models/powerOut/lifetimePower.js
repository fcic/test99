
const sql = require('mssql');
const config = require('../../config/config');

async function getLifetimeData(plant) {
  try {
    const pool = await sql.connect(config.db);
    let deviceModel1 = '100KTL-M1';
    let deviceModel2 = '30KTL-M3';
    let deviceModel3='';
    let deviceModel4 = '', deviceModel5 = '', deviceModel6 = '', deviceModel7 = '';
    

    if (plant.toLowerCase() === "sweelee") {
      deviceModel1 = 'SUN2000-60KTL-M0';
      deviceModel2 = 'SUN2000-50KTL-M3';
      
    }
    else if (plant.toLowerCase() === "32tuas") {
      deviceModel1 = '115KTL-M2';
      deviceModel2 = '100KTL-M2';
    
  }else if (plant.toLowerCase() === "36tuas") {
    deviceModel1 = '115KTL-M2';
    deviceModel2 = '50KTL-M3';
    
}else if (plant.toLowerCase() === "40tuas") {
    deviceModel1 = '115KTL-M2';
    deviceModel2 = '';
}else if (plant.toLowerCase() === "73tuas") {
  deviceModel1 = '115KTL-M2';
  deviceModel2 = '';
}else if (plant.toLowerCase() === "15tech") {
  deviceModel1 = '115KTL-M2';
  deviceModel2 = '';
}
else if (plant.toLowerCase() === "80tuas") {
  deviceModel1 = '115KTL-M2a';
  deviceModel2 = '115KTL-M2b';
  deviceModel3='115KTL-M2c';
  
}else if (plant.toLowerCase() === 'nicosteel') {
    deviceModel1 = '100KTL-M2';
    deviceModel2 = ''; 
    
  }else if (plant.toLowerCase() === 'demo') {
    deviceModel1 = '100KTL-M2';
    deviceModel2 = ''; 

  }
  else if (plant.toLowerCase() === 'sls') {
    deviceModel1 = '60KTL-M0';
    deviceModel2 = '50KTL-M3'; 
    // theoreticalYieldFactor = 115.83;
  }
  else if (plant.toLowerCase() === "110tuas1") {
  deviceModel1 = '125KTL3-Xa';
  deviceModel2 = '125KTL3-Xb';
  deviceModel3 = '125KTL3-Xc';
  deviceModel4 = '125KTL3-Xd';
  deviceModel5 = '125KTL3-Xe';
  deviceModel6 = '110KTL3-Xf';
  deviceModel7 = '110KTL3-Xg';
}
else if (plant.toLowerCase() === "110tuas2") {
  deviceModel1 = '125KTL3-Xa';
  deviceModel2 = '125KTL3-Xb';
  deviceModel3 = '125KTL3-Xc';
  deviceModel4 = '125KTL3-Xd';
  deviceModel5 = '125KTL3-Xe';
  deviceModel6 = '110KTL3-Xf';
  deviceModel7 = '110KTL3-Xg';
}


    const query = `
    WITH InverterAggregates AS (
        SELECT
            CAST(I.[Time] AS DATE) AS Day,
            MAX(CASE WHEN I.DeviceModel = '${deviceModel1}' THEN I.DailyEnergy ELSE 0 END) +
            MAX(CASE WHEN I.DeviceModel = '${deviceModel2}' THEN I.DailyEnergy ELSE 0 END)+
             MAX(CASE WHEN I.DeviceModel = '${deviceModel3}' THEN I.DailyEnergy ELSE 0 END) +
             MAX(CASE WHEN I.DeviceModel = '${deviceModel4}' THEN I.DailyEnergy ELSE 0 END) +
            MAX(CASE WHEN I.DeviceModel = '${deviceModel5}' THEN I.DailyEnergy ELSE 0 END) +
             MAX(CASE WHEN I.DeviceModel = '${deviceModel6}' THEN I.DailyEnergy ELSE 0 END) +
            MAX(CASE WHEN I.DeviceModel = '${deviceModel7}' THEN I.DailyEnergy ELSE 0 END)
              AS Energy
        FROM [Trek_Solar].[dbo].[Inverter] I
        WHERE I.Plant = @plant
          AND CAST(I.[Time] AS TIME) >= '01:00:00' 
        GROUP BY CAST(I.[Time] AS DATE)
    ),
    DailyMaxValues AS (
        SELECT
            FORMAT(EMI5.[Time], 'yyyy-MM-dd') AS Day,
            MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrradiance,
            MAX(EMI5.Irrad) AS MaxIrradiance,
            COALESCE(IA.Energy, 0) AS InverterYield
        FROM [Trek_Solar].[dbo].[EMI5] EMI5
        LEFT JOIN InverterAggregates IA ON FORMAT(EMI5.[Time], 'yyyy-MM-dd') = IA.Day
        WHERE CAST(EMI5.Time AS TIME) > '01:00:00' AND EMI5.Plant = @plant
        GROUP BY FORMAT(EMI5.[Time], 'yyyy-MM-dd'), IA.Energy
    ),
    MonthlyValues AS (
        SELECT
            FORMAT(CONVERT(DATE, Day), 'yyyy') AS StatisticalPeriod,
            SUM(MaxDailyIrradiance) AS DailyIrradiance,
            SUM(MaxIrradiance) AS Irradiance,
            SUM(InverterYield) AS TotalInverterYield
        FROM DailyMaxValues
        GROUP BY FORMAT(CONVERT(DATE, Day), 'yyyy')
    )
    SELECT
        STRING_AGG(CONVERT(VARCHAR, StatisticalPeriod), ',') WITHIN GROUP (ORDER BY StatisticalPeriod) AS Years,
        STRING_AGG(CONVERT(VARCHAR, DailyIrradiance), ',') WITHIN GROUP (ORDER BY StatisticalPeriod) AS Irradiances,
        STRING_AGG(CONVERT(VARCHAR, TotalInverterYield), ',') WITHIN GROUP (ORDER BY StatisticalPeriod) AS Yields
    FROM MonthlyValues;
    `;

    const request = pool.request();
    request.input('plant', sql.NVarChar(100), plant);

    const result = await request.query(query);

  
    //console.log('Query Result:', result.recordset);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error('No data returned from the query');
    }

    const data = result.recordset[0];
    
  
    const years = data.Years.split(',').map(Number);
    const irradiances = data.Irradiances.split(',').map(value => parseFloat(value).toFixed(3));
    const yields = data.Yields.split(',').map(value => parseFloat(value).toFixed(1));

    return {
      data: {
        xAxis: years,  
        "Irradiation kWh/m2": irradiances,
        stationDn: plant,
        "Yield kWh": yields,
        totalUsePower: yields.reduce((acc, val) => acc + parseFloat(val), 0).toFixed(2)
      },
      success: true,
      failCode: 0
    };
  } catch (error) {
    console.error('Error fetching lifetime data:', error.message);
    throw new Error('Error fetching lifetime data');
  }
}

module.exports = {
  getLifetimeData
};
