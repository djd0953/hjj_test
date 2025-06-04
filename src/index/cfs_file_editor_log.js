'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_file_editor_log extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_file_editor_log.init(
        {
            cfs_file_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            cfs_id: DataTypes.INTEGER,
            cfs_collaborator_id: DataTypes.INTEGER,
            content: DataTypes.TEXT,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_file_editor_log',
        }
    )
    return cfs_file_editor_log
}