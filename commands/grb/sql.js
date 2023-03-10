const axios = require("axios").default;
const assert = require('assert')
const { logger } = require('../../logger.js')
const { GetTokens } = require('../../auth.js')
const moment = require('moment')

let debug = false

const GEOXO_API_URL_AUTH = process.env.GEOXO_API_URL_AUTH
assert(GEOXO_API_URL_AUTH, "Undefined env GEOXO_API_URL_AUTH")

const sql = async (query, options) => {
    try {
        query = query.join(' ')
        debug = options.debug

        logger.info(`Processing GRB sql ${query}`)

        const url = `${GEOXO_API_URL_AUTH}/grb/sql`
        if (debug) {
            logger.info(`posting to ${url}`)
        }

        const tokens = GetTokens()

        await axios.post(url,
            {
                query
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
                //logger.error(error)
                console.log(error)
            })

    } catch (err) {
        console.error(err)
    }
}
module.exports.sql = sql