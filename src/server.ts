/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import express = require("express")
import cron from "node-cron"
import admin from "firebase-admin"
import moment from 'moment'
import axios from 'axios'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../tw-weather-firebase-adminsdk.json")
const app = express()
const port = 3000
const AUTH_KEY = 'CWB-01B3174C-C085-492F-990C-F09A49BA0B6F'
const LOCATION_LIST = encodeURIComponent('臺北市,新北市,桃園市')

// run up app and initial db credential
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
})

// 呼叫url 並 帶入city參數
app.get('/now', async (req, res) => {
    const city = req.query.city
    if (city) {
        const db = admin.firestore()
        const docRef = db.collection(city.toString())
        const docs = await docRef.get()
        const result: any = {}
        docs.forEach(doc => {
            const getDatetimeFromTo = doc.id.split('_')
            const rightNow = moment().format('yyyy-MM-DDTHH:mm:ss')
            // 尋找 此requset的時間在DB存取最接近的時間區間 並 抓取出來 以及 return
            if (moment(getDatetimeFromTo[0]).isSameOrBefore(rightNow) && moment(getDatetimeFromTo[1]).isSameOrAfter(rightNow)) {
                result.statusCode = 200
                result.city = city
                result.weather = doc.data()
                return
            }
        })
        Object.keys(result).length !== 0 ? res.json(result): res.json({stateCode: 403, message: "找無此城市，請重新輸入！"})
    } else {
        res.json({stateCode: 403, message: "請輸入合法參數！"})
    }
})

// 每一小時整點 抓取Weather open data from cwb by F-C0032-001 dataset
cron.schedule('0 */1 * * *', () => {
    // console.log('running a task every hours')
    console.log('running a task every hour')

    const url = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001"
    const db = admin.firestore()

    void axios.get(url, {
        params: {
            Authorization: AUTH_KEY,
            locationName: LOCATION_LIST,
            format: 'JSON'
        }
    })
    .then((response) => {
        // fetch locationList(ex. [{"locationName":"新北市", ...},{...},{...}])
        const locationList = response.data.records.location
        for (const locationIndex in locationList) {
            // fetch locationName(ex. 臺北市, 新北市, 桃園市)
            const locationName = locationList[locationIndex].locationName

            // fetch elementList(ex. [{"elementName":"PoP", ...},{...},{...},{...},{...}])
            const elementList = locationList[locationIndex].weatherElement
            for (const elementIndex in elementList) {
                // fetch elementName(ex. Wx, PoP, ...)
                const elementName = locationList[locationIndex].weatherElement[elementIndex].elementName

                // fetch timePeriodList(ex. [{"startTime":"2021-03-28 00:00:00", ...},{...},{...}])
                const timePeriodList = locationList[locationIndex].weatherElement[elementIndex].time
                for (const timePeroidIndex in timePeriodList) {
                    const startTime = moment(locationList[locationIndex].weatherElement[elementIndex].time[timePeroidIndex].startTime).format('yyyy-MM-DDTHH:mm:ss')
                    const endTime = moment(locationList[locationIndex].weatherElement[elementIndex].time[timePeroidIndex].endTime).format('yyyy-MM-DDTHH:mm:ss')
                    const parameterName = locationList[locationIndex].weatherElement[elementIndex].time[timePeroidIndex].parameter.parameterName
                    // set data into firestore
                    const docRef = db.collection(locationName).doc(`${startTime}_${endTime}`)
                    switch (elementName) {
                        case 'Wx':
                            void docRef.set({
                                wx: parameterName
                            },{ merge: true })
                            break
                        case 'PoP':
                            void docRef.set({
                                poP: `${parameterName}%`
                            },{ merge: true })
                            break
                        case 'MinT':
                            void docRef.set({
                                minT: `${parameterName}°C`
                            },{ merge: true })
                            break
                        case 'CI':
                            void docRef.set({
                                ci: parameterName
                            },{ merge: true })
                            break
                        case 'MaxT':
                            void docRef.set({
                                maxT: `${parameterName}°C`
                            },{ merge: true })
                            break
                        default:
                            break
                    }
                }
            }
        }
    })
    .catch((error) => {
        console.log('err: ' + error)
    }).then(() => {
        console.log('save weather dataset to firestore successfully！')
    })
})

// 為降低query cost 每日凌晨1點半 清除before today 1點半的資料
cron.schedule('30 1 * * *', () => {
    console.log('running a task 1:30 o\'clock by every night')

    const db = admin.firestore()
    void db.listCollections().then(async (collections) => {
        for (const collection of collections) {
            const docRef = db.collection(collection.id)
            const docs = await docRef.get()
            docs.forEach(doc => {
                const getDatetimeFromTo = doc.id.split('_')
                // get every docs last datetime and compare with run up datetime
                if (moment(getDatetimeFromTo[1]).isSameOrBefore(moment().format('yyyy-MM-DDTHH:mm:ss'))) {
                    const ref = db.collection(collection.id).doc(doc.id)
                    void ref.delete().then(() => {
                        console.log(doc.id + 'is deleted successfully！')
                    })
                }
            })
        }
    })
})
