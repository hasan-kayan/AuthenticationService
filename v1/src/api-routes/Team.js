const express = require('express')
const router = express.Router()
const { index, show, store, update, destroy, addMembers, removeMember } = require('../controllers/TeamController')

const validate = require('../middlewares/validate')
const idchecker = require('../middlewares/idchecker')
const schemas = require('../validations/Team')
const authenticateToken = require('../middlewares/authenticate')

/**
 * Team List: 🔥
 * Team Create: 🔥
 * Team Update: 🔥
 * Team Delete: 🔥
 * Team Member(s) Add: 🔥
 * Team Member Remove: 🔥
 */

// router.route('/create').post(validate(schemas.createValidation), store)
// router.route('/verify_token').post(validate(schemas.refreshValidation), verify)
// router.route('/').get(authenticateToken, index)
// router.route('/:id').get(authenticateToken, idchecker, authenticateToken, show)
// router.route('/:id').patch(authenticateToken, idchecker, authenticateToken, update)

// TEAM ROUTES
router.route('/').get(authenticateToken, index) // List
router.route('/:id').get(authenticateToken, idchecker, show) // Show
router.route('/').post(authenticateToken, validate(schemas.createValidation), store) // Create
router.route('/:id').patch(authenticateToken, idchecker, validate(schemas.updateValidation), update) // Update
router.route('/:id').delete(authenticateToken, idchecker, destroy) // Delete

// TEAM MEMBERS ROUTES
router.route('/:id/members').post(authenticateToken, idchecker, validate(schemas.addMembersValidation), addMembers) // Add Members
router
  .route('/:id/members')
  .delete(authenticateToken, idchecker, validate(schemas.deleteMembersValidation), removeMember) // Remove Member

module.exports = router
