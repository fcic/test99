const sql = require('mssql');
const config = require('../../config/config');

async function getMonthlyIrradiance(plant, month) {
    try {
        let pool = await sql.connect(config.db);

        const query = `
            DECLARE @TargetDate AS VARCHAR(7) = @month;
            DECLARE @Results NVARCHAR(MAX);

            SET @Results = (
                SELECT
                    CONVERT(VARCHAR, CONVERT(date, Time), 120) AS [dateRange],
                    CAST(ROUND(MAX(DailyIrrad) * 0.27778, 2) AS VARCHAR) AS [dailyIrradiance]
                FROM EMI5
                WHERE
                    CONVERT(VARCHAR(7), Time, 120) = @TargetDate AND
                    CAST(Time AS TIME) > '01:00:00' AND
                    Plant = @plant
                GROUP BY CONVERT(date, Time)
                ORDER BY CONVERT(date, Time)
                FOR JSON PATH
            );

            SELECT @Results AS CombinedResult;
        `;

        const result = await pool.request()
            .input('month', sql.VarChar, month)
            .input('plant', sql.VarChar, plant)
            .query(query);

        const dataArray = JSON.parse(result.recordset[0].CombinedResult);

        // Format the output to only include the date and daily irradiance
        return dataArray.map(item => ({
            date: item.dateRange,
            dailyIrrad: parseFloat(item.dailyIrradiance)
        }));

    } catch (err) {
        throw new Error(`Error fetching daily irradiance data: ${err.message}`);
    }
}

module.exports = {
    getMonthlyIrradiance
};
