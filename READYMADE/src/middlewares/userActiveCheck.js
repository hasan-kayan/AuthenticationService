const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')
const httpStatus = require('http-status')

const userActiveCheck = async (req, res, next) => {
  const user = { active: false, passiveType: 'DELETED' }

  if (user.active == true || (user.active == false && user.passiveType == 'SUSPENDED')) next()
  else if (user) {
    let message = ''
    switch (user.passiveType) {
      case 'DELETED':
        message = i18n.__('deleted')
        break
      case 'BLOCKED':
        message = i18n.__('blocked')
        break
      default:
        message = i18n.__('user_not_active')
        break
    }
    next(ApiError.forbidden(message))
  } else next(ApiError.forbidden(i18n.__('user_not_active')))
}

module.exports = userActiveCheck
