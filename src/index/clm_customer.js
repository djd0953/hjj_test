'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class clm_customer extends Model {
		static associate(models) {
			// define association here
		}
	}
	clm_customer.init(
		{
			clm_id: DataTypes.INTEGER,
			team_id: DataTypes.INTEGER,
			user_id: DataTypes.INTEGER,
			user_contact_id: DataTypes.INTEGER,
			
			business_name: DataTypes.STRING,
			business_number: DataTypes.STRING,
			business_email: DataTypes.STRING,
			business_phonenumber: DataTypes.STRING,

			updated_at: DataTypes.STRING,
			created_at: DataTypes.STRING,
			is_del: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'clm_customer',
		}
	)
	return clm_customer
}