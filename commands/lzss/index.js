const { Command } = require("commander")
const { get } = require('./get.js')
const { list } = require('./list.js')

const lzss = new Command("lzss")

lzss.command("list").action(list)

lzss.command("get")
    .argument("<cid>", "the cid")
    .action(get)

lzss.command("unhandled-error").action(async () => {
    updateSpinnerText("Processing an unhandled failure ")
    await new Promise(resolve => setTimeout(resolve, 3000))
    throw new Error("Unhandled error")
})

module.exports.lzss = lzss