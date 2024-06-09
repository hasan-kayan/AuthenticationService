const BaseService = require('./BaseService')
const TeamModel = require('../models/Team')
// const { createPasswordToHash } = require('../scripts/utils/auth')
const i18n = require('../config/translate')
const httpStatus = require('http-status')
const ApiError = require('../errors/ApiError')

class Teams extends BaseService {
  constructor() {
    super(TeamModel)
  }

  // override
  create(data) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.create(data)
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('teamCreateError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamCreateError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  // override
  list(where) {
    return new Promise(async (resolve, reject) => {
      // dont get passive teams
      await TeamModel.find({ $and: [{ ...where }, { 'passive.is': false }] })
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.notFound(i18n.__('teamListError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamListError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.notFound(error.message))
        })
    })
  }

  // override
  findOne(where) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.findOne({ $and: [{ ...where }, { 'passive.is': false }] })
        .populate('owners')
        .populate('members')
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.notFound(i18n.__('teamNotFound')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamNotFound')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.notFound(error.message))
        })
    })
  }

  // override
  update(id, data) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.findByIdAndUpdate(id, data, { new: true })
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('teamUpdateError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamUpdateError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  // override
  delete(id) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.findByIdAndDelete(id)
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('teamDeleteError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamDeleteError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  // not override, new method
  /**
   * Deletes a member from a team.
   * @param {string} teamID - The ID of the team to delete the member from.
   * @param {string} IDs - The ID of the member to delete from the team.
   * @returns {Promise<object>} - A Promise that resolves with the updated team object if successful, or rejects with an error if unsuccessful.
   * @throws {Error} - Throws an error if the team object cannot be updated.
   * @description This function removes a member from a team by updating the team object in the database. It returns a Promise that resolves with the updated team object if successful, or rejects with an error if unsuccessful.
   * @example
   * // Usage:
   * const teamID = 'team123';
   * const IDs = ['member1', 'member2']
   * deleteMember(teamID, IDs)
   *   .then((updatedTeam) => {
   *     console.log(updatedTeam);
   *   })
   *   .catch((error) => {
   *     console.error(error);
   *   });
   */
  deleteMember(teamID, IDs) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.findByIdAndUpdate(teamID, { $pull: { members: { $in: IDs } } }, { new: true })
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('teamDeleteMemberError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamDeleteMemberError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }

  /**
   * Adds members to a team.
   * @param {string} team_id - The ID of the team to add members to.
   * @param {Array<string>} member_ids - An array of member IDs to add to the team.
   * @returns {Promise<object>} - A promise that resolves with the updated team object or rejects with an error.
   * @throws {Error} - Throws an error if the team is not found or if there is an error while updating the team.
   * @description This function adds the specified members to the team with the given ID. It returns a promise that resolves with the updated team object or rejects with an error.
   * @example
   * // Adding members to a team
   * const team_id = 'team123';
   * const member_ids = ['member1', 'member2'];
   * addMembers(team_id, member_ids)
   *   .then((team) => {
   *     console.log('Members added to team:', team);
   *   })
   *   .catch((error) => {
   *     console.error('Error adding members to team:', error);
   *   });
   */
  addMembers(team_id, member_ids) {
    return new Promise(async (resolve, reject) => {
      await TeamModel.findByIdAndUpdate(team_id, { $push: { members: { $each: member_ids } } }, { new: true })
        .then((response) => {
          if (response) return resolve(response)
          else return reject(ApiError.badRequest(i18n.__('teamAddMembersError')))
        })
        .catch((error) => {
          error.message = `${i18n.__('teamAddMembersError')} ${error.message}`
          error.message = error.message.replace('Cast to ObjectId failed for value', 'Invalid ID')
          return reject(ApiError.badRequest(error.message))
        })
    })
  }
}

module.exports = new Teams()
