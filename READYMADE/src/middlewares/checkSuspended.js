// create a checkSuspended middleware
// if req.user.passiveType is SUSPENDED then return 403 Forbidden otherwise next()
const httpStatus = require('http-status')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')
const UserService = require('../services/Users')

const checkSuspended = async (req, res, next) => {
  await UserService.findOne({ _id: req.user._id })
    .then(async (foundUser) => {
      if (foundUser.passiveType === 'SUSPENDED') {
        // const error = new Error(i18n.__('suspended'))
        // error.status = httpStatus.FORBIDDEN
        // return next(error)
        return next(ApiError.forbidden(i18n.__('suspended')))
      } else {
        next()
      }
    })
    .catch((err) => {
      next()
    })
}

module.exports = checkSuspended
