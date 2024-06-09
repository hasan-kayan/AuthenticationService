// create a checkBlocked middleware
// if req.user.passiveType is BLOCKED then return 403 Forbidden otherwise next()
const httpStatus = require('http-status')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')
const UserService = require('../services/Users')

const checkBlocked = async (req, res, next) => {
  await UserService.findOne({ _id: req.user._id })
    .then(async (foundUser) => {
      if (foundUser.passiveType === 'BLOCKED') {
        // const error = new Error(i18n.__('blocked'))
        // error.status = httpStatus.FORBIDDEN
        // return next(error)
        return next(ApiError.forbidden(i18n.__('blocked')))
      } else {
        next()
      }
    })
    .catch((err) => {
      next()
    })
}

module.exports = checkBlocked
