const { Kafka, logLevel } = require('kafkajs');
const assert = require('assert')

assert(process.env.KAFKA_BOOTSTRAP_SERVER, "Undefined env KAFKA_BOOTSTRAP_SERVER")
assert(process.env.KAFKA_API_KEY, "Undefined env KAFKA_API_KEY")
assert(process.env.KAFKA_API_SECRET, "Undefined env KAFKA_API_SECRET")

const kafka = new Kafka({
    clientId: 'geocloud',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_API_KEY,
        password: process.env.KAFKA_API_SECRET
    }
});

async function testCreateTopic() {
    const admin = kafka.admin();

    const topicConfigs = [
        {
            "topic": "dcs.goes.PGC3",
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

    await admin.connect();
    return admin.createTopics({ validateOnly: false, topics: topicConfigs }).finally(() => admin.disconnect());
}

(async () => {
    try {
        await testCreateTopic().then(() => console.log("SUCCESS."));
    } catch (e) {
        console.log("Error: ", e);
    }
})();