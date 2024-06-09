const httpStatus = require('http-status')
// const {
//   createPasswordToHash,
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
// } = require('../scripts/utils/auth')
const TeamService = require('../services/Teams')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')

/**
 * Team List: ✅
 * Team Show: ✅
 * Team Create: ✅
 * Team Update: ✅
 * Team Delete: ✅
 * Team Member(s) Add: ✅
 * Team Member Remove: ✅
 */

const index = async (req, res, next) => {
  let userID = req.user._id || null
  if (!userID) return next(ApiError.badRequest(i18n.__('errorUserNotFound')))

  await TeamService.list({ $or: [{ owners: userID }, { members: userID }] })
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const show = async (req, res, next) => {
  await TeamService.findOne({ _id: req.params.id })
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const store = async (req, res, next) => {
  req.body.version = req.headers['version'] || 'oldVersion'

  await TeamService.create(req.body)
    .then((response) => res.status(httpStatus.CREATED).send(response))
    .catch((error) => next(error))
}

const update = async (req, res, next) => {
  req.body.version = req.headers['version'] || 'oldVersion'

  await TeamService.update(req.params.id, req.body)
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const destroy = async (req, res, next) => {
  // dont delete, just update status to false

  const dataToUpdate = {
    passive: {
      is: true,
      type: 'DELETED',
      reason: 'User deleted the team.',
      passive_date: new Date(),
    },
  }

  await TeamService.update(req.params.id, dataToUpdate)
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const addMembers = async (req, res, next) => {
  let IDs = req.body.members
  let teamID = req.params.id
  await TeamService.addMembers(teamID, IDs)
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

// Define a new async function called removeMember that takes in the request, response, and next objects as parameters
const removeMember = async (req, res, next) => {
  let IDs = req.body.members
  let teamID = req.params.id
  await TeamService.deleteMember(teamID, IDs)
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  addMembers,
  removeMember,
}
