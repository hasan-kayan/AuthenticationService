const httpStatus = require('http-status')

module.exports = (error, req, res, next) => {
  let statusCode = error.status || 500
  let message = error.message || 'Internal Server Error...'

  if (error.message.includes('E11000')) {
    statusCode = httpStatus.CONFLICT
    message = 'This data already exists in the database...'
  }

  res.status(statusCode).send({ error: { code: statusCode, message } })
}
