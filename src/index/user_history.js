'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_history extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_history.init(
		{
			user_id: DataTypes.INTEGER,
			activity_id: DataTypes.INTEGER,
			cfs_id: DataTypes.INTEGER,
			is_read: DataTypes.INTEGER,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_history',
		}
	)
	return user_history
}