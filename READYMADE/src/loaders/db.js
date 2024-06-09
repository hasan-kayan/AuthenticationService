const Mongoose = require('mongoose')

Mongoose.set('strictQuery', false)
const db = Mongoose.connection

db.once('open', () => {
  console.log('📦kend: MongoDB is connected')
  console.log(`📦kend: MongoDB Database Name: kend-auth`)

  // send a ping to the database to check if the connection is established
  Mongoose.connection.db
    .admin()
    .ping()
    .then((result) => console.log('📦kend: MongoDB Ping Result: ', result.ok === 1 ? 'Success' : 'Failed'))
    .catch((error) => console.log('📦kend: MongoDB Ping Error: ', error))
})

db.once('close', () => console.log('📦kend: MongoDB is disconnected'))

const connectDB = async () => {
  const url = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  await Mongoose.connect(url)
    .then(() => {})
    .catch((error) => console.log(`📦kend: MongoDB Connection Error: ${error}`))
}

module.exports = { connectDB }
