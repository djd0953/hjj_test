'use strict'
const { Model, DataTypes } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_gld_case extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_gld_case.init(
        {
            cfs_id: DataTypes.INTEGER.UNSIGNED,
            case_comment: DataTypes.TEXT,
            private_case_comment: DataTypes.TEXT,
            gld_setting_id: DataTypes.INTEGER.UNSIGNED,
            bind_data: DataTypes.JSON,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.TINYINT.UNSIGNED,
        },
        {
            sequelize,
            modelName: 'cfs_gld_case',
        }
    )
    return cfs_gld_case
}