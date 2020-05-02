const faunadb = require('faunadb')
const { COLLECTIONS } = require('../constants/db')
const { withoutHash } = require('./utils/withoutHash')
const q = faunadb.query

module.exports = db => id =>
  db
    .query(q.Get(q.Ref(q.Collection(COLLECTIONS.USERS), id)))
    .then(({ data }) => withoutHash({ ...data, id }))
