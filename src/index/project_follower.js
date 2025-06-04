'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project_follower extends Model {
        static associate(models) {
            project_follower.belongsTo(models.users, {
                as: 'user',
                foreignKey: 'user_id',
            })
        }
    }
    project_follower.init({
        project_id: DataTypes.INTEGER,
        team_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        sort_id: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project_follower',
    })

    return project_follower
}