const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const http = require('http')
const path = require('path')
const { rateLimit } = require('express-rate-limit')
const config = require('./v1/src/config')
const loaders = require('./v1/src/loaders')
const errorHandler = require('./v1/src/middlewares/errorHandler')
const setLanguage = require('./v1/src/middlewares/language')
const setVersion = require('./v1/src/middlewares/setVersion')
const ApiError = require('./v1/src/errors/ApiError')

const { UserRoutes, TeamRoutes } = require('./v1/src/api-routes')

const app = express()

config()
loaders()

// allow all cors requests
const corsConfig = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

const limiterConfig = {
  // allow 50 requests per 10 seconds per ip address
  windowMs: 1 * 10 * 1000, // 10 seconds
  max: 50, // limit each IP to 50 requests
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
}

app.use(cors(corsConfig))
app.use(helmet())
app.use(rateLimit(limiterConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

const handleCrash = (error, origin) => console.error('Unhandled Exception or Rejection at:', origin, 'error:', error)

process.on('uncaughtException', handleCrash)
process.on('unhandledRejection', handleCrash)

// Routes
app.set('trust proxy', 1)
app.get('/ip', (request, response) => response.send(request.ip))

app.use('/api/v1/health', (req, res) => {
  const message = 'Server is alive!'
  console.log(message)
  return res.status(200).send({ message })
})
app.use('/api/v1/users', setLanguage, setVersion, UserRoutes)
app.use('/api/v1/teams', setLanguage, setVersion, TeamRoutes)
app.use((req, res, next) => {
  // const error = new Error('Not Found')
  // error.status = 404
  // error.message = 'Sorry, we cannot find that!'
  // next(error)
  next(ApiError.notFound())
})
app.use(errorHandler)

var port = process.env.PORT || 8080
var server = http.createServer(app)
server.listen(port)

console.log(`🚀kend: App is running on ${process.env.NODE_ENV} ${port} ${process.env.APP_VERSION}`)

module.exports = app
