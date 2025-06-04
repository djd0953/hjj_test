'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_request extends Model {
        static associate(models) {
            // define association here
        }
    }

    cfs_request.init(
        {
            cfs_id: DataTypes.INTEGER.UNSIGNED,
            user_id: DataTypes.INTEGER.UNSIGNED,
            service: DataTypes.INTEGER.UNSIGNED,
            request_status: DataTypes.INTEGER.UNSIGNED,
            request_message: DataTypes.STRING,
            cfs_collaborator_id: DataTypes.INTEGER.UNSIGNED,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_request',
        }
    )
    return cfs_request
}