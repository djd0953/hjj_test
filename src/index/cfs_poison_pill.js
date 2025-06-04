'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class cfs_poison_pill extends Model {
		static associate(models) {
			// define association here
		}
	}
    cfs_poison_pill.init(
        {
            cfs_id: DataTypes.INTEGER.UNSIGNED,
            document_poison_pill_id: DataTypes.INTEGER.UNSIGNED,
            favorable_party: DataTypes.STRING,
            is_poisonous: DataTypes.TINYINT.UNSIGNED,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.TINYINT.UNSIGNED,
        },
		{
			sequelize,
			modelName: 'cfs_poison_pill',
		}
	)
	return cfs_poison_pill
}