// Kafka Topic Management

const { Command } = require("commander")
const { publish } = require('./publish.js')
const { subscribe } = require('./subscribe.js')
const { list } = require('./list.js')

const { InitProducer } = require('../../kafka.js')

const topic = new Command("topic")

topic.command("list").action(list)
    .option("-f, --filter <format>", "filter topics")
    .option("-l, --limit <format>", "limit size of response")

topic.command("subscribe").action(subscribe)
    .option("-t, --topic <name>", "subcription topic")

topic.command("publish").action(publish)
    .option("-t, --topic <name>", "publishing topic")
    .option("-f, --file <name>", "file name")
    .option("-l, --value <value>", "value")



// start Kafka
// InitProducer()

module.exports.topic = topic