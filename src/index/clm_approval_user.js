'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class clm_approval_user extends Model {
		static associate(models) {
			// define association here
			clm_approval_user.belongsTo(models.users, {
				as: 'user',
				foreignKey: 'user_id',
			})
		}
	}
	clm_approval_user.init(
		{
			clm_id: DataTypes.INTEGER,
			team_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			
			type: DataTypes.INTEGER,
			sort_id: DataTypes.INTEGER,
			is_approved: DataTypes.INTEGER,
			approved_at: DataTypes.STRING,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'clm_approval_user',
		}
	)
	return clm_approval_user
}