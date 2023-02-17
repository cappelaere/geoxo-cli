const { createLogger, format, transports } = require('winston');
const { combine, splat, timestamp, printf } = format;

const timezoned = () => {
    return new Date().toTimeString();
    // return new Date().toLocaleString('en-US');
}

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message} `
    // if (metadata) {
    //     msg += JSON.stringify(metadata)
    // }
    return msg
});

const logStackAndOmitIt = format((info, opts) => {
    if (info.stack) {
        console.error(info.stack);
        return _.omit(info, 'stack');
    }
    return info;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        logStackAndOmitIt(),
        format.colorize(),
        splat(),
        timestamp({ format: timezoned }),
        myFormat
    ),
    // defaultMeta: { service: 'goexo-cli' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.Console()
    ],
});

module.exports.logger = logger
