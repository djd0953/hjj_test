'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class clm_minorcategory extends Model {
        static associate(models) {
            // define association here
        }
    }
    clm_minorcategory.init(
        {
            sort_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            clm_subcategory_id: DataTypes.INTEGER,
            clm_id: DataTypes.INTEGER,

            name: DataTypes.STRING,

            created_at: DataTypes.STRING,
            updated_at: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm_minorcategory',
        }
    )
    return clm_minorcategory
}
