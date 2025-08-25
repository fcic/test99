
const sql = require('mssql');
const config = require('../../config/config');

async function getDayEnergyData(plant, Date) {
    try {
        
        const pool = await sql.connect(config.db);

        const query = `
            DECLARE @TargetDate DATE = @Date;

            WITH EnergyAggregation AS (
                SELECT
                    FORMAT(time, 'HH:mm') AS TimeFormatted,
                    ISNULL(SUM(DailyEnergy), 0) AS SummedDailyEnergy
                FROM
                    Inverter
                WHERE
                    CAST(time AS TIME) BETWEEN '06:00:00' AND '20:00:00'
                    AND CAST(time AS DATE) = @TargetDate AND plant = @plant
                GROUP BY
                    FORMAT(time, 'HH:mm')
            )
            SELECT
                CONCAT('[[', STRING_AGG(CONCAT('"', TimeFormatted, '"'), ', ') WITHIN GROUP (ORDER BY TimeFormatted), '],',
                       '[', STRING_AGG(CAST(SummedDailyEnergy AS VARCHAR), ', ') WITHIN GROUP (ORDER BY TimeFormatted), ']]') AS EnergyArray
            FROM
                EnergyAggregation;
        `;

        const result = await pool.request()
            .input('Date', sql.Date, Date)
            .input('plant', sql.NVarChar, plant)
            .query(query);

        
        const energyArray = result.recordset[0].EnergyArray;
        const parsedArray = JSON.parse(energyArray);

        const response = {
            data: {
                xAxis: parsedArray[0],
                "Yield kWh": parsedArray[1].map(value => parseFloat(value)), 
            }
        };

        return response;
    } catch (error) {
        console.error('Error fetching energy data:', error.message);
        throw new Error('Error fetching energy data');
    }
     
}

module.exports = {
    getDayEnergyData
};
