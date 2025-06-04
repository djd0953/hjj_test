'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_file extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_file.init(
        {
            cfs_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            clm_id: DataTypes.INTEGER,
            team_standard_contract_id: DataTypes.INTEGER,
            filename: DataTypes.STRING,
            extension: DataTypes.STRING,
            cfs_file_html: DataTypes.TEXT,
            cfs_file_html_head: DataTypes.TEXT,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_file',
        }
    )
    return cfs_file
}
