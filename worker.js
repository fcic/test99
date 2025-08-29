
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); 
const config = require('./config/config'); 
const axios = require('axios');

const loginController=require('./controllers/loginController');
const dailyIrradiance=require('./controllers/dailyIrradianceController');

const alltogether=require('./controllers/energyController');
const latestEnergy=require('./controllers/latestEnergyController');
const stationList=require('./controllers/StationListController');
//user info
const { getUserInfo, createUser, modifyUser, removeUser } = require('./controllers/userInfoController');
//Graph1
const dailyPower=require('./controllers/dailyPowerController');
const monthlyPower=require('./controllers/monthlyPowerController');
const yearlyPower=require('./controllers/yearlyPowerController');
const lifetimePower=require('./controllers/lifetimePowerController');

//Reports
const dayReports=require('./controllers/reportsDayController');
const monthReports=require('./controllers/reportsMonthController');
const yearreports=require('./controllers/reportsYearController');
const lifetimeReports=require('./controllers/reportsLTController');
//Graph2
const dayEnergyGraph=require('./controllers/dayEnergyGraphController');
const monthEnergyGraph=require('./controllers/monthenergyGraphController');
const yearEnergyGraph=require('./controllers/yearEnergyGraphController');
const lifetimeEnergyGraph=require('./controllers/lifetimeGraphController');
const weekEnergyGraph=require('./controllers/weekEnergyGraphController');
//svg
const powerOutput=require('./controllers/svgDiagramController');
//Alarm
const alarmHistory=require('./controllers/alarmHistoryController');
const alarmActive=require('./controllers/alarmActiveController');
//palntmanagement
const {getPlantInfo,createPlant,modifyPlant,removePlant}=require('./controllers/plantManagementController');

//devices management
const {getDevices,createDevice,modifyDevice,removeDevice }=require('./controllers/deviceController');
//TotalPower
const dayPowerMeter=require('./controllers/TotalPowerYield/DayPowerMetreController');
const monthPowerMeter=require('./controllers/TotalPowerYield/MonthPowerMeterController');
const yearPowerMeter=require('./controllers/TotalPowerYield/YearPowerMeterController');
const lifetimePowerMeter=require('./controllers/TotalPowerYield/LifeTimePowerMeterController');
const consumptionPower=require('./controllers/TotalPowerYield/GetConsumptionPowerController');
//alarm
const alarmDetails=require('./controllers/alarmController');

//fm

const {getRevenueData,insertOrUpdateRevenue,getRevenueDetail}=require('./controllers/FMController');
const fmSolarYield=require('./controllers/FMSGController');

//temp
const latestTemp=require('./controllers/getLatestTempController');
const dayTemp=require('./controllers/getDayTempController');
//remotecontrol
const remoteControl=require('./controllers/Remote/RemoteControlController');
//graph comparison(sweelee vs sls)
const dailyIrradCompare=require('./controllers/GraphCompare/DailyIrradComparecontroller');
const powerMeterCompare=require('./controllers/GraphCompare/PowerMeterController');
//inverter info
const inverterInfo=require('./controllers/inverterInfoController');

const app = express();

app.use(bodyParser.json());

app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: ['http://localhost:4001','https://siva-solar.fcic.cc','http://trek-solar.fcic.cc','https://trek-solar.fcic.cc'], 
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));


connectDB();

//endpoints
app.post('/login', loginController.authenticateUser);
app.post('/api/dailyirrad',dailyIrradiance.fetchDailyIrradianceAndEnergy);
app.post('/v1/overview/station-real-kpi/',alltogether.fetchStationRealKPI);
app.post('/api/latestenergy',latestEnergy.fetchStationRealKPI);
app.post('/api/stationlist',stationList.fetchStationList);
//user info
app.post('/user/info',getUserInfo);
app.post('/user/add', createUser);
app.put('/user/update/:userId', modifyUser);
app.delete('/user/delete/:userId', removeUser);
//plant management
app.post('/plant/info',getPlantInfo);
app.post('/plant/create',createPlant);
app.put('/plant/update/:plantId',modifyPlant);
app.delete('/plant/delete/:plantId',removePlant);
//device management
app.get('/device/info',getDevices);
app.post('/device/create',createDevice);
app.put('/device/update/:deviceId',modifyDevice);
app.delete('/device/delete/:deviceId',removeDevice);
//graph1
app.post('/api/dailypower',dailyPower.fetchDailyIrradiance);
app.post('/api/monthlypower',monthlyPower.fetchLMData);
app.post('/api/yearlypower',yearlyPower.fetchYearlyIrradiance);
app.post('/api/lifetimepower',lifetimePower.fetchLifeTimeIrradiance);

//reports
app.post('/api/dayreports',dayReports.fetchHourlyEnergyData);
app.post('/api/monthreports',monthReports.getMonthlyReport);
app.post('/api/yearreports',yearreports.getReport);
app.post('/api/lifetimereports',lifetimeReports.getLifeTimeReport);

//graph2
app.post('/api/dayenergygraph',dayEnergyGraph.fetchDayEnergyData);
app.post('/api/monthenergygraph',monthEnergyGraph.getMonthEnergyData);
app.post('/api/yearenergygraph',yearEnergyGraph.getYearEnergyData);
app.post('/api/lifetimeenergygraph',lifetimeEnergyGraph.getLifetimeEnergyData);
app.post('/api/weekenergygraph',weekEnergyGraph.getWeekEnergyData);
//svg
app.post('/api/latest/powerout',powerOutput.getLatestPowerOutputController);

//alarm
app.post('/api/alarmhistory',alarmHistory.fetchAlarmsByPlantName);
app.post('/api/alarmActive',alarmActive.fetchAlarmsByPlantName);
//TotalPowerMeter-monitoring tabl
app.post('/api/daytotalpower',dayPowerMeter.getDayPowerMetre);
app.post('/api/monthtotalpower',monthPowerMeter.getMonthTotalYield);
app.post('/api/yeartotalpower',yearPowerMeter.getYearTotalPowerYield);
app.post('/api/lifetimetotalpower',lifetimePowerMeter.getLifetimeTotalPower);
app.post('/api/consumptionpower',consumptionPower.getConsumptionPower);
//alarm details
app.post('/api/alarmdetails',alarmDetails.fetchAlarm);

//fm model
app.post('/fmrequest',getRevenueData);
app.post('/fminsert',insertOrUpdateRevenue);
app.post('/fmrevenue',getRevenueDetail);
app.post('/fmsolaryield',fmSolarYield.getReport);

//temp
app.post('/getTemp',latestTemp.getTempController);
app.post('/getDayTemp',dayTemp.getDayTempGraphController);
//remote
app.post('/api/remoteinverter',remoteControl.getInverterDetails);

//graphcompare
app.post('/api/dailyirradcompare',dailyIrradCompare.getMonthlyIrradianceController);
app.post('/api/powermetercompare',powerMeterCompare.getLifetimeTotalPower);
//inverter info
app.post('/api/inverterinfo',inverterInfo.getInverterDetails);


app.post('/api/external/inverter', async (req, res) => {
  const externalUrl = 'http://fcic.cc:2501'; // External API URL

  try {
      const response = await fetch(externalUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
      });

      // Forward the response from the external API
      const data = await response.json();
      res.status(response.status).json(data);
  } catch (error) {
      console.error('Error calling external API:', error);
      res.status(500).json({ error: 'Failed to connect to external API' });
  }
});
app.post('/api/proxy-predict', async (req, res) => {
  try {
    const response = await axios.post('https://duan.fcic.cc/api/predict', req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Error in /api/proxy-predict:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch from external API' });
  }
});

app.post('/api/week-predict', async (req, res) => {
  try {
    // console.log('Request body to week API:', req.body);

    const response = await axios.post('https://duan.fcic.cc/api/week', req.body);

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Error in /api/week-predict:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch from external API' });
  }
});




// Start the server
const port = config.port;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
