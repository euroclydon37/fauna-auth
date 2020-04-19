const bcrypt = require('bcrypt')
const updateUser = require('./updateUser')
const { SALT_ROUNDS } = require('../constants/jwt')

module.exports = db => async (id, password) => {
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  return updateUser(db)(id, { hash })
}
