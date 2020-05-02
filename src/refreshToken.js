const faunadb = require('faunadb')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')
const deleteRefreshToken = require('./deleteRefreshToken')
const createTokens = require('./createTokens')
const { DEFAULT_EXPIRATION } = require('../constants/jwt')

const q = faunadb.query

const unauthorized = () => {
  throw new Error('invalid token')
}

module.exports = (
  db,
  accessTokenSecret,
  refreshTokenSecret,
  expiresIn = DEFAULT_EXPIRATION
) => async refreshToken => {
  const tokenData = await verifyToken(refreshToken, refreshTokenSecret)

  if (!tokenData) unauthorized()

  const exists = await db
    .query(q.Exists(q.Match(q.Index('refreshTokens'), refreshToken)))
    .catch(() => false)

  if (!exists) unauthorized()

  await deleteRefreshToken(db)(refreshToken)

  return createTokens(
    db,
    accessTokenSecret,
    refreshTokenSecret,
    expiresIn
  )(tokenData)
}
