'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_push_token extends Model {
		static associate(models) {
			// define association here
		}
	}
	user_push_token.init(
		{
      id : {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      user_id : DataTypes.INTEGER,
      service : DataTypes.INTEGER,
      token : DataTypes.STRING,
      device: DataTypes.INTEGER,
			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'user_push_token',
		}
	)
	return user_push_token 
}