const { Command } = require("commander")
const { get } = require('./get.js')
const { list } = require('./list.js')

const grb = new Command("grb")

grb.command("list")
    .option("-q, --query <format>", "query format in JMESPATH notation") // an optional flag, this will be in options.f
    .option("-f, --fields <format>", "array of field attributes")
    .option("-l, --limit <format>", "limit size of response")
    .option("--from <date>", "Date Time")
    .option("--to <date>", "Date Time")

    .option("-d, --debug <level>", "debug level")
    .action(list)

grb.command("get")
    .argument("<cid>", "the cid")
    .option("-m, --meta ", "metadata for all stored GRBs") // an optional flag, this will be in options.f
    .option("-c, --class <format>", "prefered storage class") // an optional flag, this will be in options.f
    .option("-d, --debug <level>", "debug level")
    .action(get)

grb.command("unhandled-error").action(async () => {
    updateSpinnerText("Processing an unhandled failure ")
    await new Promise(resolve => setTimeout(resolve, 3000))
    throw new Error("Unhandled error")
})

module.exports.grb = grb