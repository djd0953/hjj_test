'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_collaborator extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_collaborator.init(
        {
            cfs_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            folder_id: DataTypes.INTEGER,
            guest_id: DataTypes.STRING,
            is_guest: DataTypes.INTEGER,
            access: DataTypes.ENUM('READ', 'WRITE'),
            is_owner: DataTypes.INTEGER,
            hidden_flag: DataTypes.INTEGER,
            invite_email: DataTypes.STRING,
            inviter_cfs_collaborator_id: DataTypes.INTEGER,
            inviter_user_id: DataTypes.INTEGER,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_collaborator',
        }
    )
    return cfs_collaborator
}