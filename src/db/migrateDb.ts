'use strict';

import { Sequelize, Options, QueryTypes } from "sequelize";

const dbInfo = {
    username: process.env.M_DB_USER || '',
    password: process.env.M_DB_PASS || '', 
    database: process.env.M_DB_NAME || ''
};
console.log(dbInfo, process.env.M_DB_HOST);
const config: Options = {
    host: process.env.M_DB_HOST,
    username: process.env.M_DB_USER,
    password: process.env.M_DB_PASS,
    database: process.env.M_DB_NAME,
    port: 3306,
    dialect: 'mysql',
    timezone: '+09:00',
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
        ssl: {
            require: true,
            rejectUnauthorized: true // PlanetScale은 검증된 인증서를 사용하므로 true로 설정
        }
    },
    define: {
        underscored: true,
        freezeTableName: true,
        charset: 'utf8mb4',
        timestamps: true,
        createdAt: false,
        updatedAt: false
    },
    pool: {
        max: 50,
        min: 0,
        acquire: 50000,
        idle: 10000
    },
    benchmark: false // 쿼리 실행 시간을 측정
};

const sequelize = new Sequelize(dbInfo.database, dbInfo.username, dbInfo.password, config);

export default sequelize;