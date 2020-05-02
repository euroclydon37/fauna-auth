const faunadb = require('faunadb')
const jwt = require('jsonwebtoken')
const { DEFAULT_EXPIRATION } = require('../constants/jwt')
const { COLLECTIONS } = require('../constants/db')

const q = faunadb.query

module.exports = (
  db,
  accessTokenSecret,
  refreshTokenSecret,
  expiresIn = DEFAULT_EXPIRATION
) => async user => {
  if (!user.id) throw new Error('id must be present')

  const accessToken = jwt.sign({ id: user.id }, accessTokenSecret, {
    expiresIn,
  })
  const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret)

  await db.query(
    q.Create(q.Collection(COLLECTIONS.TOKENS), {
      data: { userId: user.id, refreshToken },
    })
  )

  return { accessToken, refreshToken, expiration: Date.now() + expiresIn }
}
