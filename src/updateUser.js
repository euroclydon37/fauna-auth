const faunadb = require('faunadb')
const { userById } = require('./commonQueries')
const q = faunadb.query

module.exports = db => (id, payload) =>
  db
    .query(q.Update(userById(id), { data: payload }))
    .then(({ data }) => ({ ...data, id }))
