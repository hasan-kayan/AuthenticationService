const JWT = require('jsonwebtoken')
const httpStatus = require('http-status')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')
const UserService = require('../services/Users')

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || null
  if (!token) return next(ApiError.unauthorized(i18n.__('errors.unauthorized')))
  JWT.verify(token, process.env.APP_ACCESS_TOKEN_HASH, async (err, user) => {
    //
    if (err) return next(ApiError.unauthorized('Please login again.'))
    //
    // Dont get User informations from DB, check directly from JWT Token Data (faster) but not secure (if user is passive, we cant check it)
    // if (!user || user.passive.is === true)
    //   return next(ApiError.unauthorized('User is not found. Please check your credentials.'))
    //
    // GET Fresh User Data from DB and hold it to req.user
    await UserService.findOne({ _id: user._id })
      .then((response) => {
        //
        if (response) response = response.toObject()
        //
        if (response.password) delete response.password
        //
        if (!response || response.passive.is === true) {
          next(ApiError.unauthorized('User is not found. Please check your credentials.'))
          return
        }

        req.user = response
        next()
      })
      .catch((error) => next(ApiError.unauthorized('User is not found. Please check your credentials.')))

    // Commented because of we are getting fresh user data from DB
    // req.user = user
    // next()
  })
}

module.exports = authenticateToken
