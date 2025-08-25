

const { fetchDataFromMSSQL, insertRevenueData,fetchData } = require('../models/FMModel');


exports.getRevenueData = async (req, res) => {
  const { plant } = req.body;

  try {
    const data = await fetchDataFromMSSQL(plant);

    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the specified plant" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in getRevenueData controller:", error);
    res.status(500).json({ message: "Error fetching data from MSSQL", error });
  }
};

exports.getRevenueDetail = async (req, res) => {
  const { plant } = req.body;

  try {
    // Fetch data from MSSQL and process it
    const data = await fetchData(plant);

    // If no revenue data is found for the plant, return a 404 response
    if (!data || Object.keys(data.monthlyRevenue).length === 0) {
      return res.status(404).json({ message: "No revenue data found for the specified plant" });
    }

    // Send the data back to the client (monthly revenue and yearly total)
    res.json({
      monthlyRevenue: data.monthlyRevenue, // Object with monthly revenue
      yearlyTotal: data.yearlyTotal, // Yearly total revenue
    });
  } catch (error) {
    console.error("Error in getRevenueData controller:", error);
    res.status(500).json({ message: "Error fetching data from MSSQL", error });
  }
};


exports.insertOrUpdateRevenue = async (req, res) => {
  try {
    const { month, data } = req.body;

    if (!month || !data) {
      return res.status(400).json({ message: 'Missing required fields: month or data' });
    }

    // Call insertRevenueData and handle the returned result
    const result = await insertRevenueData({ month, data });

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in insertOrUpdateRevenue controller:', error);
    res.status(500).send('Error updating revenue data');
  }
};
