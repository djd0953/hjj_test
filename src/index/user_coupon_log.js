'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_coupon_log extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_coupon_log.init(
		{
			user_id: DataTypes.INTEGER,
			coupon_id: DataTypes.INTEGER,
			coupon_code: DataTypes.STRING,
			user_permission_id: DataTypes.INTEGER,
			is_used: DataTypes.INTEGER,
			used_at: DataTypes.DATE,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_coupon_log',
		}
	)
	return user_coupon_log 
}