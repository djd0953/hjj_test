'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class user_signup_path extends Model {
        static associate(models) {
            // define association here
        }
    }
    user_signup_path.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            dev_id: DataTypes.INTEGER,
            title: DataTypes.INTEGER,
            sort_id: DataTypes.INTEGER,
            is_visible : DataTypes.INTEGER,
            coupon_code1: DataTypes.STRING,
            coupon_code2: DataTypes.STRING,
            coupon_code3: DataTypes.STRING,
            coupon_code4: DataTypes.STRING,
            coupon_code5: DataTypes.STRING,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.TINYINT,
        },
        {
            sequelize,
            modelName: 'user_signup_path',
        }
    )
    return user_signup_path
}