'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class user_contact extends Model {
        static associate(models) {
            // define association here
        }
    }
    user_contact.init(
        {
            user_id: DataTypes.INTEGER,
            category_id: DataTypes.INTEGER,
            name: DataTypes.TEXT,
            business_name: DataTypes.TEXT,
            business_owner: DataTypes.TEXT,
            email: DataTypes.TEXT,
            unique_number: DataTypes.TEXT,
            address: DataTypes.TEXT,
            address_detail: DataTypes.TEXT,
            phone: DataTypes.TEXT,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'user_contact',
        }
    )
    return user_contact
}
