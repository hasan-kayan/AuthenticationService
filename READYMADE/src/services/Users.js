const BaseService = require('./BaseService')
const UserModel = require('../models/User')
// const { createPasswordToHash } = require('../scripts/utils/auth')
const i18n = require('../config/translate')
const ApiError = require('../errors/ApiError')

class Users extends BaseService {
  constructor() {
    super(UserModel)
  }

  create(data) {
    return new Promise((resolve, reject) => {
      UserModel.create(data)
        .then((memberdata) => resolve(memberdata))
        .catch((error) => {
          error.message = `${i18n.__('userCreateError')} ${error.message}`
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  // override
  list(where) {
    return new Promise(async (resolve, reject) => {
      await UserModel.find(where, '-password') // proection -password means do not return password
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.notFound(i18n.__('userListError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('userListError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.notFound(error.message))
        })
    })
  }

  // override findOne
  findOne(where) {
    return new Promise(async (resolve, reject) => {
      await UserModel.findOne(where)
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.notFound(i18n.__('userNotFound')))
        })
        .catch((error) => {
          error.message = `${i18n.__('userNotFound')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.notFound(error.message))
        })
    })
  }

  // override update
  update(id, data) {
    return new Promise(async (resolve, reject) => {
      await UserModel.findByIdAndUpdate(id, data, { new: true })
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('userUpdateError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('userUpdateError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  // override delete
  delete(id) {
    return new Promise(async (resolve, reject) => {
      await UserModel.findByIdAndDelete(id)
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('userDeleteError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('userDeleteError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  updateUnverifiedUsers() {
    // "passive": {
    //   "is": true,
    //   "type": "PENDING",
    //   "reason": "Your account is created but not verified yet. Please wait for verification. It can take some time. Thank you for your patience.",
    //   "passive_date": {
    //     "$date": "2024-01-25T10:53:56.788Z"
    //   }
    // },

    // just update all unverified users fields to passive.is = false, passive.reason = '', passive.type = 'NONE' and passive.passive_date = null

    return new Promise(async (resolve, reject) => {
      // first find all unverified users
      await UserModel.find({ 'passive.type': 'PENDING' })
        .then(async (response) => {
          if (response.length > 0) {
            // if there are unverified users, then update them one by one use for of loop and collect updated users mails to an array we are gonna send a mail to all of them
            // use UserModel.findByIdAndUpdate to update each user
            let updatedUsers = []

            for (let user of response) {
              await UserModel.findByIdAndUpdate(user._id, {
                passive: {
                  is: false,
                  type: 'NONE',
                  reason: '',
                  passive_date: null,
                },
              })
                .then((updatedUser) => {
                  updatedUsers.push(updatedUser.email)
                })
                .catch((error) => reject(error))
            }

            return resolve(updatedUsers)
          } else {
            // if there is no unverified users, then return a message
            return reject(ApiError.notFound('There is no unverified user.'))
          }
        })
        .catch((error) => reject(error))
    })
  }
}

module.exports = new Users()
