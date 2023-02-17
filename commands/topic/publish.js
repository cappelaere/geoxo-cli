const { InitProducer, Publish, Disconnect, ListTopics } = require('../../kafka.js')
const fs = require('fs')

const publish = async (options) => {
    try {
        await InitProducer()
        console.log(`Publishing  ${JSON.stringify(options)}`)
        if (options.file) {
            const json = JSON.parse(fs.readFileSync(options.file, 'utf-8'))
            await Publish(options.topic, JSON.stringify(json))
        } else {
            await Publish(options.topic, options.value)
        }
        await Disconnect()
    } catch (err) {
        console.error(err)
    }
}

module.exports.publish = publish