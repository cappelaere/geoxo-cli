// List Topics
const { InitProducer, Disconnect, ListTopics } = require('../../kafka.js')

const list = async (options) => {
    await InitProducer()
    console.log(`Listing topics...`)
    try {
        let topics = await ListTopics()
        topics = topics.sort()

        console.log(`Current - ${topics.length} topics - ${JSON.stringify(options)}`)

        if (options.filter) {
            topics = topics.filter((t) => t.indexOf(options.filter) >= 0)
        }

        if (options.limit) {
            topics = topics.slice(0, options.limit)
        }

        console.log(JSON.stringify(topics, null, '\t'))
    } catch (err) {
        console.error(err)
    }
    Disconnect()
}

module.exports.list = list