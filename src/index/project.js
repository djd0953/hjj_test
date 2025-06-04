'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project extends Model {
        static associate(models) {
            project.hasMany(models.project_clm, {
                as: 'associated_clms',
                foreignKey: 'project_id',
            })
            project.belongsTo(models.team, {
                as: 'team',
                foreignKey: 'team_id',
            })
            project.belongsTo(models.users, {
                as: 'user',
                foreignKey: 'user_id',
            })
            project.belongsTo(models.project_category, {
                as: 'project_category',
                foreignKey: 'project_category_id',
                defaultValue: null,
            })
            project.belongsTo(models.project_sub_category, {
                as: 'project_sub_category',
                foreignKey: 'project_sub_category_id',
                defaultValue: null,
            })
            project.belongsTo(models.project_minor_category, {
                as: 'project_minor_category',
                foreignKey: 'project_minor_category_id',
                defaultValue: null,
            })
            project.hasMany(models.project_log, {
                as: 'logs',
                foreignKey: 'project_id',
            })
            project.hasMany(models.project_follower, {
                as: 'followers',
                foreignKey: 'project_id',
            })
        }
    }
    project.init({
        name: DataTypes.STRING(1024),
        team_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        project_category_id: DataTypes.INTEGER,
        project_sub_category_id: DataTypes.INTEGER,
        project_minor_category_id: DataTypes.INTEGER,
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project',
    })

    return project
}