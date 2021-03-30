"use strict";
exports.__esModule = true;
var express = require("express");
// import cron from "node-cron"
var app = express();
var port = 3000;
// const moment = require('moment')
// const https = require('https')
// import {
//     CityWeather
// } from './cityWeather'
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(port, function () {
    // console.log("HI");
    console.log("Example app listening at http://localhost:" + port);
    // console.log('moment now datetime: ' + moment().format('yyyy-MM-DDThh:mm:ss'))
    // console.log('moment -6 datetime: ' + moment().subtract(6, 'hours').format('yyyy-MM-DDThh:mm:ss'))
    // console.log('moment +6 datetime: ' + moment().add(6, 'hours').format('yyyy-MM-DDThh:mm:ss'))
    // const url = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-01B3174C-C085-492F-990C-F09A49BA0B6F&format=JSON&locationName=%E6%A1%83%E5%9C%92%E5%B8%82&timeFrom=2021-03-28T02%3A51%3A48&timeTo=2021-03-29T02%3A51%3A48"
    // https.get(url, (res: any) => {
    //     const getAllCityWeather = []
    //     const getCityWeatherData = new CityWeather("a", "b", "c", "d", "e", "f")
    //     console.log(getCityWeatherData);
    //     console.log(res.statusCode)
    //     res.on("data", (data: any) => {
    //         // console.log(data)
    //         const weatherData = JSON.parse(data)
    //         // console.log(weatherData.records.location.locationName)
    //         const cityWeather = weatherData.records.location
    //         console.log(cityWeather.length)
    //         console.log(cityWeather[0].locationName)
    //         console.log(cityWeather[0].weatherElement.length)
    //         const elementNums = cityWeather[0].weatherElement.length
    //         for (let i = 0; i < elementNums; i++) {
    //             console.log(cityWeather[0].weatherElement[i].elementName)
    //             console.log(cityWeather[0].weatherElement[i].time[0].parameter.parameterName)
    //         }
    //         // console.log(JSON.stringify(cityWeather))
    //         const getCityWeatherInfo = JSON.stringify(cityWeather)
    //         // console.log(getCityWeatherInfo[0].weatherElement)
    //     })
    // })
});
// cron.schedule('* * * * *', () => {
//     console.log('running a task every minute');
// });