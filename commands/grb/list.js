const axios = require("axios").default;
const assert = require('assert')
const { logger } = require('../../logger.js')
const { GetTokens } = require('../../auth.js')
const moment = require('moment')

let debug = false

const GEOXO_API_URL_AUTH = process.env.GEOXO_API_URL_AUTH
assert(GEOXO_API_URL_AUTH, "Undefined env GEOXO_API_URL_AUTH")

const ValidateTimeEntry = (entry) => {
  if (!moment(entry).isValid()) {
    throw new Error(`Invalid entry format ${entry}`)
  }
}
const list = async (options) => {
  try {
    debug = options.debug

    logger.info(`Processing GRB List ${JSON.stringify(options)}`)
    const limit = options.limit || 100
    let queryCommas
    if (options.query) {
      queryCommas = options.query.split(',')
    }

    const query = {}
    if (queryCommas) {
      queryCommas.map((q) => {
        const arr = q.split(':')
        query[arr[0]] = arr[1]
      })
    }

    let fields
    if (options.fields) {
      fields = options.fields.split(',').map((f) => `${f}`)
    }

    const from = options.from
    const to = options.to

    // check for validity of time requests
    ValidateTimeEntry(from)
    ValidateTimeEntry(to)

    const tokens = GetTokens()

    const url = `${GEOXO_API_URL_AUTH}/grb/search`
    if (debug) {
      logger.info(`posting to ${url}`)
    }

    await axios.post(url,
      {
        query,
        fields,
        limit,
        from,
        to
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          "id_token": tokens.id_token,
          "auth_token": tokens.auth_token
        }
      })
      .then(function (response) {
        logger.info(`Response ${JSON.stringify(response.data, null, '  ')}`)
      })
      .catch(function (error) {
        logger.error(error.response.status)
        logger.error(error.response.statusText)
      })

  } catch (err) {
    logger.error(`***Err ${err}`)
  }
}
module.exports.list = list