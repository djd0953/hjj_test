'use strict'
const { Model } = require('sequelize')


/**
 * @typedef {Object} ClmNotification
 * @prop {number} id
 * @prop {number} user_id
 * @prop {number | null} clm_id
 * @prop {number | null} cfs_id
 * @prop {number | null} team_id
 * @prop {string} title
 * @prop {string} message
 * @prop {string | null} appendix_text
 * @prop {string | null} url
 * @prop {Date} scheduled_at
 * @prop {Date | null} sent_at
 * @prop {Date | null} read_at
 * @prop {Date} created_at
 * @prop {Date} updated_at
 * @prop {number} is_del
 */
/** @typedef {Model<ClmNotificationModel>} ClmNotificationModel */

/**
 * 
 * @param {*} sequelize 
 * @param {*} DataTypes 
 * @returns 
 */
module.exports = (sequelize, DataTypes) => {
    class clm_notification extends Model {
        static associate(models) {
            
        }
    }
    clm_notification.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            clm_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            cfs_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            team_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            title: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            message: {
                type: DataTypes.STRING(512),
                allowNull: false
            },
            appendix_text: {
                type: DataTypes.STRING(512),
                allowNull: true,
                defaultValue: null,
            },
            url: {
                type: DataTypes.STRING(1024),
                allowNull: true,
                defaultValue: null,
            },
            scheduled_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            sent_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            read_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'clm_notification',
        }
    )

    return clm_notification
}
