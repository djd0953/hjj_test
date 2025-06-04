const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		'user_favorite',
		{
			id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			document_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			is_del: {
				type: DataTypes.TINYINT,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: 'user_favorite',
			timestamps: true,
			indexes: [
				{
					name: 'PRIMARY',
					unique: true,
					using: 'BTREE',
					fields: [{ name: 'id' }],
				},
			],
		}
	)
}