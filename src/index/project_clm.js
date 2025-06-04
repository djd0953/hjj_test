'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class project_clm extends Model {
        static associate(models) {
            project_clm.belongsTo(models.project, {
                as: 'junction_project',
                foreignKey: 'project_id',
            })
            project_clm.belongsTo(models.clm, {
                as: 'junction_clm',
                foreignKey: 'clm_id',
            })
        }
    }
    project_clm.init({
        clm_id: DataTypes.INTEGER,
        team_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        project_id: DataTypes.INTEGER,
        updated_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
        is_del: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'project_clm',
    })

    return project_clm
}