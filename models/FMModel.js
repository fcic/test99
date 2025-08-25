
const sql = require('mssql');
const config = require('../config/config');


async function fetchDataFromMSSQL(plant) {
  try {
    const pool = await sql.connect(config.db);
    const result = await pool.request()
      .input('plant', sql.NVarChar, plant)
      .query("SELECT * FROM FM WHERE Plant = @plant");
    return result.recordset;
  } catch (err) {
    console.error('Error fetching data from MSSQL:', err);
    throw err;
  }
}

async function fetchData(plant) {
  try {
    const pool = await sql.connect(config.db);
    const result = await pool.request()
      .input('plant', sql.NVarChar, plant)
      .query("SELECT * FROM FM WHERE Plant = @plant AND id = 1");

    // Assuming the 'Revenue' field is in the response as a JSON string
    const data = result.recordset[0]; // Assuming there's one record per plant
    const revenueData = JSON.parse(data.Revenue);  // Parse the 'Revenue' field into a JavaScript object
    
    // Extract total revenue for each month
    const monthlyRevenue = Object.keys(revenueData).reduce((acc, month) => {
      const totalRevenue = revenueData[month]["Total Revenue"]["Amount"];
      acc[month] = totalRevenue;
      return acc;
    }, {});

    // Calculate the yearly total
    const yearlyTotal = Object.values(monthlyRevenue).reduce((sum, amount) => sum + amount, 0);

    console.log('Monthly Revenue:', monthlyRevenue);
    console.log('Yearly Total Revenue:', yearlyTotal);

    return {
      monthlyRevenue,
      yearlyTotal
    };

  } catch (err) {
    console.error('Error fetching data from MSSQL:', err);
    throw err;
  }
}


async function insertRevenueData({ month, data }) {
  if (!month || !data) {
    throw new Error('Missing required fields in request body');
  }

  const id = 1;  

  try {
    const pool = await sql.connect(config.db);
    const existingData = await pool.request()
      .input('id', sql.Int, id) 
      .query("SELECT Revenue FROM FM WHERE ID = @id");

    let revenueData = {};

    
    if (existingData.recordset.length > 0) {
      revenueData = JSON.parse(existingData.recordset[0].Revenue); 
    }

  
    revenueData[month] = data; 


    const result = await pool.request()
      .input('id', sql.Int, id) 
      .input('revenue', sql.NVarChar, JSON.stringify(revenueData))
      .query("UPDATE FM SET Revenue = @revenue WHERE ID = @id");

    return result.rowsAffected[0] > 0
      ? { success: true, message: 'Revenue data inserted or updated successfully' }
      : { success: false, message: 'ID not found, no update performed' };
  } catch (error) {
    console.error('Error inserting or updating revenue data:', error);
    throw new Error('Error inserting or updating revenue data');
  }
}

module.exports = { 
  fetchDataFromMSSQL,
  fetchData,
  insertRevenueData
};
