const CryptoJS = require('crypto-js')
const JWT = require('jsonwebtoken')
const ApiError = require('../../errors/ApiError')
const UserService = require('../../services/Users')

const createPasswordToHash = (password) => {
  // CryptoJS.HmacSHA256(
  //   password,
  //   CryptoJS.HmacSHA1(process.env.APP_HASH_SIGNATURE || 'kend_password_hash', password).toString()
  // ).toString()

  // write like promise
  return new Promise((resolve, reject) => {
    const hash = CryptoJS.HmacSHA256(
      password,
      CryptoJS.HmacSHA1(process.env.APP_HASH_SIGNATURE, password).toString()
    ).toString()

    if (!hash) reject(ApiError.internalServerError('An error is occured while checking password. Please try again.'))
    resolve(hash)
  })
}

const generateAccessToken = (user) => {
  return JWT.sign(user, process.env.APP_ACCESS_TOKEN_HASH, {
    // 30 day
    expiresIn: '30d',
    // for test purposes, we set it to 10 minutes
    // expiresIn: '10m',
  })
}

const generateRefreshToken = (user) => {
  return JWT.sign(user, process.env.APP_REFRESH_TOKEN_HASH, {
    expiresIn: '90 days',
  })
}

const verifyAccessToken = (accessToken, refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(accessToken, process.env.APP_ACCESS_TOKEN_HASH, async (err, user_access) => {
      if (err) {
        // accessToken is invalid, try to re-generate accessToken if refreshToken is still valid.
        JWT.verify(refreshToken, process.env.APP_REFRESH_TOKEN_HASH, async (err_refresh, user_refresh) => {
          if (err_refresh) {
            reject(ApiError.unauthorized())
          } else {
            await UserService.findOne({ _id: user_refresh._id })
              .then(async (response) => {
                // refreshToken is valid, generate new accessToken and send it with old refreshToken.
                if (response.password) delete response.password // Remove password from response for security reasons
                const newAccessToken = await generateAccessToken(user_refresh)

                return resolve({
                  accessToken: newAccessToken,
                  refreshToken: refreshToken,
                  user: response,
                })
              })
              .catch((error) => reject(ApiError.unauthorized(error.message)))
          }
        })
      } else {
        // find user from database
        await UserService.findOne({ _id: user_access._id })
          .then((response) => {
            if (response.password) response.password = undefined // Remove password from response for security reasons

            // accessToken is valid, send it back with refreshToken.(User's session is still valid)
            resolve({
              accessToken: accessToken,
              refreshToken: refreshToken,
              user: response,
            })
          })
          .catch((error) => reject(ApiError.unauthorized(error.message)))
      }
    })
  })
}

// 5 minutes
const generatePasswordResetToken = (id) => {
  return JWT.sign({ userID: id }, process.env.APP_PASSWORD_RESET_TOKEN_HASH, {
    expiresIn: '5m',
  })
}

const verifyPasswordResetToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.APP_PASSWORD_RESET_TOKEN_HASH, (err, data) => {
      if (err) {
        switch (err.message) {
          case 'jwt expired':
            reject(ApiError.unauthorized('Sorry, your token is expired. Please try again.'))
            break
          case 'invalid signature':
            reject(ApiError.unauthorized('Sorry, your token is invalid. Please try again.'))
            break
          default:
            reject(ApiError.unauthorized('Sorry, your token is invalid. Please try again.'))
            break
        }
      } else {
        resolve(data.userID)
      }
    })
  })
}

module.exports = {
  createPasswordToHash,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
}
