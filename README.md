# open-tw-weather
1. features
- access open weather data by every hour
- could query right now weather by city paramater(臺北市、新北市、桃園市)
- for DB query performace purpose, delete past no use data by every day

2. prepare & using tools
- VS Code(IDE)
- Typescript(Main program language)
- ESLint
- nodemon(hot reload)
- ts-node(transpiler to js)

3. tech stack
- Express.js
- moment.js
- node-cron
- axios
- firebase-admin(using firestore)

ps. for security purpose, firestore key wasn't commit yet.