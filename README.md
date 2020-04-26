# Fauna Auth

A library for user authentication backed by [FaunaDB](https://fauna.com/)

## Installation

```sh
# npm
npm i --save fauna-auth

#yarn
yarn add fauna-auth
```

## Setup

There are a few preliminary steps.

1. Create an account at [fauna.com](https://fauna.com)
2. Create a database
3. Inside the database you just made, create two collections: `users` and `tokens`.
4. Create three indexes.
    1. One called "username" for the `users` collection with "data.username" as the term.
    2. One called "tokens" for the `tokens` collection with "data.refreshTokens" as the term.
    3. One called "byId" for the `tokens` collection with "data.userId" as the term.
4. Create a new key for your database.
5. Create two secrets (long, preferably random strings) for signing jwt tokens.
    1. One for access tokens.
    2. Another for refresh tokens.

_Note: Please do not commit your key to github. All the examples below will be using environment variables._

Now that you have your key and your secrets, you can initialize the library.

```js
const initAuth = require('./index')

const FaunaAuth = initAuth({
  dbSecret: process.env.DB_SECRET,
  accessSecret: process.env.ACCESS_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  tokenDuration: 1000 * 60 * 15,
})
```

And finally, you can manage and authenticate users.

```js
// Create a user
const newUser = await FaunaAuth.create('username', 'password', { some: 'data' })

// Update a user
const updatedUser = await FaunaAuth.update(existingUser.id, { more: 'data' })

// Change a user's password
const updatedUser = await FaunaAuth.changePassword(existingUser.id, 'newPassword')

// Delete a user
await FaunaAuth.delete(updatedUser.id)

// Authenticate a user
const user = await FaunaAuth.authenticate('username', 'password')

// Create tokens
const { accessToken, refreshToken } = await FaunaAuth.createTokens(user)

// Verify access tokens
const verifiedUser = await FaunaAuth.verify(accessToken)

// Refresh tokens
const { accessToken, refreshToken } = await FaunaAuth.refreshToken(refreshToken)

// Delete refresh tokens when the user manually logs out
await FaunaAuth.deleteRefreshToken(refreshToken)

// Or
await FaunaAuth.deauthenticate(user)
```

## Todo
* Social Authentication