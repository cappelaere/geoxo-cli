const { InitProducer, Disconnect, Subscribe } = require('../../kafka.js')

const subscribe = async (options) => {
    try {
        await InitProducer()
        console.log(`Subscribe ${JSON.stringify(options)}`)
        await Subscribe(options.topic)
        await Disconnect()
    } catch (err) {
        console.error(err)
    }
}

module.exports.subscribe = subscribe