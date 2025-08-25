
const sql = require('mssql');
const config = require('../config/config');

async function getHourlyEnergyData(plant, date) {
    try {
        let pool = await sql.connect(config.db);
        let today = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10); // Default to current date if date not provided

        // Validate plant input
        let deviceModel1, deviceModel2,deviceModel3,calculatedEnergyFactor;
        let deviceModel4, deviceModel5, deviceModel6, deviceModel7;

        if (plant === "Bodyknits") {
            deviceModel1 = '100KTL-M1';
            deviceModel2 = '30KTL-M3';
            calculatedEnergyFactor = 147.42;
        } else if (plant === "Sweelee") { 
            deviceModel1 = 'SUN2000-60KTL-M0';
            deviceModel2 = 'SUN2000-50KTL-M3';
            calculatedEnergyFactor = 134.865;
        } else if (plant.toLowerCase() === "32tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '100KTL-M2';
            calculatedEnergyFactor = 242.77;
        }else if (plant.toLowerCase() === "36tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = '50KTL-M3';
            calculatedEnergyFactor = 189.54;
        }
        else if (plant.toLowerCase() === "40tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            calculatedEnergyFactor = 119.34;
        }
        else if (plant.toLowerCase() === "73tuas") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            calculatedEnergyFactor = 103.54;
        } else if (plant.toLowerCase() === "80tuas") {
            deviceModel1 = '115KTL-M2a';
            deviceModel2 = '115KTL-M2b';
            deviceModel3 = '115KTL-M2c';
            calculatedEnergyFactor = 375.2;
        }
        else if (plant.toLowerCase() === "15tech") {
            deviceModel1 = '115KTL-M2';
            deviceModel2 = null;
            calculatedEnergyFactor = 91.845;
        }else if (plant.toLowerCase() === 'nicosteel') {
            deviceModel1 = '100KTL-M2';
            deviceModel2 = null; 
            calculatedEnergyFactor = 115.83;
          } else if (plant.toLowerCase() === 'sls') {
            deviceModel1 = '50KTL-M3';
            deviceModel2 = '60KTL-M0'; 
            calculatedEnergyFactor = 134.865;
          } 
          else if (plant.toLowerCase() === '110tuas1') {
    deviceModel1 = '125KTL3-Xa';
    deviceModel2 = '125KTL3-Xb';
    deviceModel3 = '125KTL3-Xc';
    deviceModel4 = '125KTL3-Xd';
    deviceModel5 = '125KTL3-Xe';
    deviceModel6 = '110KTL3-Xf';
    deviceModel7 = '110KTL3-Xg';
    calculatedEnergyFactor = 1049.61;
}
else if (plant.toLowerCase() === '110tuas2') {
    deviceModel1 = '125KTL3-Xa';
    deviceModel2 = '125KTL3-Xb';
    deviceModel3 = '125KTL3-Xc';
    deviceModel4 = '125KTL3-Xd';
    deviceModel5 = '125KTL3-Xe';
    deviceModel6 = '110KTL3-Xf';
    deviceModel7 = '110KTL3-Xg';
    calculatedEnergyFactor = 1049.61;
}

        else {
            throw new Error('Invalid plant name'); 
        }


        let query = `
            DECLARE @JsonResult NVARCHAR(MAX);

WITH HourlyData AS (
    SELECT 
        DATEADD(HOUR, DATEDIFF(HOUR, 0, EMI5.Time), 0) AS HourStart,
        MAX(EMI5.DailyIrrad) * 0.27778 AS MaxDailyIrrad,
        MAX(EMI5.Irrad) AS MaxIrrad,
        MAX(EMI5.DailyIrrad) * 0.27778 * @calculatedEnergyFactor AS CalculatedEnergy,
        MaxDailyEnergy = (
            SELECT SUM(MaxEnergy)
            FROM (
                SELECT MAX(I.DailyEnergy) AS MaxEnergy
                FROM Inverter I
                WHERE I.DeviceModel IN (@deviceModel1, @deviceModel2,@deviceModel3,@deviceModel4, @deviceModel5, @deviceModel6, @deviceModel7)
                AND DATEADD(HOUR, DATEDIFF(HOUR, 0, I.Time), 0) = DATEADD(HOUR, DATEDIFF(HOUR, 0, EMI5.Time), 0)
                AND CONVERT(DATE, I.Time) = @today
                GROUP BY I.DeviceModel
            ) AS EnergyPerDevice
        )
    FROM 
        EMI5
    WHERE 
        CONVERT(DATE, EMI5.Time) = @today
        AND CAST(EMI5.Time AS TIME) > '01:00:00'
    GROUP BY 
        DATEADD(HOUR, DATEDIFF(HOUR, 0, EMI5.Time), 0)
),
Differences AS (
    SELECT
        HD1.HourStart,
        FORMAT(DATEADD(HOUR, 1, HD1.HourStart), 'yyyy-MM-dd HH:00') + '-' + FORMAT(DATEADD(HOUR, 2, HD1.HourStart), 'HH:00') AS TimeRange,
        IrradDifference = CASE 
                              WHEN COALESCE(HD2.MaxDailyIrrad - HD1.MaxDailyIrrad, 0) < 0 THEN 0 
                              ELSE COALESCE(HD2.MaxDailyIrrad - HD1.MaxDailyIrrad, 0) 
                          END,
        HD1.MaxIrrad AS MaxIrrad,
        CalculatedEnergy = CASE 
                               WHEN HD2.CalculatedEnergy - HD1.CalculatedEnergy < 0 THEN 0 
                               ELSE HD2.CalculatedEnergy - HD1.CalculatedEnergy 
                           END,
        EnergyDifference = CASE 
                               WHEN COALESCE(HD2.MaxDailyEnergy - HD1.MaxDailyEnergy, 0) < 0 THEN 0 
                               ELSE COALESCE(HD2.MaxDailyEnergy - HD1.MaxDailyEnergy, 0) 
                           END
    FROM 
        HourlyData HD1
        LEFT JOIN HourlyData HD2 ON DATEADD(HOUR, 0, HD1.HourStart) = DATEADD(HOUR, -1, HD2.HourStart)
)
SELECT @JsonResult = '[{"Statistical Period":"' + FORMAT(@today, 'yyyy-MM-dd 01:00') + '-02:00", "Hourly Irradiance":"0", "Irradiance (W/m²)":"0", "Theoretical Yield (kWh)":"0", "PV Yield (kWh)":"0","Inverter Yield (kWh)":"0"},' +
    STUFF((
        SELECT 
            ',{"Statistical Period":"' + D.TimeRange + '", ' + 
            '"Hourly Irradiance":"' + CAST(D.IrradDifference AS NVARCHAR) + '", ' +
            '"Irradiance (W/m²)":"' + CAST(D.MaxIrrad AS NVARCHAR) + '", ' +
            '"Theoretical Yield (kWh)":"' + CAST(D.CalculatedEnergy AS NVARCHAR) + '", ' +
            '"PV Yield (kWh)":"' + CAST(D.EnergyDifference AS NVARCHAR) + '", ' +
            '"Inverter Yield (kWh)":"' + CAST(D.EnergyDifference AS NVARCHAR) + '"}'

        FROM 
            Differences AS D
        ORDER BY 
            HourStart
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') + ']';

SELECT @JsonResult AS JsonResult;

        `;

        let result = await pool.request()
            .input('today', sql.Date, today)
            .input('deviceModel1', sql.NVarChar, deviceModel1)
            .input('deviceModel2', sql.NVarChar, deviceModel2)
            .input('deviceModel3', sql.NVarChar, deviceModel2)
            .input('deviceModel4', sql.NVarChar, deviceModel4)
            .input('deviceModel5', sql.NVarChar, deviceModel5)
            .input('deviceModel6', sql.NVarChar, deviceModel6)
            .input('deviceModel7', sql.NVarChar, deviceModel7)

            .input('calculatedEnergyFactor', sql.Float, calculatedEnergyFactor)
            .query(query);

        return result.recordset[0].JsonResult;

    } catch (err) {
        throw new Error(`Error fetching hourly energy data: ${err.message}`);
    }
}
module.exports = {
    getHourlyEnergyData
};
