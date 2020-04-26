require('dotenv').config()
const faunadb = require('faunadb')
const bcrypt = require('bcrypt')
const initAuth = require('./index')
const jwt = require('jsonwebtoken')

const q = faunadb.query

const {
  DB_SECRET,
  ACCESS_SECRET,
  REFRESH_SECRET,
  USERNAME,
  PASSWORD,
  EXISTING_USER_ID,
  EXISTING_USER_USERNAME,
  EXISTING_USER_PASSWORD,
} = process.env

let newUserId = null
let existingUser = null
let accessToken = null
let refreshToken = null

const FaunaAuth = initAuth({
  dbSecret: DB_SECRET,
  accessSecret: ACCESS_SECRET,
  refreshSecret: REFRESH_SECRET,
  tokenDuration: 1000 * 5,
})

const delay = ms => new Promise(res => setTimeout(res, ms))

test('creates a user', async () => {
  const result = await FaunaAuth.create(USERNAME, PASSWORD, { some: 'data' })

  expect(result).toEqual({
    id: expect.any(String),
    username: USERNAME,
    hash: expect.any(String),
    some: 'data',
  })

  expect(await bcrypt.compare(PASSWORD, result.hash)).toBe(true)

  newUserId = result.id
})

test('updates a password', async () => {
  expect(newUserId).toBeTruthy()
  const result = await FaunaAuth.changePassword(newUserId, 'newPassword')

  expect(result).toEqual({
    id: expect.any(String),
    username: USERNAME,
    hash: expect.any(String),
    some: 'data',
  })

  expect(await bcrypt.compare('newPassword', result.hash)).toBe(true)
})

test('Deletes a user', async () => {
  expect(newUserId).toBeTruthy()

  const result = await FaunaAuth.delete(newUserId)

  expect(result.data.username).toEqual(USERNAME)
})

test('gets a user', async () => {
  const result = await FaunaAuth.get(EXISTING_USER_ID)
  expect(result).toEqual({
    id: EXISTING_USER_ID,
    username: 'existing@test.com',
    hash: expect.any(String),
    randomNumber: expect.any(Number),
  })

  existingUser = result
})

test('updates a user', async () => {
  expect(existingUser).toBeTruthy()

  const randomNumber = Math.floor(Math.random() * 20)

  const result = await FaunaAuth.update(existingUser.id, {
    randomNumber,
  })

  expect(result).toEqual({ ...existingUser, randomNumber })

  existingUser = result
})

test('authenticate', async () => {
  const result = await FaunaAuth.authenticate(
    EXISTING_USER_USERNAME,
    EXISTING_USER_PASSWORD
  )

  expect(result).toEqual({
    id: expect.any(String),
    username: EXISTING_USER_USERNAME,
    hash: expect.any(String),
    randomNumber: expect.any(Number),
  })
})

test('createTokens', async () => {
  expect(existingUser).toBeTruthy()

  const result = await FaunaAuth.createTokens(existingUser)

  expect(result).toEqual({
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
  })

  jwt.verify(result.accessToken, ACCESS_SECRET, (err, { id }) => {
    expect(id).toEqual(EXISTING_USER_ID)
  })

  accessToken = result.accessToken
  refreshToken = result.refreshToken
})

test('verify', async () => {
  expect(accessToken).toBeTruthy()
  expect(existingUser).toBeTruthy()

  const result = await FaunaAuth.verify(accessToken)

  expect(result).toEqual(existingUser)
})

test('refreshToken - valid refresh token', async () => {
  expect(refreshToken).toBeTruthy()
  await delay(100) // to ensure the jwt will be different

  const result = await FaunaAuth.refreshToken(refreshToken)

  expect(result).toEqual({
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
  })

  const exists = await new faunadb.Client({ secret: DB_SECRET })
    .query(q.Exists(q.Match(q.Index('refreshTokens'), refreshToken)))
    .catch(() => false)

  expect(exists).toBe(false)

  jwt.verify(result.accessToken, ACCESS_SECRET, (err, { id }) => {
    expect(id).toEqual(EXISTING_USER_ID)
  })

  refreshToken = result.refreshToken
})

test('refreshToken - invalid refresh token', async () => {
  FaunaAuth.refreshToken('abcdefg').catch(err => {
    expect(err.message).toEqual('invalid token')
  })
})

test('deleteRefreshToken', async () => {
  await FaunaAuth.deleteRefreshToken(refreshToken)

  FaunaAuth.refreshToken(refreshToken).catch(err => {
    expect(err.message).toEqual('invalid token')
  })
})

test('deauthenticate', async () => {
  expect(existingUser).toBeTruthy()

  const { refreshToken } = await FaunaAuth.createTokens(existingUser)

  const result = await FaunaAuth.deauthenticate(existingUser)

  expect(result.data[0].data.refreshToken).toEqual(refreshToken)
})
