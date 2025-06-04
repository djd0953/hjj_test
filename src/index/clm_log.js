'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class clm_log extends Model {
		static associate(models) {
			// define association here
		}
	}
	clm_log.init(
		{
			clm_id: DataTypes.INTEGER,
			team_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			
			type: DataTypes.INTEGER,
			content: DataTypes.STRING,
			clm_progress_status: DataTypes.INTEGER,
			team_category_id: DataTypes.INTEGER,
			team_subcategory_id: DataTypes.INTEGER,
			is_only_team_visible: DataTypes.INTEGER,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'clm_log',
		}
	)
	return clm_log
}