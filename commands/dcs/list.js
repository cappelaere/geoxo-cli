const axios = require("axios").default;
const assert = require('assert')
const { logger } = require('../../logger.js')
const { GetTokens } = require('../../auth.js')

let debug = false

const GEOXO_API_URL_AUTH = process.env.GEOXO_API_URL_AUTH
assert(GEOXO_API_URL_AUTH, "Undefined env GEOXO_API_URL_AUTH")

const list = async (options) => {
  try {
    debug = options.debug

    logger.info(`Processing DCS List ${JSON.stringify(options)}`)
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


    const tokens = GetTokens()
    const url = `${GEOXO_API_URL_AUTH}/dcs/search`
    if (debug) {
      logger.info(`posting to ${url}`)
    }
    logger.info("Posting...")
    await axios.post(url,
      {
        query,
        fields,
        limit
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
        // console.error(error)

        if (error.response && error.response.status) {
          logger.error(`Error: ${error.response.status}`)
          logger.error(error.response.data)
        } else {
          console.error(error)
        }
      })

  } catch (err) {
    logger.error(`***Err: ${err}`)
  }
}
module.exports.list = list