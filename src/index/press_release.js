const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'press_release',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            channel: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            thumbnail: {
                type: DataTypes.STRING(256),
                allowNull: true,
            },
            link: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            publish_date: {
                type: DataTypes.STRING(32),
                allowNull: false,
            },
            edit_user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_del: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        },
        {
            sequelize,
            tableName: 'press_release',
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
