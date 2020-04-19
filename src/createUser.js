const faunadb = require('faunadb')
const bcrypt = require('bcrypt')
const errAsync = require('./errorAsync')
const errorMsgs = require('../constants/errorMessages')
const { SALT_ROUNDS } = require('../constants/jwt')
const { COLLECTIONS } = require('../constants/db')

const q = faunadb.query

const createQuery = client => (email, hash, data) =>
  client.query(
    q.Create(q.Collection(COLLECTIONS.USERS), {
      data: { email, hash, ...data },
    })
  )

const existsQuery = client => email =>
  client.query(q.Exists(q.Match(q.Index('email'), email)))

const withIdQuery = client => ({ ref, data }) =>
  client.query(q.Select('id', ref)).then(id => ({ ...data, id }))

module.exports = client => async (email, password, extraData) => {
  if (!client) return errAsync(errorMsgs.noDB)

  const create = createQuery(client)
  const exists = existsQuery(client)
  const withId = withIdQuery(client)

  if (await exists(email)) {
    return errAsync(errorMsgs.userExists)
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS)

  const result = await create(email, hash, extraData)

  return withId(result)
}
