const sql = require ('mssql');
const config = require('../config/config');

async function fetchPlants(plantId = null) {
  try {
    let query;
    const pool = await sql.connect(config);
    const request = pool.request();

    if (plantId) {
      
      query = `
        SELECT Id, Company, PlantName, PlantType, createTime, Address, GPSLocation, 
               TotalStringCapacity, PlantTimeZone, Country, EmailAddress
        FROM Plants
        WHERE Id = @plantId;
      `;
      request.input('plantId', sql.Int, plantId);
    } else {
      
      query = `
        SELECT Id, Company, PlantName, PlantType, createTime, Address, GPSLocation, 
               TotalStringCapacity, PlantTimeZone, Country, EmailAddress
        FROM Plants;
      `;
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching plants: ${error.message}`);
  }
}

// Add a plant
async function addPlant(plant) {
  try {
    const query = `
      INSERT INTO Plants (Company, PlantName, createTime, Address, 
                          TotalStringCapacity, Country, EmailAddress)
      VALUES (@Company, @PlantName,  @createTime, @Address,
              @TotalStringCapacity, @Country, @EmailAddress);
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('Company', sql.NVarChar, plant.Company)
      .input('PlantName', sql.NVarChar, plant.PlantName)
      // .input('PlantType', sql.NVarChar, plant.PlantType)
      .input('createTime', sql.DateTime, plant.createTime)
      .input('Address', sql.NVarChar, plant.Address)
      // .input('GPSLocation', sql.NVarChar, plant.GPSLocation)
      .input('TotalStringCapacity',sql.Decimal(18, 2), plant.TotalStringCapacity)
      // .input('PlantTimeZone', sql.NVarChar, plant.PlantTimeZone)
      .input('Country', sql.NVarChar, plant.Country)
      .input('EmailAddress', sql.NVarChar, plant.EmailAddress);

    await request.query(query);
    return { message: 'Plant added successfully' };
  } catch (error) {
    throw new Error(`Error adding plant: ${error.message}`);
  }
}

// Update a plant
async function updatePlant(plantId, updatedPlant) {
  try {
    const query = `
      UPDATE Plants
      SET Company = @Company, PlantName = @PlantName, PlantType = @PlantType, 
          createTime = @createTime, Address = @Address, GPSLocation = @GPSLocation, 
          TotalStringCapacity = @TotalStringCapacity, PlantTimeZone = @PlantTimeZone, 
          Country = @Country, EmailAddress = @EmailAddress
      WHERE Id = @plantId;
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('plantId', sql.Int, plantId)
      .input('Company', sql.NVarChar, updatedPlant.Company)
      .input('PlantName', sql.NVarChar, updatedPlant.PlantName)
      .input('PlantType', sql.NVarChar, updatedPlant.PlantType)
      .input('createTime', sql.DateTime, updatedPlant.createTime)
      .input('Address', sql.NVarChar, updatedPlant.Address)
      .input('GPSLocation', sql.NVarChar, updatedPlant.GPSLocation)
      .input('TotalStringCapacity', sql.Decimal(18, 2), updatedPlant.TotalStringCapacity)
      .input('PlantTimeZone', sql.NVarChar, updatedPlant.PlantTimeZone)
      .input('Country', sql.NVarChar, updatedPlant.Country)
      .input('EmailAddress', sql.NVarChar, updatedPlant.EmailAddress);

    await request.query(query);
    return { message: 'Plant updated successfully' };
  } catch (error) {
    throw new Error(`Error updating plant: ${error.message}`);
  }
}

// Delete a plant
async function deletePlant(plantId) {
  try {
    const query = `
      DELETE FROM Plants
      WHERE Id = @plantId;
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('plantId', sql.Int, plantId);

    await request.query(query);
    return { message: 'Plant deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting plant: ${error.message}`);
  }
}

module.exports = {
  fetchPlants,
  addPlant,
  updatePlant,
  deletePlant
};
