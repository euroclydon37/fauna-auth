const jwt = require('jsonwebtoken')

module.exports = (token, secret) =>
  new Promise((res, rej) =>
    jwt.verify(token, secret, (err, data) => (err ? res(null) : res(data)))
  )
