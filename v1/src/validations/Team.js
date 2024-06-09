const Joi = require('joi')
const i18n = require('../config/translate')

const createValidation = Joi.object({
  name: Joi.string().required().label(i18n.__('labelName')),
  owners: Joi.array().items(Joi.string()).required().label(i18n.__('labelOwners')),
  members: Joi.array().items(Joi.string()).required().label(i18n.__('labelMembers')),
  passive: Joi.object({
    is: Joi.boolean().default(false),
    type: Joi.string().valid('NONE', 'DELETED', 'BLOCKED', 'SUSPENDED').default('NONE'),
    reason: Joi.string().default(''),
    passive_date: Joi.date().default(null),
  }),
})

const updateValidation = Joi.object({
  name: Joi.string().label(i18n.__('labelName')),
  owners: Joi.array().items(Joi.string()).label(i18n.__('labelOwners')),
  members: Joi.array().items(Joi.string()).label(i18n.__('labelMembers')),
  passive: Joi.object({
    is: Joi.boolean(),
    type: Joi.string().valid('NONE', 'DELETED', 'BLOCKED', 'SUSPENDED'),
    reason: Joi.string(),
    passive_date: Joi.date(),
  }),
})

const addMembersValidation = Joi.object({
  members: Joi.array().items(Joi.string()).required().label(i18n.__('labelMembers')),
})

const deleteMembersValidation = Joi.object({
  members: Joi.array().items(Joi.string()).required().label(i18n.__('labelMembers')),
})

module.exports = {
  createValidation,
  updateValidation,
  addMembersValidation,
  deleteMembersValidation,
}
