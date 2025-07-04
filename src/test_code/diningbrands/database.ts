import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

const config = {
    username: String(process.env.DINING_DB_USER),
    password: String(process.env.DINING_DB_PASSWORD),
    database: String(process.env.DINING_DB_DATABASE),
    host: process.env.DINING_DB_HOST,
    port: 1433,
    dialect: 'mssql',
    dialectModule: require('tedious'),
    timezone: '+09:00',
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
    },
    define: {
        underscored: true,
        freezeTableName: true,
        charset: 'utf8mb4',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
    },
    pool: {
        max: 10, // default 5인데 동시에 주기적으로 열고 닫으며 간헐적으로 에러가 발생하여 늘려줌.
    },
    logging: (query: string, obj: any) => {
        if (process.env.LF_DEBUG_PRINT_SQL_QUERY === 'Y') {
            console.log(query)
        }

        if (process.env.LF_DEBUG_PRINT_SQL_OBJ === 'Y') {
            if (obj?.include) {
                console.log(obj)
            } else {
                console.log(JSON.stringify(obj))
            }
        }
    },
}

const sequelize: Sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    // @ts-ignore
    config
)

const db = { sequelize }

export default db