'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class watermark extends Model {
        static associate(models) {
            // define association here
        }
    }
    watermark.init(
        {
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            image_data: DataTypes.STRING,
            is_used: DataTypes.INTEGER,
            pattern: DataTypes.INTEGER,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'watermark',
        }
    )
    return watermark
}
