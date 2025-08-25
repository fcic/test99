// const { getHourlyEnergyData } = require('../models/reportsDayModel');

// async function fetchHourlyEnergyData(req, res) {
//     const { plant, date } = req.body;

//     try {
//         let jsonData = await getHourlyEnergyData(plant, date);
//        // console.log(jsonData); 
//         let parsedData = JSON.parse(jsonData);

//         res.status(200).json({
//             success: true,
//             data: parsedData
//         });
//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch hourly energy data",
//             error: error.message
//         });
//     }
// }

// module.exports = {
//     fetchHourlyEnergyData
// };

const { getHourlyEnergyData } = require('../models/reportsDayModel');

async function fetchHourlyEnergyData(req, res) {
    const { plant, date } = req.body;

    try {
        let jsonData = await getHourlyEnergyData(plant, date);
        let parsedData = JSON.parse(jsonData);

        res.status(200).json({
            success: true,
            data: parsedData
        });
    } catch (error) {
        if (error.message === 'Invalid plant name') {
            return res.status(400).json({
                success: false,
                message: "Invalid plant name provided",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch hourly energy data",
            error: error.message
        });
    }
}

module.exports = {
    fetchHourlyEnergyData
};
