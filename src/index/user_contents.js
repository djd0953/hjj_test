const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_contents', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dev_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    legalroad_documents: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    legalroad_startup: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    legalroad_magazines: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    legalroad_themes: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    dashboard_documents: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    yuma_documents: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    app_documents: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    is_del: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'user_contents',
    timestamps: false,
    indexes: [
      {
        name: "dev_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "dev_id" },
        ]
      },
    ]
  });
};