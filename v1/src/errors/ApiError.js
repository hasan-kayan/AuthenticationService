class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.message = message
  }

  static badRequest(message) {
    return new ApiError(
      message || "Oops! It seems there's a problem with your request. Please check your data and try again.",
      400
    )
  }

  static unauthorized(message) {
    return new ApiError(
      message || "Access denied. You don't have permission to view this content. Please log in or contact support.",
      401
    )
  }

  static paymentRequired(message) {
    return new ApiError(message || 'Payment required. To access this feature, please complete your payment first.', 402)
  }

  static forbidden(message) {
    return new ApiError(
      message ||
        "Access forbidden. You don't have permission to access this resource. Contact an administrator for assistance.",
      403
    )
  }

  static notFound(message) {
    return new ApiError(
      message || "Sorry, the page you're looking for doesn't exist. Please check the URL or contact support.",
      404
    )
  }

  static methodNotAllowed(message) {
    return new ApiError(
      message || "Oops! This action isn't allowed on this page. Please try a different method or contact support.",
      405
    )
  }

  static conflict(message) {
    return new ApiError(
      message || "Conflict detected. There's a conflict with your request. Please review and make necessary changes.",
      409
    )
  }

  static internalServerError(message) {
    return new ApiError(
      message || 'Something went wrong on our end. Our team is working to fix it. Please try again later.',
      500
    )
  }

  static notImplemented(message) {
    return new ApiError(
      message || "Feature not implemented. The requested feature is not available at the moment. We're working on it.",
      501
    )
  }

  static badGateway(message) {
    return new ApiError(
      message || 'Bad Gateway. Our server is having trouble connecting to another server. Please try again later.',
      502
    )
  }

  static serviceUnavailable(message) {
    return new ApiError(
      message || "Service Unavailable. We're currently undergoing maintenance. Please check back soon.",
      503
    )
  }

  static gatewayTimeout(message) {
    return new ApiError(
      message || 'Gateway Timeout. Our server took too long to respond. Please try your request again.',
      504
    )
  }
}

module.exports = ApiError

// usage in services and controllers

// services:
// const ApiError = require('../errors/ApiError')
//
// class Teams {
//   constructor() {
//     this.TeamModel = require('../models/Team')
//   }
//
//   // override
//   create(data) {
//     return new Promise(async (resolve, reject) => {
//       await this.TeamModel.create(data)
//         .then((response) => {
//           if (response) resolve(response)
//           else reject(ApiError.badRequest())
//         })
//         .catch((error) => {
//           error.message = i18n.__('teamCreateError') + error.message || ''
//           reject(error)
//         })
//     })

// controllers:
// const TeamService = require('../services/Teams')
// const ApiError = require('../errors/ApiError')
//
// const index = async (req, res, next) => {
//   let userID = req.user._id || null
//   if (!userID) {
//     return next(ApiError.notFound())
//   }
//   await TeamService.list(userID)
//     .then((response) => res.status(httpStatus.OK).send(response))
//     .catch((error) => next(ApiError.notFound(error.message)))
// }
