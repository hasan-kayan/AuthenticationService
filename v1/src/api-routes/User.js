const express = require('express')
const router = express.Router()
const {
  index,
  show,
  list,
  store,
  update,
  destroy,
  login,
  verify,
  sendPasswordResetEmail,
  resetPassword,
  updateUnverifiedUsers,
  registerBulk,
} = require('../controllers/UserController')

const validate = require('../middlewares/validate')
const idchecker = require('../middlewares/idchecker')
const schemas = require('../validations/User')
const authenticateToken = require('../middlewares/authenticate')

router.route('/login').post(validate(schemas.loginValidation), login)
router.route('/register').post(validate(schemas.createValidation), store)
router.route('/verify_token').post(validate(schemas.refreshValidation), verify)
router.route('/').get(authenticateToken, index)
router.route('/:id').get(idchecker, authenticateToken, show)
router.route('/:id').patch(validate(schemas.updateValidation), idchecker, authenticateToken, update)
router.route('/get_users').post(validate(schemas.listValidation), authenticateToken, list)
router.route('/delete_user/:id').delete(idchecker, authenticateToken, destroy)

// a route for sending mail to user
router.route('/pass_reset_start').post(validate(schemas.resetPasswordMailSendValidation), sendPasswordResetEmail)
// a route for reset password
router.route('/pass_reset_end/:token').post(validate(schemas.resetPasswordValidation), resetPassword)

// a route for update all unverified users
router.route('/update_unverified').post(updateUnverifiedUsers)

router.route('/register_bulk').post(registerBulk)
module.exports = router
