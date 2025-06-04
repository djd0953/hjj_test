'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class clm_payment extends Model {
        static associate(models) {
            // define association here
        }
    }
    clm_payment.init(
        {
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            clm_id: DataTypes.INTEGER,
            sort_id: DataTypes.INTEGER,
            payment_date: DataTypes.DATE,
            payment_amount: DataTypes.INTEGER,
            is_schedule_undecided: DataTypes.INTEGER,
            payment_detail: DataTypes.STRING(2048),
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm_payment',
        }
    )
    return clm_payment
}
