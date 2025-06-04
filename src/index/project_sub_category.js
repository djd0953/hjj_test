'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project_sub_category extends Model {
        static associate(models) {
            project_sub_category.hasMany(models.project_minor_category, {
                as: 'project_minor_categories',
                foreignKey: 'project_sub_category_id',
            })
        }
    }

    project_sub_category.init({
        team_id: DataTypes.INTEGER,
        project_category_id: DataTypes.INTEGER,
        name: DataTypes.STRING(256),
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project_sub_category',
    })

    return project_sub_category
}