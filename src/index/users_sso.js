const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_sso', {
    idusers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "로폼 회원번호",
	  primaryKey: true,
      references: {
        model: 'users',
        key: 'idusers'
      }
    },
    sso_idx: {
      type: DataTypes.STRING(256),
      allowNull: false,
      comment: "출처 회원번호"
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "출처"
    },
    source_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "출처 데이터"
    }
  }, {
    sequelize,
    tableName: 'users_sso',
    timestamps: false,
    indexes: [
      {
        name: "users_sso_sso_idx_uindex",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sso_idx" },
        ]
      },
      {
        name: "users_sso_users_idusers_fk",
        using: "BTREE",
        fields: [
          { name: "idusers" },
        ]
      },
    ]
  });
};