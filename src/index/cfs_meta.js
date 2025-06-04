'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_meta extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_meta.init(
        {
            service: DataTypes.INTEGER,
            document_id: DataTypes.INTEGER,
            cfs_id: DataTypes.INTEGER,
            writing_id: DataTypes.INTEGER,
            bind_key: DataTypes.STRING,
            name: DataTypes.STRING,
            company_name: DataTypes.STRING,
            email: DataTypes.STRING,
            mobile_number: DataTypes.STRING,
            address_1: DataTypes.STRING,
            address_2: DataTypes.STRING,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_meta',
        }
    )
    return cfs_meta
}