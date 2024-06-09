const Joi = require('joi')
const i18n = require('../config/translate')

const createValidation = Joi.object({
  email: Joi.string().email().required().label(i18n.__('labelEmail')),
  password: Joi.string().required().min(8).label(i18n.__('labelPassword')),
  name: Joi.string().required().label(i18n.__('labelName')),
  surname: Joi.string().required().label(i18n.__('labelSurname')),
  title: Joi.string().required().label(i18n.__('labelTitle')),
  user_type: Joi.string().valid('ADMIN', 'MEMBER', 'GUEST').default('MEMBER').label(i18n.__('labelUserType')),
  privacy_policy: Joi.object({
    accepted: Joi.boolean().default(false).label(i18n.__('labelAccepted')),
    accepted_date: Joi.date().default(null).label(i18n.__('labelAcceptedDate')),
  }).label(i18n.__('labelPrivacyPolicy')),
})

const loginValidation = Joi.object({
  email: Joi.string().email().required().label(i18n.__('labelEmail')),
  password: Joi.string().required().label(i18n.__('labelPassword')),
})

const refreshValidation = Joi.object({
  accessToken: Joi.string().required().label(i18n.__('labelAccessToken')),
  refreshToken: Joi.string().required().label(i18n.__('labelRefreshToken')),
})

const listValidation = Joi.object({
  userIDs: Joi.array().items(Joi.string()).required().label(i18n.__('labelUserIDs')),
})

const updateValidation = Joi.object({
  email: Joi.string().email().label(i18n.__('labelEmail')),
  name: Joi.string().label(i18n.__('labelName')),
  surname: Joi.string().label(i18n.__('labelSurname')),
  title: Joi.string().label(i18n.__('labelTitle')),
  user_type: Joi.string().valid('ADMIN', 'MEMBER', 'GUEST').label(i18n.__('labelUserType')),
})

// reset password validations, one for sending mail and one for reset password
const resetPasswordMailSendValidation = Joi.object({
  email: Joi.string().email().required().label(i18n.__('labelEmail')),
})
const resetPasswordValidation = Joi.object({
  password: Joi.string().required().min(8).label(i18n.__('labelPassword')),
  password_confirmation: Joi.string().required().min(8).label(i18n.__('labelPasswordConfirmation')),
})

module.exports = {
  createValidation,
  loginValidation,
  refreshValidation,
  listValidation,
  updateValidation,
  resetPasswordMailSendValidation,
  resetPasswordValidation,
}
