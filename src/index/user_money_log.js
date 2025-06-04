'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_money_log extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_money_log.init(
		{
			user_id: DataTypes.INTEGER,
			permission_id: DataTypes.INTEGER,
			purchase_id: DataTypes.INTEGER,
			item_id: DataTypes.INTEGER,
			cash: DataTypes.INTEGER,
			point: DataTypes.INTEGER,
			refund_msg: DataTypes.STRING,
			refund_at: DataTypes.DATE,
			refund_user_id: DataTypes.INTEGER,
			purchase_detail_json: DataTypes.STRING,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_money_log',
		}
	)
	return user_money_log 
}