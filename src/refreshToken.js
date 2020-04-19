const faunadb = require('faunadb')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')

const q = faunadb.query

const unauthorized = () => {
  throw new Error('invalid token')
}

module.exports = (
  db,
  accessTokenSecret,
  refreshTokenSecret
) => async refreshToken => {
  const tokenData = await verifyToken(refreshToken, refreshTokenSecret)

  if (!tokenData) unauthorized()

  const exists = await db
    .query(q.Exists(q.Match(q.Index('refreshTokens'), refreshToken)))
    .catch(() => false)

  if (!exists) unauthorized()

  return {
    accessToken: jwt.sign(tokenData, accessTokenSecret),
  }
}
