'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class clm_attachment extends Model {
		static associate(models) {
			// define association here
		}
	}
	clm_attachment.init(
		{
			clm_id: DataTypes.INTEGER,
			team_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			
			type: DataTypes.INTEGER,
			filename: DataTypes.INTEGER,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'clm_attachment',
		}
	)
	return clm_attachment
}