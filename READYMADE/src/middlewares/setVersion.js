const setVersion = async (req, res, next) => {
  if (req.headers['version']) next()
  else {
    req.headers['version'] = 'old_version'
    next()
  }
}

module.exports = setVersion
