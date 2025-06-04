'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class clm_check_list extends Model {
        static associate(models) {
            // define association here
        }
    }
    clm_check_list.init(
        {
            team_contract_standard_id: DataTypes.INTEGER.UNSIGNED,
            clm_id: DataTypes.INTEGER.UNSIGNED,
            user_id: DataTypes.INTEGER.UNSIGNED,
            team_id: DataTypes.INTEGER.UNSIGNED,
            content: DataTypes.TEXT,
            answer: DataTypes.TINYINT,
            ai_answer: DataTypes.TINYINT,
            ai_description: DataTypes.STRING(2048),
            ai_is_completed: DataTypes.TINYINT,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.TINYINT,
        },
        {
            sequelize,
            modelName: 'clm_check_list',
        }
    )
    return clm_check_list
}
