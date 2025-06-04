'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class clm_log_attachment extends Model {
		static associate(models) {
			// define association here
		}
	}
	clm_log_attachment.init(
		{
			clm_id: DataTypes.INTEGER,
			clm_log_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			team_id: DataTypes.INTEGER,
			
			filename: DataTypes.STRING,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'clm_log_attachment',
		}
	)
	return clm_log_attachment
}