module.exports = {
    username: "hjj0106",
    password: "Ui2mVh(a1gQnkLlp",
    database: "lawform",
    host: "dev-lawform.cpw48majncyb.ap-northeast-2.rds.amazonaws.com",
    port: 3306,
    dialect: "mysql",
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
    logging: function (query, obj) {
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