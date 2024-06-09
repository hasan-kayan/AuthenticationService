const httpStatus = require('http-status')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')

const validate = (schema) => async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  if (error) {
    error.details.forEach((element) => {
      // console.log(element)
      // console.log(element.path)
      // console.log(element.context)

      switch (element.type) {
        case 'any.required':
          element.message = `${element.context.label} ${i18n.__('valideteCantBeEmpty')}`
          break
        case 'string.empty':
          element.message = `${element.context.label} ${i18n.__('valideteCantBeEmpty')}`
          break
        case 'array.empty':
          element.message = `${element.context.label} ${i18n.__('valideteCantBeEmpty')}`
          break
        case 'number.empty':
          element.message = `${element.context.label} ${i18n.__('valideteCantBeEmpty')}`
          break
        case 'string.email':
          element.message = i18n.__('validateEmail')
          break
        case 'string.min':
          element.message = `${element.context.label} ${i18n.__('validateStringMinLength', {
            value: element.context.limit,
          })}`
          break
        case 'number.min':
          element.message = `${element.context.label} ${i18n.__('validateNumberMin', {
            value: element.context.limit,
          })}`
          break
        case 'string.max':
          element.message = `${element.context.label} ${i18n.__('validateStringMaxLength', {
            value: element.context.limit,
          })}`
          break
        case 'number.max':
          element.message = `${element.context.label} ${i18n.__('validateNumberMax', {
            value: element.context.limit,
          })}`
          break
        case 'string.base':
          element.message = `${element.context.label} ${i18n.__('validateStringType')}`
          break
        case 'number.base':
          element.message = `${element.context.label} ${i18n.__('validateNumberType')}`
          break
        case 'any.only': // For enum
          element.message = `${element.context.label} ${i18n.__('validateEnum', {
            value: element.context.valids.toString(),
          })}`
          break
      }
    })
    const errorMessage = error.details?.map((detail) => detail.message).join(', ')
    return next(ApiError.badRequest(errorMessage))
  }
  Object.assign(req, value)
  return next()
}

module.exports = validate
