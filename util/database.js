const Sequelize = require('sequelize');

dbName = process.env.DB_NAME
console.log(dbName)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DB_HOST
} 
)


console.log('DB Credentials are: ')
console.log(process.env.DB_NAME)
console.log(process.env.DB_USERNAME)
console.log(process.env.DB_PASSWORD)
console.log(process.env.DB_HOST)

module.exports = sequelize;
