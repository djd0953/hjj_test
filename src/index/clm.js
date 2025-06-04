'use strict'
const { Model } = require('sequelize')

const users = require('./users')
const cfs = require('./cfs')

module.exports = (sequelize, DataTypes) => {
    class clm extends Model {
        static associate(models) {
            // define association here
            clm.belongsTo(models.clm, {
                as: 'related_clm',
                foreignKey: 'related_clm_id',
            })
            clm.belongsTo(models.clm, {
                as: 'seal_related_clm',
                foreignKey: 'seal_related_clm_id',
            })
            clm.belongsTo(models.clm, {
                as: 'parent_clm',
                foreignKey: 'parent_clm_id',
            })
            clm.hasMany(models.clm, {
                as: 'children_clm',
                sourceKey: 'id',
                foreignKey: 'parent_clm_id',
            })
            clm.belongsTo(models.team, {
                as: 'team',
                foreignKey: 'team_id',
            })
            clm.hasMany(models.clm_approval_user, {
                as: 'followers',
                foreignKey: 'clm_id',
            })
            clm.hasMany(models.project_clm, {
                as: 'project_clms',
                foreignKey: 'clm_id',
            })
        }
    }
    clm.init(
        {
            team_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            legal_user_id: DataTypes.INTEGER,
            legal_user_approved_at: DataTypes.STRING,
            legal_user_2_id: DataTypes.INTEGER,
            legal_user_2_approved_at: DataTypes.STRING,
            legal_user_3_id: DataTypes.INTEGER,
            legal_user_3_approved_at: DataTypes.STRING,
            legal_process_method: DataTypes.INTEGER,

            financial_enabled: DataTypes.INTEGER,
            financial_user_id: DataTypes.INTEGER,
            financial_requested_at: DataTypes.STRING,
            financial_completed_at: DataTypes.STRING,
            financial_last_denied_at: DataTypes.STRING,
            financial_last_denied_reason: DataTypes.STRING,

            cfs_autodoc_id: DataTypes.INTEGER,
            cfs_esign_id: DataTypes.INTEGER,
            cfs_file_id: DataTypes.INTEGER,

            parent_clm_id: DataTypes.INTEGER,
            related_clm_id: DataTypes.INTEGER,
            seal_related_clm_id: DataTypes.INTEGER,

            manage_code: DataTypes.STRING,

            progress_status: DataTypes.INTEGER,
            name: DataTypes.STRING,
            display_name: DataTypes.STRING,
            type: DataTypes.INTEGER,
            clm_category_id: DataTypes.INTEGER,
            clm_subcategory_id: DataTypes.INTEGER,
            clm_minorcategory_id: DataTypes.INTEGER,

            contract_field: DataTypes.INTEGER,
            concluded_contract_field: DataTypes.INTEGER,
            contract_date: DataTypes.STRING,
            contract_start_date: DataTypes.STRING,
            contract_end_date: DataTypes.STRING,
            contract_review_deadline: DataTypes.STRING,
            security_level: DataTypes.INTEGER,

            contract_value: DataTypes.STRING,
            contract_currency: DataTypes.INTEGER,
            tax_type: DataTypes.INTEGER,

            memo_purpose: DataTypes.STRING,
            memo_topic: DataTypes.STRING,
            last_request_contract_at: DataTypes.STRING,
            is_legal_review: DataTypes.INTEGER,
            last_legal_review_at: DataTypes.STRING,

            cancel_at: DataTypes.STRING,
            cancel_reason: DataTypes.STRING,

            use_auto_extend: DataTypes.INTEGER,
            auto_alert_day: DataTypes.INTEGER,
            auto_extend_num: DataTypes.INTEGER,
            auto_extend_unit: DataTypes.INTEGER,
            auto_extend_content: DataTypes.STRING,
            auto_extend_updated_at: DataTypes.STRING,

            esign_customer_use: DataTypes.INTEGER,
            esign_customer_filename: DataTypes.STRING,
            esign_customer_file_location: DataTypes.STRING,

            is_separately: DataTypes.INTEGER,
            is_project_enabled: DataTypes.INTEGER,

            is_seal_certificate: DataTypes.INTEGER,
            seal_request_at: DataTypes.STRING,
            is_seal_take_out: DataTypes.INTEGER,
            seal_take_out_export_at: DataTypes.STRING,
            seal_take_out_at: DataTypes.STRING,

            seal_description: DataTypes.STRING,
            seal_method: DataTypes.INTEGER,
            seal_type: DataTypes.INTEGER,
            seal_business_deunggi: DataTypes.INTEGER,
            seal_legal_document: DataTypes.INTEGER,
            seal_type_extra_device: DataTypes.INTEGER,
            seal_count: DataTypes.INTEGER,
            seal_purpose: DataTypes.STRING,
            seal_before_esign: DataTypes.INTEGER,

            seal_use_approved_at: DataTypes.STRING,
            seal_use_result: DataTypes.INTEGER,

            is_paused: DataTypes.INTEGER,
            paused_user_id: DataTypes.INTEGER,
            pause_content: DataTypes.STRING,
            paused_at: DataTypes.STRING,

            updated_at: DataTypes.STRING,
            created_at: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm',
        }
    )

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'user_id',
        foreignKey: 'id',
        as: 'user',
    })

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'legal_user_id',
        foreignKey: 'id',
        as: 'legal_user',
    })

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'legal_user_2_id',
        foreignKey: 'id',
        as: 'legal_user_2',
    })

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'legal_user_3_id',
        foreignKey: 'id',
        as: 'legal_user_3',
    })

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'paused_user_id',
        foreignKey: 'id',
        as: 'paused_user',
    })

    clm.hasOne(users(sequelize, DataTypes), {
        sourceKey: 'financial_user_id',
        foreignKey: 'id',
        as: 'financial_user',
    })

    clm.hasOne(cfs(sequelize, DataTypes), {
        sourceKey: 'cfs_autodoc_id',
        foreignKey: 'id',
        as: 'cfs_autodoc',
    })

    clm.hasOne(cfs(sequelize, DataTypes), {
        sourceKey: 'cfs_file_id',
        foreignKey: 'id',
        as: 'cfs_file',
    })

    return clm
}
