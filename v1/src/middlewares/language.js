const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')

const language = (req, res, next) => {
  if (req.headers['language']) {
    i18n.setLocale(req.headers['language'].toLowerCase().substring(0, 2))
    next()
  } else {
    next(ApiError.badRequest('Language is not defined, please set language in headers.'))
  }
}

module.exports = language
