'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project_log extends Model {
        static associate(models) {
            project_log.belongsTo(models.users, {
                as: 'user',
                foreignKey: 'user_id',
            })
        }
    }
    project_log.init({
        project_id: DataTypes.INTEGER,
        team_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        type: DataTypes.INTEGER,
        content: DataTypes.STRING(1024),
        team_category_id: DataTypes.INTEGER,
        is_only_team_visible: DataTypes.INTEGER,
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project_log',
    })

    return project_log
}