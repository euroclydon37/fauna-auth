const faunadb = require('faunadb')
const { COLLECTIONS } = require('../constants/db')
const q = faunadb.query

exports.userById = id => q.Ref(q.Collection(COLLECTIONS.USERS), id)
