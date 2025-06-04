'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class clm_subcategory extends Model {
        static associate(models) {
            // define association here
            clm_subcategory.hasMany(models.clm_minorcategory, {
                as: 'clm_minorcategory',
                foreignKey: 'clm_subcategory_id',
            })
        }
    }
    clm_subcategory.init(
        {
            sort_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            clm_category_id: DataTypes.INTEGER,
            clm_id: DataTypes.INTEGER,

            name: DataTypes.STRING,

            created_at: DataTypes.STRING,
            updated_at: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm_subcategory',
        }
    )
    return clm_subcategory
}
