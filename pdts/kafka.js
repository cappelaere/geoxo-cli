const fs = require('fs')
// const Kafka = require('node-rdkafka')
const { Kafka, logLevel } = require('kafkajs')
const { Partitioners } = require('kafkajs')
const { CompressionTypes } = require('kafkajs')

const assert = require('assert')
const moment = require('moment')
const readline = require('readline')
// const PdtFileName = 'PDTS_COMPRESSED.txt'
const PdtFileName = 'pdt_04032023.txt'
const fieldWidths = [6, 8, 1, 3, 1, 3, 6, 6, 4, 4, 1, 2, 1, 1, 31, 7, 8, 1, 14, 16, 1, 1, 6, 24, 20, 20, 30, 11, 1, 1]

assert(process.env.KAFKA_BOOTSTRAP_SERVER, "Undefined env KAFKA_BOOTSTRAP_SERVER")
assert(process.env.KAFKA_API_KEY, "Undefined env KAFKA_API_KEY")
assert(process.env.KAFKA_API_SECRET, "Undefined env KAFKA_API_SECRET")

const default_topic = 'geocloud'

const config = {
    clientId: 'geocloud',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_API_KEY,
        password: process.env.KAFKA_API_SECRET
    },
    retry: {
        initialRetryTime: 100,
        retries: 8
    },
    // logLevel: logLevel.ERROR
}
const kafka = new Kafka(config)
let producer, consumer, admin

const topics = []
const agencies = []

const InitProducer = async () => {
    // console.log('Initing Kafka...')
    producer = kafka.producer({
        createPartitioner: Partitioners.DefaultPartitioner
    })

    await producer.connect()

    admin = kafka.admin()
    await admin.connect()
}

const ListTopics = async () => {
    return await admin.listTopics()
}

async function CreateTopic(topic) {

    const topicConfigs = [
        {
            "topic": topic,
            "numPartitions": 1,
            "replicationFactor": 1,
            "configEntries": [
                {
                    "name": "cleanup.policy",
                    "value": "delete"
                }
            ]
        }
    ];

    return admin.createTopics({ validateOnly: false, topics: topicConfigs }) //.finally(() => admin.disconnect());
}

const DeleteTopic = async (topic) => {
    return await admin.deleteTopics({
        topics: [topic]
    })
}

const Publish = async (topic, value) => {
    console.log(`Publish to ${topic} - ${value}`)
    await producer.send({
        topic,
        messages: [{ value }],
        compression: CompressionTypes.GZIP
    })
    console.log('Done.')
}

const Disconnect = async () => {
    await producer.disconnect()
    await admin.disconnect()
}

const Subscribe = async (topic) => {
    const consumer = kafka.consumer({ groupId: 'test-group' })
    await consumer.subscribe({ topics: [topic], fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                topic,
                value: message.value.toString(),
            })
        },
    })
}

module.exports.DeleteTopic = DeleteTopic
module.exports.ListTopics = ListTopics
module.exports.CreateTopic = CreateTopic
module.exports.Publish = Publish
module.exports.Subscribe = Subscribe
module.exports.Disconnect = Disconnect
module.exports.InitProducer = InitProducer

const test = async () => {
    await InitProducer()
    const value = `DCS Producer started ${moment().format()}`
    await Publish(default_topic, value)

    const consumer = kafka.consumer({ groupId: 'test-group' })
    await consumer.subscribe({ topic: default_topic, fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                topic,
                value: message.value.toString(),
            })
        },
    })
}
// test()
const GetField = (line, index) => {
    let position = 0
    for (let i = 0; i < index; i++) {
        position += fieldWidths[i]
    }
    const value = line.substring(position, position + fieldWidths[index])
    return value
}

const ParsePdtFile = async (fileName) => {
    return new Promise((resolve, reject) => {
        let lineno = 0
        let json = '{\n'
        const lineReader = readline.createInterface({
            input: fs.createReadStream(fileName)
        })

        lineReader.on('line', async function (line) {
            // console.log(line)
            const entry = {
                agency: GetField(line, 0),
                dcpAddress: GetField(line, 1),
                st_channel: GetField(line, 3),
                rd_channel: GetField(line, 4),
                st_first_xmit_sod: GetField(line, 6),
                st_xmit_interval: GetField(line, 7),
                st_xmit_window: GetField(line, 8),
                baud: GetField(line, 9),
                data_format: GetField(line, 10),
                state_abbr: GetField(line, 11),
                location_code: GetField(line, 13),
                description: GetField(line, 14)
            }
            lineno += 1
            // const topic = `dcs.goes.${entry.agency}.${entry.dcpAddress}`
            // console.log(topic)
            // topics.push(topic)
            if (!agencies.includes(entry.agency)) {
                agencies.push(entry.agency)
            }
            json += `\t\"${entry.dcpAddress}\": \"${entry.agency}\",\n`
        })

        lineReader.on('close', function () {
            console.log(`Done parsing ${lineno}`)
            json += '}'
            const outFile = fileName.replace('.txt', '.json')
            fs.writeFileSync(outFile, json)
            return resolve()
        })
    })
}

const CreateAllTopicsFromPDT = async () => {
    await InitProducer()
    await ParsePdtFile(PdtFileName)
    console.log(`Add topics: ${agencies.length}`)
    for (let a of agencies.sort()) {
        const t = `dcs.goes.${a}`
        console.log(`Create ${t}`)
        const result = await CreateTopic(t)
        console.log(result)
    }
    const topics = agencies.sort().map((a) => { return `dcs.goes.${a}` })
    fs.writeFileSync('topics.json', topics.join(',\n'))

    // // topics.push('dcs.goes.FREPOL.FFF0073A')
    // for (let t of topics) {
    //   console.log(`Create ${t}`)
    //   const result = await CreateTopic(t)
    //   console.log(result)
    // }
    // const currentTopics = await ListTopics()
    // console.log(`Current Topics ${currentTopics.length}`)
    // console.log(currentTopics)
    await Disconnect()
}
// CreateAllTopicsFromPDT()

const CreateAllTopics = async () => {
    await InitProducer()

    const topics = ['geocloud', 'dcs.goes', 'dcs.iridium', 'dcs.test']
    for (let t of topics) {
        console.log(`Create ${t}`)
        const result = await CreateTopic(t)
        console.log(result)
    }

    const currentTopics = await ListTopics()
    console.log(`Current Topics ${currentTopics.length}`)
    console.log(currentTopics)

    await Disconnect()
}

// CreateAllTopics()

const DeleteAllTopics = async () => {
    await InitProducer()
    const currentTopics = await ListTopics()
    for (let t of currentTopics) {
        console.log(`Delete ${t}`)
        await DeleteTopic(t)
    }
    await Disconnect()
}
// DeleteAllTopics()

const test1 = async () => {
    await CreateAllTopicsFromPDT()
}
test1()