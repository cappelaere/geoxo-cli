const { Command } = require("commander")
const { get } = require('./get.js')
const { list } = require('./list.js')
const { sql } = require('./sql.js')

const dcs = new Command("dcs")

dcs.command("list")
  .option("-q, --query <format>", "query format in JMESPATH notation") // an optional flag, this will be in options.f
  .option("-f, --fields <format>", "array of field attributes")
  .option("-l, --limit <format>", "limit size of response")
  .option("-d, --debug <level>", "debug level")
  .option("--from <date>", "Date Time")
  .option("--to <date>", "Date Time")
  .action(list)

dcs.command("get")
  .argument("<cid>", "the cid")
  .option("-m, --meta ", "metadata for all stored DCPs") // an optional flag, this will be in options.f
  .option("-c, --class <format>", "prefered storage class") // an optional flag, this will be in options.f
  .option("-d, --debug <level>", "debug level")
  .action(get)

dcs.command("sql")
  .argument("<query...>", "the query")
  .option("-d, --debug <level>", "debug level")
  .action(sql)

dcs.command("unhandled-error").action(async () => {
  updateSpinnerText("Processing an unhandled failure ")
  await new Promise(resolve => setTimeout(resolve, 3000))
  throw new Error("Unhandled error")
})

module.exports.dcs = dcs
