import { addColors, format, transports, createLogger, Logger } from 'winston';
import 'winston-daily-rotate-file';

const LOGGER_LEVELS = {
    // 숫자가 낮을 수록 우선순위가 높습니다.
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
    silly: 5,
    custom: 6
} as const;
type LogLevel = keyof typeof LOGGER_LEVELS;

const LOGGER_COLORS = {
    // 각각의 레벨에 대한 색상을 지정해줍니다.
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'cyan',
    silly: 'grey',
    custom: 'yellow'
} as const;
// type LogColors = keyof typeof LOGGER_COLORS;

type BaseFileTranport =
{
    level: LogLevel;
    filename: string;
    zippedArchive: boolean;
    maxFiles: string;
    options?: { utc?: boolean }
}
const LOGGER_TRANSPORTS: BaseFileTranport[] = 
[
    {
        level: 'info',
        filename: 'logs/system.log',
        zippedArchive: true,
        maxFiles: '3d',
        options: { utc: false }
    },
    {
        level: 'error',
        filename: 'logs/error.log',
        zippedArchive: true,
        maxFiles: '3d',
        options: { utc: false }
    },
    {
        level: 'warn',
        filename: 'logs/warning.log',
        zippedArchive: true,
        maxFiles: '3d',
        options: { utc: false }
    },
    {
        level: 'verbose',
        filename: 'logs/verbose.log',
        zippedArchive: true,
        maxFiles: '3d',
        options: { utc: false }
    }
];

class LogObject 
{
    private readonly _logger: Logger;
    private logFormat = format.printf(({ level, message, timestamp, stack }) =>
    {
        let m = `${timestamp} (${level})] ${message}`;
        if (level === "error" || level === "verbose") m += `\n${stack}`;

        return m;
    });

    constructor()
    {
        addColors(LOGGER_COLORS);

        this._logger = createLogger({
            levels: LOGGER_LEVELS,
            level: 'custom',
            transports: 
            [
                ...LOGGER_TRANSPORTS.map((transport) => 
                
                    new transports.DailyRotateFile({
                        ...transport,
                        format: format.combine(
                            format.colorize({ all: true }),
                            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                            format.errors({ stack: true }),
                            format.splat(),
                            this.logFormat
                            
                        )
                    })
                ),

                ...LOGGER_TRANSPORTS.map((transport) => 
                
                    new transports.Console({
                        level: transport.level,
                        format: format.combine(
                            format.colorize({ all: true }),
                            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                            format.errors({ stack: true }),
                            format.splat(),
                            this.logFormat
                            
                        )
                    })
                )
            ],
            exceptionHandlers:
            [
                new transports.DailyRotateFile(
                    {
                        filename: "logs/exceptions.log",
                        zippedArchive: true,
                        maxFiles: '3d',
                        format: format.combine(
                            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                            format.errors({ stack: true }),
                            format.splat(),
                            this.logFormat
                        )
                    }
                )
            ]
        });
    }

    info(message: any, ...meta: any[]) { this._logger.info(message, ...meta); }
    error(message: any, ...meta: any[]) { this._logger.error(message, ...meta); }
    warn(message: any, ...meta: any[]) { this._logger.warn(message, ...meta); }
    verbose(message: any, ...meta: any[]) { this._logger.verbose(message, ...meta); }
}

const logger = new LogObject();
export default logger;