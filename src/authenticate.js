const faunadb = require('faunadb')
const bcrypt = require('bcrypt')
const q = faunadb.query

const getByEmailQuery = client => email =>
  client.query(q.Get(q.Match(q.Index('email'), email)))

const getIdQuery = client => ref => client.query(q.Select(['id'], ref))

module.exports = client => async (email, password) => {
  const getByEmail = getByEmailQuery(client)
  const getId = getIdQuery(client)

  const { data, ref } = await getByEmail(email)
  const id = await getId(ref)

  const user = { ...data, id }

  const isValid = await bcrypt.compare(password, user.hash)

  return isValid ? user : Promise.reject('invalid credentials')
}
