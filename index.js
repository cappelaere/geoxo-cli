#!/usr/bin/env node

const { Command } = require('commander')
const { dcs } = require('./commands/dcs')
const { login } = require('./commands/login')
const { grb } = require('./commands/grb')
const { lzss } = require('./commands/lzss')
const { topic } = require('./commands/topic')
const { logger } = require('./logger.js')
const repl = require('node:repl');

const VERSION = '0.1.0'


const program = new Command()
program.description('GeoXO CLI')
program.version('0.0.1')
program.option('-v, --verbose', 'verbose logging')

program.addCommand(dcs)
program.addCommand(grb)
program.addCommand(lzss)
program.addCommand(login)
program.addCommand(topic)

const myEval = (cmd, context, filename, callback) => {
    // console.log(cmd)
    const arr1 = ['node', 'index.js']
    const arr2 = cmd.replace(/[\n]/g, '').split(' ')
    arr2.forEach((item) => {
        arr1.push(item)
    })
    // console.log(arr1)
    // await program.parseAsync()
    callback(null, program.parse(arr1))
}

async function main() {
    logger.info(`Starting GeoXO CLI v${VERSION}`)
    // await kafka.InitProducer()
    if (process.argv.length > 2) {
        await program.parseAsync()
        logger.info('Done.')
    } else {
        const r = repl.start({ prompt: 'geoxo> ', eval: myEval });

    }
}

process.on('unhandledRejection', function (err) { // listen for unhandled promise rejections
    const debug = program.opts().verbose; // is the --verbose flag set?
    if (debug) {
        console.error(err.stack); // print the stack trace if we're in verbose mode
    }
    program.error('', { exitCode: 1 }) // exit with error code 1
})

main();