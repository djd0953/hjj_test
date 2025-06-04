'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_magazine_click_log extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_magazine_click_log.init(
		{
			magazine_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			guest_id: DataTypes.STRING,
			type: DataTypes.INTEGER,
			target: DataTypes.STRING,
			is_mobile: DataTypes.INTEGER,
			browser_name: DataTypes.STRING,
			user_agent: DataTypes.STRING,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_magazine_click_log',
		}
	)
	return user_magazine_click_log 
}