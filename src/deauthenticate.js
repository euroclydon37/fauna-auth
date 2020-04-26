const faunadb = require('faunadb')

const q = faunadb.query

module.exports = db => user =>
  db.query(
    q.Map(
      q.Paginate(q.Match(q.Index('byId'), user.id)),
      q.Lambda('token', q.Delete(q.Var('token')))
    )
  )
