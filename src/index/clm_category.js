'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class clm_category extends Model {
        static associate(models) {
            // define association here
            clm_category.hasMany(models.clm_subcategory, {
                as: 'clm_subcategory',
                foreignKey: 'clm_category_id',
            })
        }
    }
    clm_category.init(
        {
            sort_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            clm_id: DataTypes.INTEGER,

            name: DataTypes.STRING,

            created_at: DataTypes.STRING,
            updated_at: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm_category',
        }
    )
    return clm_category
}
