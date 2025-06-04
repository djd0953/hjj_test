'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project_category extends Model {
        static associate(models) {
            project_category.hasMany(models.project_sub_category, {
                as: 'project_sub_categories',
                foreignKey: 'project_category_id',
            })
        }
    }

    project_category.init({
        team_id: DataTypes.INTEGER,
        name: DataTypes.STRING(256),
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project_category',
    })

    return project_category
}