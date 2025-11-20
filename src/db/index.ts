'use strict';

import { Sequelize, Options } from "sequelize";

const dbInfo = {
    username: process.env.DB_USER || '',
    password: process.env.DB_PASS || '', 
    database: process.env.DB_NAME || ''
};
const config: Options = {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    dialect: 'mysql',
    timezone: '+09:00',
    dialectOptions: {
        dateStrings: true,
        typeCast: true
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
    }
};

const sequelize = new Sequelize(dbInfo.database, dbInfo.username, dbInfo.password, config);

export default sequelize;