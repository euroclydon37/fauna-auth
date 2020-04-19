const faunadb = require('faunadb')
const verifyToken = require('./verifyToken')
const getUser = require('./getUser')

const q = faunadb.query

const unauthorized = () => {
  throw new Error('invalid token')
}

module.exports = (db, tokenSecret) => async accessToken => {
  const tokenData = await verifyToken(accessToken, tokenSecret)

  if (!tokenData) unauthorized()

  return getUser(db)(tokenData.id)
}
