const { Command } = require("commander")
const { Auth } = require('../../auth.js')

const login = new Command("login")

login
  .option("-p, --profile <format>", "profile name to use for login")
  .option("-d, --debug <level>", "debug level")
  .option("-l, --list", "list available profiles")
  .action(Auth)

module.exports.login = login