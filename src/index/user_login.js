'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_login extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_login.init(
		{
			user_id: DataTypes.INTEGER,
			is_mobile: DataTypes.INTEGER,
			browser_name: DataTypes.STRING,
			user_agent: DataTypes.STRING,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_login',
		}
	)
	return user_login 
}