'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class user_permission extends Model {
		static associate(models) {
			// define association here	
			this.hasOne(models.writing, {
				as: "document_autodoc",
				foreignKey: "user_permission_id",
				sourceKey: 'id',
				required: false,
			});
			this.hasOne(models.esign, {
				as: "document_esign",
				foreignKey: "user_permission_id",
				sourceKey: 'id',
				required: false,
			});
		}
	}
	user_permission.init(
		{
			user_id: DataTypes.INTEGER,
			permission_id: DataTypes.INTEGER,
			purchase_id: DataTypes.INTEGER,
			autodoc: DataTypes.BIGINT,
			esign: DataTypes.BIGINT,
			lawdoc: DataTypes.BIGINT,
			cloud: DataTypes.BIGINT,
			cloud_action: DataTypes.INTEGER,
			cloud_action_original: DataTypes.INTEGER,
			cloud_esign: DataTypes.INTEGER,
			cloud_esign_original: DataTypes.INTEGER,
			cloud_esign_max_signer: DataTypes.INTEGER,
			cloud_esign_signer_max: DataTypes.INTEGER,
			cloud_document: DataTypes.INTEGER,
			cloud_document_original: DataTypes.INTEGER,
			cloud_document_id: DataTypes.INTEGER,
			cloud_contact: DataTypes.INTEGER,
			cloud_contact_original: DataTypes.INTEGER,
			cloud_share: DataTypes.INTEGER,
			cloud_share_limit: DataTypes.INTEGER,
			cloud_share_limit_original: DataTypes.INTEGER,
			cloud_comment: DataTypes.INTEGER,
			cloud_comment_limit: DataTypes.INTEGER,
			cloud_comment_limit_original: DataTypes.INTEGER,
			cloud_content: DataTypes.INTEGER,
			cloud_space: DataTypes.BIGINT,
			cloud_team: DataTypes.INTEGER,
			cloud_team_paid: DataTypes.INTEGER,
			cloud_team_free: DataTypes.INTEGER,
			cloud_my: DataTypes.INTEGER,
			start_date: DataTypes.DATE,
			end_date: DataTypes.DATE,
			residual_date: DataTypes.INTEGER,
			residual_date_original: DataTypes.INTEGER,
			price: DataTypes.INTEGER,
			is_monthly_plan: DataTypes.INTEGER,
			duration_free: DataTypes.INTEGER,
			duration_free_original: DataTypes.INTEGER,
			first_payment_date: DataTypes.DATE,
			monthly_progress_status: DataTypes.DATE,
			updated_at: DataTypes.DATE,
			created_at: DataTypes.DATE,
			is_del: DataTypes.TINYINT,
		},
		{
			sequelize,
			modelName: 'user_permission',
		}
	)
	return user_permission
}