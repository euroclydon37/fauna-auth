const faunadb = require('faunadb')
const bcrypt = require('bcrypt')
const q = faunadb.query

const getByUsernameQuery = client => username =>
  client.query(q.Get(q.Match(q.Index('username'), username)))

const getIdQuery = client => ref => client.query(q.Select(['id'], ref))

module.exports = client => async (username, password) => {
  const getByUsername = getByUsernameQuery(client)
  const getId = getIdQuery(client)

  const { data, ref } = await getByUsername(username)
  const id = await getId(ref)

  const user = { ...data, id }

  const isValid = await bcrypt.compare(password, user.hash)

  return isValid ? user : Promise.reject('invalid credentials')
}
