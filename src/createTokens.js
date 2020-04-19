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
) => async ({ id }) => {
  if (!id) throw new Error('id must be present')
  // if (!email) throw new Error('email must be present')

  const accessToken = jwt.sign({ id }, accessTokenSecret, { expiresIn })
  let refreshToken

  while (!refreshToken) {
    const token = jwt.sign({ id }, refreshTokenSecret)

    const exists = await db
      .query(q.Exists(q.Match(q.Index('refreshTokens'), token)))
      .catch(() => false)

    refreshToken = exists ? null : token
  }

  await db.query(
    q.Create(q.Collection(COLLECTIONS.TOKENS), { data: { refreshToken } })
  )

  return { accessToken, refreshToken }
}
