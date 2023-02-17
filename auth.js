// Identity Management
//
// Pat Cappelaere, IBM Consulting
//
const fs = require('fs')
const axios = require('axios').default
const assert = require('assert')
const path = require('path')
const moment = require('moment')
const { jwtVerifier1, jwtVerifier2 } = require('./jwt')
const authConfigFileName = './config.json'
const authProfiles = './.auth.json'
const authConfig = require(authConfigFileName)
const { logger } = require('./logger.js')

let AuthDebug = 0

// Retrieves the latest tokens from last login
//
const GetTokens = () => {
  let tokens
  try {
    tokens = JSON.parse(fs.readFileSync(authConfig.envFileName))
  } catch (err) {
    logger.error(err)
  }
  return tokens
}

const UserInfo = async (data) => {
  if (!AuthDebug) return

  const usertok = await jwtVerifier2(data.id_token)
  const authtok = await jwtVerifier1(data.auth_token)

  const identity = usertok.payload
  identity.permissions = authtok.payload.permissions
  logger.info('User Info: %s', JSON.stringify(identity, null, '  '))
}

// Authenticate user with Auth0
//
const AuthenticateUser = (username, password) => {
  // logger.info(authConfig)
  var options = {
    method: 'POST',
    url: authConfig.url,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams({
      grant_type: 'password',
      username,
      password,
      audience: authConfig.audience,
      scope: 'profile openid read:dcs read:lzssc',
      client_id: authConfig.client_id,  // authConfig.client_id,
      client_secret: authConfig.client_secret
    })
  }

  return new Promise((resolve, reject) => {
    axios.request(options).then(async function (response) {
      // logger.info(response.data)
      const timestamp = moment()
      const expiration = moment()
        .add(response.data.expires_in, 's')

      response.data.created_at = timestamp.format()
      response.data.expired_at = expiration.format()
      response.data.username = username
      const realpath = path.resolve(authConfig.envFileName)

      response.data.auth_token = response.data.access_token
      // const id_token = response.data.id_token
      // const user = await jwtVerifier2(id_token)
      // logger.info('user:')
      // logger.info(user)

      response.data.access_token = await GetApiAccessToken()
      const tok = await jwtVerifier1(response.data.auth_token)
      response.data.permissions = tok.payload.permissions
      // logger.info(tok)
      fs.writeFileSync(realpath, JSON.stringify(response.data, null, '\t'))

      logger.info(`Tokens stored in ${realpath}`)
      logger.info(`Login expires at ${expiration.format()}`)

      await UserInfo(response.data)

      return resolve(response.data)
    }).catch(function (error) {
      if (error.response) {
        logger.error(`Error ${error.response.status} ${error.response.statusText}`)
      } else {
        logger.error(error)
      }
      return reject(error)
    })
  })
}

const GetApiAccessToken = () => {
  const client_id = authConfig.app_client_id
  const client_secret = authConfig.app_client_secret
  const audience = authConfig.app_audience
  const grant_type = 'client_credentials'
  const json = {
    client_id,
    client_secret,
    audience,
    grant_type
  }
  var options = {
    method: 'POST',
    url: authConfig.url,
    headers: { 'content-type': 'application/json' },
    data: json
  }
  return new Promise((resolve, reject) => {
    axios.request(options).then(async function (response) {
      const access_token = response.data.access_token
      return resolve(access_token)
    }).catch(function (error) {
      // if (error.response) {
      //   logger.error(`Error ${error.response.status} ${error.response.statusText}`)
      // } else {
      //   logger.error(error.response)
      // }
      return reject(error)
    })
  })
}

const Auth = async (options) => {
  let username
  let password
  try {
    if (options.debug) AuthDebug = options.debug

    if (options.list) { // list available profiles
      const profiles = JSON.parse(fs.readFileSync(authProfiles, 'utf-8'))
      const keys = Object.keys(profiles.profiles)
      logger.info("Availabel profiles: %j", keys)
      return
    }
    if (options.profile) {
      logger.info(`Reading profile file ${authProfiles} for ${options.profile}`)
      const profiles = JSON.parse(fs.readFileSync(authProfiles, 'utf-8'))

      const profile = profiles.profiles[options.profile]
      // logger.info(profile)
      username = profile.username
      password = profile.password
    } else {
      username = process.env.GEOXO_USERNAME
      password = process.env.GEOXO_PASSWORD
    }
    if (!username) {
      logger.info('undefined env GEOXO_USERNAME')
      throw new Error(`undefined env GEOXO_USERNAME`)
    }

    if (!password) {
      logger.info('undefined env GEOXO_PASSWORD')
      throw new Error(`undefined env GEOXO_PASSWORD`)
    }

    logger.info(`Authenticating user ${username}...`)
    await AuthenticateUser(username, password)
  } catch (err) {
    logger.error(`*** Authentication Error`)
    if (err.response) {
      logger.error(`Status ${err.response.status}`)
      logger.error(`Error ${err.response.statusText}`)
    }

  }
}

module.exports.AuthenticateUser = AuthenticateUser
module.exports.Auth = Auth
module.exports.GetTokens = GetTokens

// const test = async () => {
//   const tok = await GetApiAccessToken()
//   logger.info(tok)
// }

// test()
