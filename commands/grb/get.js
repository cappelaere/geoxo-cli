// DCS Get
//
const axios = require("axios").default;
// const Axios = require('Axios')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { logger } = require('../../logger.js')
const moment = require('moment')
const { assert } = require('console')

var FetchStream = require("fetch").FetchStream;

const { GetTokens } = require('../../auth.js')

const GEOXO_API_URL_AUTH = process.env.GEOXO_API_URL_AUTH
assert(GEOXO_API_URL_AUTH, "Undefined env GEOXO_API_URL_AUTH")

let getDebug = false

let defaultUrl = `${GEOXO_API_URL_AUTH}/grb/`

const DownloadFile = async (data) => {
  return new Promise((resolve, reject) => {


    try {
      if (getDebug) {
        logger.info("data: %s", JSON.stringify(data, null, '  '))
      }
      let chunks = null
      let size = 0
      let bufs = []
      if (data.url) {
        let fileName = path.basename(data.key)
        var fetch = new FetchStream(data.url)
        var ts = moment(data.mtime).format()
        logger.info(`Downloading ${fileName} type: ${data.type} size: ${data.size} mtime:${ts}...`)

        fetch.on('data', function (chunk) {
          bufs.push(chunk)
        });

        fetch.on('end', () => {
          buffer = Buffer.concat(bufs)
          fs.writeFileSync(fileName, buffer)

          logger.info(`Written ${fileName} size: ${buffer.length}`)
          return resolve()
        })

        fetch.on('error', (err) => {
          console.error(err)
          return reject(err)
        })
      }
    } catch (err) {
      console.error(err)
    }
  })
}

const DownloadFile3 = async (data) => {
  try {
    if (data.url) {
      let fileName = path.basename(data.key)
      logger.info(`Downloading ${fileName} type: ${data.type} size: ${data.size}...`)
      const response = await Axios({
        url: data.url,
        method: 'GET',
        responseType: 'arrayBuffer',
        // headers: {
        //   'Content-Type': 'application/br',
        //   'Accept': 'application/br'
        // }
      })
      logger.info(response.data.length)
    }
  } catch (err) {
    console.error(err)
  }
}

const DownloadFile2 = async (data) => {
  try {
    if (getDebug) {
      logger.info("data: %s", JSON.stringify(data, null, '  '))
    }
    if (data.url) {
      let fileName = path.basename(data.key)
      logger.info(`Downloading ${fileName} type: ${data.type} size: ${data.size}...`)
      await axios.get(data.url)
        .then((response) => {
          logger.info(`Got ${response.data.length}`)
          if (data.type === 'application/br') {
            // response.data = zlib.brotliDecompressSync(response.data)
            logger.info(response.data.length, response.data)
            // fileName = fileName.replace('.br', '.json')
            // const readStream = fs.createReadStream(new Uint8Array(response.data))
            // const writeStream = fs.createWriteStream(fileName)

            // // Create brotli compress object
            // const brotli = zlib.createBrotliDecompress()

            // // Pipe the read and write operations with brotli compression
            // const stream = readStream.data.pipe(brotli).pipe(writeStream)

            // stream.on('finish', () => {
            //   logger.info('Done decompressing ????')
            //   // return resolve()
            // })
          } else {
            const buf = Buffer.from(response.data, 'binary')
            fs.writeFileSync(fileName, buf)
            logger.info(`Written ${fileName} ${response.data.length} ${buf.length}`)
          }
        })
        .catch((error) => {
          logger.error(error)
        })
    }
  } catch (err) {

  }
}

const get = async (id, myOptions) => {
  const options = myOptions
  try {
    let url = `${defaultUrl}${id}`
    if (options.debug) getDebug = options.debug

    if (options.meta) {
      url = `${defaultUrl}meta/${id}`
    } else if (options.class) {
      url += `?class=${options.class}`
    }

    logger.info(`Get content ${id}`)
    if (getDebug) logger.info(`GET url:${url}`)

    const tokens = GetTokens()

    // logger.info(tokens)
    await axios({
      url,
      method: 'get',
      headers:
      {
        'Authorization': `Bearer ${tokens.access_token}`,
        "id_token": tokens.id_token,
        "auth_token": tokens.auth_token
      }
    })
      .then(async (response) => {
        if (response.data.url) { // presigned
          await DownloadFile(response.data)
        } else {
          logger.info(response.data)
        }
      })
      .catch((error) => {
        if (error.response) {
          logger.error(`Error: ${error.response.status} - ${error.response.statusText}`)
        } else {
          logger.error(`Error: ${error} `)
        }
      })

  } catch (err) {
    logger.error(err)
  }
}

module.exports.get = get