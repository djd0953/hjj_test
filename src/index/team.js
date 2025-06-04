'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class team extends Model {
        static associate(models) {
            // define association here
            team.hasMany(models.users, {
                foreignKey: 'team_id',
                as: 'members',
            })
        }
    }
    team.init(
        {
            name: DataTypes.STRING,
            user_permission_id: DataTypes.INTEGER,
            master_user_id: DataTypes.INTEGER,
            send_specified_date: DataTypes.BIGINT,
            logo_view: DataTypes.INTEGER,
            logo_height: DataTypes.INTEGER,
            logo_margin: DataTypes.INTEGER,
            logo_position: DataTypes.INTEGER,

            company_logo_1: DataTypes.STRING,
            company_logo_2: DataTypes.STRING,
            company_logo_3: DataTypes.STRING,
            company_logo_4: DataTypes.STRING,
            company_logo_5: DataTypes.STRING,
            company_logo_6: DataTypes.STRING,
            company_logo_7: DataTypes.STRING,
            company_logo_8: DataTypes.STRING,
            company_logo_9: DataTypes.STRING,
            company_logo_10: DataTypes.STRING,
            company_logo_position: DataTypes.INTEGER,
            company_logo_used: DataTypes.INTEGER,

            headnote_content: DataTypes.STRING,
            headnote_position: DataTypes.INTEGER,
            headnote_used: DataTypes.INTEGER,

            footnote_content: DataTypes.STRING,
            footnote_position: DataTypes.INTEGER,
            footnote_used: DataTypes.INTEGER,

            endnote_content: DataTypes.STRING,
            endnote_position: DataTypes.INTEGER,
            endnote_used: DataTypes.INTEGER,

            is_business_enabled: DataTypes.INTEGER,

            clm_navigation_json: DataTypes.STRING,
            clm_label_json: DataTypes.STRING,

            clm_document_counter: DataTypes.INTEGER,
            clm_daily_counter: DataTypes.INTEGER,
            clm_manage_code_format: DataTypes.STRING,
            clm_display_name_format: DataTypes.STRING,
            clm_seal_before_esign: DataTypes.INTEGER,

            legal_complete_person: DataTypes.INTEGER,
            legal_number_people: DataTypes.INTEGER,
            legal_process_method: DataTypes.INTEGER,

            financial_enabled: DataTypes.INTEGER,
            is_project_enabled: DataTypes.INTEGER,

            prompt_business_question: DataTypes.STRING,
            prompt_business_description: DataTypes.STRING,
            prompt_business_addon: DataTypes.STRING,

            clm_contract_field: DataTypes.INTEGER,
            clm_concluded_contract_field: DataTypes.INTEGER,

            updated_at: DataTypes.STRING,
            created_at: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'team',
        }
    )
    return team
}
