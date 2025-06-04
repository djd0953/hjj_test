'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_event extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_event.init(
		{
            user_id:DataTypes.INTEGER,
            user_permission_id:DataTypes.INTEGER,
            category:DataTypes.INTEGER,
            current_step:DataTypes.INTEGER,
            final_step:DataTypes.INTEGER,
            step_json:DataTypes.JSON,
            is_completed:DataTypes.INTEGER,
            start_date:DataTypes.DATE,
            end_date:DataTypes.DATE,
            created_at:DataTypes.DATE,
            updated_at:DataTypes.DATE,
            is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_event',
		}
	)
	return user_event
}