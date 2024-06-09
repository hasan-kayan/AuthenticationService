const httpStatus = require('http-status')
const {
  createPasswordToHash,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} = require('../scripts/utils/auth')
const UserService = require('../services/Users')
const ApiError = require('../errors/ApiError')
const i18n = require('../config/translate')
const axios = require('axios')

const index = async (req, res, next) => {
  if (req.user.user_type !== 'ADMIN') {
    return next(
      ApiError.unauthorized(
        'You are not authorized to access this resource. Only administrators can access this resource.'
      )
    )
  }
  await UserService.list()
    .then((response) => {
      for (let user of response) {
        const newObject = user.toObject()
        delete user.password
        user = newObject
      }

      return res.status(httpStatus.OK).send(response)
    })
    .catch((error) => next(error))
}

const show = async (req, res, next) => {
  await UserService.findOne({ _id: req.params.id })
    .then((response) => {
      let user = response.toObject() // Convert to object for deleting password field
      if (user.password) delete user.password // Remove password from response for security reasons

      return res.status(httpStatus.OK).send(user)
    })
    .catch((error) => next(error))
}

// get details with IDs in the body(array)
const list = async (req, res, next) => {
  const userIDList = req.body.userIDs || []

  if (userIDList.length === 0) {
    return next(ApiError.badRequest('User ID list is empty.'))
  }

  await UserService.list({ _id: { $in: userIDList } })
    .then((response) => {
      // for (let user of response) {
      //   const newObject = user.toObject()
      //   delete user.password
      //   user = newObject
      // }

      // convert every data to object and if delete is in set undefined do it with for of loop

      let users = []
      for (let user of response) {
        let newUser = user.toObject()
        if (newUser.password) delete newUser.password
        users.push(newUser)
      }

      return res.status(httpStatus.OK).send(users)
    })
    .catch((error) => next(error))
}

// registration enumeration is not allowed for security reasons so we will send same message for all cases (user exists or not) for security reasons (to prevent registration enumeration)
const store = async (req, res, next) => {
  req.body.version = req.headers['version'] || 'oldVersion'

  const errMessage =
    'An error occurred with your registration. The cause of the error is can be: The password is of an invalid length. Use a longer password. The email address you entered is already registered or is invalid. You have not agreed to the terms of service. Please consider these issues and try again. If the problem persists, please contact us.'

  let isEmailUnique = false
  await UserService.findOne({ email: req.body.email })
    .then((response) => {
      if (response) isEmailUnique = false
    })
    .catch((error) => {
      if (error.status === 404) isEmailUnique = true
    })

  if (!isEmailUnique) {
    return next(ApiError.badRequest(errMessage))
  }

  await createPasswordToHash(req.body.password)
    .then((response) => {
      req.body.password = response
      req.body.privacy_policy = {
        accepted: true,
        accepted_date: Date.now(),
      }
      req.body.passive = {
        is: false,
        type: 'NONE',
        reason: '',
        passive_date: null,
      }
      // req.body.passive = {
      //   is: true,
      //   type: 'PENDING',
      //   reason:
      //     "Your account has been created but verification is pending. We'll inform you by email once your validation process is finished. We appreciate your patience.",
      //   passive_date: Date.now(),
      // }
    })
    .catch((error) => next(ApiError.badRequest(errMessage)))

  await UserService.create(req.body)
    .then(async (response) => {
      //Token generation
      const user = {
        ...response.toObject(),
        accessToken: generateAccessToken(response.toObject()),
        refreshToken: generateRefreshToken(response.toObject()),
      }

      if (user.password) delete user.password // Remove password from response for security reasons

      // TODO: Create a free tier SPACE for this user and make SPACE's owner this user automatically
      // POST /api/v1/space
      const SPACE_SERVICE_CREATE_URL = `${process.env.SPACE_SERVICE}/`
      // headers: language, authorization (bearer token), refresh_token
      let headers = {
        language: req.headers['language'],
        authorization: `Bearer ${user.accessToken}`,
        refresh_token: user.refreshToken,
      }
      let body = {
        name: `${user.name}'s Space`,
      }

      await axios
        .post(SPACE_SERVICE_CREATE_URL, body, { headers })
        .then((respFromSpace) => {
          // console.log('🚀 ~ Space Create Success: ', respFromSpace.data)
        })
        .catch((error) => {
          console.log('🚀 ~ Space Create Err: ', error)
        })

      if (response.passive.is === true) {
        return next(ApiError.unauthorized(response.passive.reason))
      }

      return res.status(httpStatus.CREATED).send(user)
    })
    .catch((error) => next(ApiError.badRequest(errMessage)))
}

const update = async (req, res, next) => {
  req.body.version = req.headers['version'] || 'oldVersion'

  await UserService.update(req.params.id, req.body)
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const destroy = async (req, res, next) => {
  // passive: {
  //   is: { type: Boolean, default: false },
  //   type: {
  //     type: String,
  //     enum: ['NONE', 'DELETED', 'BLOCKED', 'SUSPENDED'],
  //     default: 'NONE',
  //   },
  //   reason: { type: String, default: '' },
  //   passive_date: { type: Date, default: null },
  // },

  const passive = {
    is: true,
    type: 'DELETED',
    reason: 'User deleted.',
    passive_date: Date.now(),
  }
  await UserService.update(req.params.id, { passive })
    .then((response) => res.status(httpStatus.OK).send(response))
    .catch((error) => next(error))
}

const login = async (req, res, next) => {
  await createPasswordToHash(req.body.password)
    .then(async (response) => {
      req.body.password = response

      await UserService.findOne({ email: req.body.email })
        .then((response) => {
          if (req.body.password != response.password) {
            return next(ApiError.unauthorized(i18n.__('userNotFound')))
          }

          if (response.passive.is === true) {
            return next(ApiError.unauthorized(response.passive.reason))
          }

          const user = {
            ...response.toObject(),
            accessToken: generateAccessToken(response.toObject()),
            refreshToken: generateRefreshToken(response.toObject()),
          }

          if (user.password) delete user.password

          return res.status(httpStatus.OK).send(user)
        })
        .catch((error) => next(error))
    })
    .catch((error) => next(error))
}

const verify = async (req, res, next) => {
  await verifyAccessToken(req.body.accessToken, req.body.refreshToken)
    .then((tokens) => res.status(httpStatus.OK).send(tokens))
    .catch((error) => next(error))
}

// sendPasswordResetEmail
// account enumeration is not allowed for security reasons so we will send same message for all cases (user exists or not) for security reasons (to prevent account enumeration)
const sendPasswordResetEmail = async (req, res, next) => {
  const mail = req.body.email
  const message = 'Please check your email inbox for password reset link.'
  await UserService.findOne({ email: mail })
    .then(async (response) => {
      if (!response) {
        return res.status(httpStatus.OK).send(message)
      }

      let token = generatePasswordResetToken(response._id)
      token = token.toString()
      token = `http://kend.ai/reset/${token}`

      let data = { to: mail, code: token }

      // send email with token
      const EMAIL_URL = `${process.env.MAIL_SERVICE}/reset-password-mail`

      await axios
        .post(EMAIL_URL, data)
        .then((response) => {
          if (response.status === 200) {
            return res.status(httpStatus.OK).send(message)
          } else {
            return next(ApiError.badRequest('Email could not be sent.'))
          }
        })
        .catch((error) => next(error))
    })
    .catch((error) => {
      return res.status(httpStatus.OK).send(message)
    })
}
// resetPassword
const resetPassword = async (req, res, next) => {
  // // a route for reset password
  // router.route('/reset_password/:token').post(validate(schemas.resetPasswordValidation), resetPassword)

  const token = req.params.token
  if (!token) {
    return next(ApiError.badRequest('Password reset token is not provided.'))
  }
  const password = req.body.password
  const password_confirmation = req.body.password_confirmation

  if (password !== password_confirmation) {
    return next(ApiError.badRequest('Confirmation password is not matched.'))
  }

  await verifyPasswordResetToken(token)
    .then(async (ID) => {
      await createPasswordToHash(password)
        .then(async (hashedPass) => {
          await UserService.update(ID, { password: hashedPass })
            .then((response) => res.status(httpStatus.OK).send(response))
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .catch((error) => next(error))
}

const updateUnverifiedUsers = async (req, res, next) => {
  if (req.body.password === undefined) return next(ApiError.badRequest('Password is required.'))
  if (req.body.password !== process.env.UPDATE_UNVERIFIED_USERS_PASSWORD) {
    return next(ApiError.unauthorized('Invalid password.'))
  }

  await UserService.updateUnverifiedUsers()
    .then(async (response) => {
      // https://mail-service-v7w4u7ot4q-uc.a.run.app/send-bulk-mail
      // response is an array of all updated users mails so we can send a mail to all of them
      const MAIL_URL = `${process.env.MAIL_SERVICE}/send-bulk-mail`
      const body = {
        recipients: response,
        subject: 'Verification Completed',
        message:
          'Your account has been activated. You can now start designing with Kend. We apologize for the delay; our account verification processes have been slowed down due to high demand.',
      }
      await axios
        .post(MAIL_URL, body)
        .then((response) => {
          return res.status(httpStatus.OK).send('All unverified users updated and mails sent.')
        })
        .catch((error) => next(ApiError.badRequest('Mails could not be sent.')))
    })
    .catch((error) => next(error))
}

const registerBulk = async (req, res, next) => {
  const adminPassword = req.query.adminPassword || null
  // sample query: /register_bulk?adminPassword=123456

  // 'ARCHITECT'
  // 'DESIGNER'
  // 'DEVELOPER'
  // 'ENGINEER'
  // 'Executive'
  // 'PRODUCT MANAGER'
  // 'SALES'
  // 'STUDENT'
  // 'TEACHER'
  // 'OTHER'
  // sample body:
  // {
  //   "users": [
  //      {
  //        "name": "John",
  //        "surname": "Doe",
  //        "email": "john_doee@gmail.com".
  //        "title": "OTHER"' // valid values: 'ARCHITECT', 'DESIGNER', 'DEVELOPER', 'ENGINEER', 'EXECUTIVE', 'PRODUCT MANAGER', 'SALES', 'STUDENT', 'TEACHER', 'OTHER'
  //      }
  //    ]
  // }

  if (!process.env.BULK_REGISTER_PASSWORD || adminPassword !== process.env.BULK_REGISTER_PASSWORD) {
    return next(ApiError.badRequest('Invalid admin password'))
  }

  const unRegisteredUsers = req.body.users || [] // array of user objects with name, surname and email
  let registeredUsers = [] // array of registered user objects with email and unHashedPassword
  let failedUsers = [] // array of failed user objects email and reason
  if (unRegisteredUsers.length === 0) {
    return next(ApiError.badRequest('User list is empty.'))
  }

  const upperCaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz'
  const numberCharacters = '0123456789'
  const specialCharacters = '!@#$&_'
  const passwordLength = 8

  function shuffleString(str) {
    const array = str.split('')
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array.join('')
  }

  function randomPasswordGenerator() {
    // Combine all character sets into one string
    const combinedCharacters = upperCaseCharacters + lowerCaseCharacters + numberCharacters + specialCharacters
    // Shuffle the combined character set to randomize the order of characters
    const shuffledCharacters = shuffleString(combinedCharacters)

    let result = ''
    // Select characters from the shuffled set to create the password
    for (let i = 0; i < passwordLength; i++) {
      result += shuffledCharacters.charAt(Math.floor(Math.random() * shuffledCharacters.length))
    }
    return result
  }
  // password should be hashed
  // after the registration, we should create a space for each user and make them owner of their space

  // user model fields are: email, password, name, surname, title, user_type, passive, privacy_policy, version
  // user_type is 'MEMBER' by default
  // passive is { is: false, type: 'NONE', reason: '', passive_date: null }
  // title "OTHER" for all users
  // privacy_policy is { accepted: true, accepted_date: Date.now() }
  // version is '0.2.1'

  // use async await for of loop to register users one by one
  for (let user of unRegisteredUsers) {
    if (user.email === undefined || user.name === undefined || user.surname === undefined) {
      failedUsers.push({ email: user.email, reason: 'Email, name or surname is missing.' })
      continue
    }
    // check if user exists
    await UserService.findOne({ email: user.email })
      .then((response) => {
        if (response) {
          failedUsers.push({ email: user.email, reason: 'User already exists.' })
        }
      })
      .catch(async (error) => {
        if (error.status === 404) {
          // if user does not exist, then register user
          let unHashedPassword = randomPasswordGenerator()
          let hashedPassword = await createPasswordToHash(unHashedPassword)

          let data = {
            email: user.email,
            password: hashedPassword,
            name: user.name,
            surname: user.surname,
            title: user.title || 'OTHER',
            user_type: 'MEMBER',
            passive: {
              is: false,
              type: 'NONE',
              reason: '',
              passive_date: null,
            },
            privacy_policy: {
              accepted: true,
              accepted_date: Date.now(),
            },
            version: '0.2.1',
          }

          await UserService.create(data)
            .then(async (response) => {
              //Token generation
              const userCreated = {
                ...response.toObject(),
                accessToken: generateAccessToken(response.toObject()),
                refreshToken: generateRefreshToken(response.toObject()),
              }

              if (userCreated.password) delete userCreated.password // Remove password from response for security reasons

              // space creation
              const SPACE_SERVICE_CREATE_URL = `${process.env.SPACE_SERVICE}/`
              // headers: language, authorization (bearer token), refresh_token
              let headers = {
                language: req.headers['language'],
                authorization: `Bearer ${userCreated.accessToken}`,
                refresh_token: userCreated.refreshToken,
              }
              let body = {
                name: `${userCreated.name || userCreated.email.split('@')[0]}'s Space`,
              }

              // push user and his unhashed password to registeredUsers array
              registeredUsers.push({ email: userCreated.email, password: unHashedPassword })

              await axios
                .post(SPACE_SERVICE_CREATE_URL, body, { headers })
                .then((respFromSpace) => {
                  // console.log('🚀 ~ Space Create Success: ', respFromSpace.data)
                })
                .catch((err) => {
                  console.log(
                    '🚀 ~ Space Create Err: ',
                    err?.response?.data?.error?.message ||
                      err?.response?.data?.message ||
                      err?.message ||
                      'Unknown Error! Space creation failed.', // if space creation fails, push user to failedUsers array
                    userCreated.email, // email of the user whose space creation failed
                    unHashedPassword, // unhashed password of the user whose space creation failed (for information purposes)
                    err // error object
                  )

                  failedUsers.push({
                    email: userCreated.email,
                    reason: `Space creation failed. ${
                      err?.response?.data?.error?.message ||
                      err?.response?.data?.message ||
                      err?.message ||
                      'Unknown Error!'
                    }`,
                  })
                })
            })
            .catch((error) => {
              failedUsers.push({
                email: user.email,
                reason: `User registration failed. ${error.message || 'Unknown Error!'}`,
              })
            })
        } else {
          // if user exists, then add user to failedUsers array
          failedUsers.push({ email: user.email, reason: 'Email uniqueness check failed.' })
        }
      })
  }

  return res.status(httpStatus.OK).send({ registeredUsers, failedUsers })
}

module.exports = {
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
}
