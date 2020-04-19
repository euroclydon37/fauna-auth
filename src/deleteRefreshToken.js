const faunadb = require('faunadb')

const q = faunadb.query

module.exports = db => async token => {
  const { ref } = await db
    .query(q.Get(q.Match(q.Index('refreshTokens'), token)))
    .catch(() => null)

  await db.query(q.Delete(ref)).catch(() => null)
}
