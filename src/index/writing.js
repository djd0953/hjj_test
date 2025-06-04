const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('writing', {
    idwriting: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idusers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idpayments: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddocuments: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    document_template_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    writing_logo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },


    id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.STRING,
    },
    updated_at: {
      type: DataTypes.STRING,
    },
    is_del: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1, 
    },

    title: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    binddata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_gld: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: "0:비활성,1:활성"
    },
    gld_thread_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "gld thread id"
    },
    expiredate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    editabledate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    registerdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    modifieddate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    view: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Y"
    },
    file: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etc: {
      type: DataTypes.STRING(11),
      allowNull: true,
      comment: "어드민 : A,"
    },
    pcp_idx: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "pacakge_code_publish_idx 패키지이용번호"
    },
    sub_idx: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "deprecated.사용 금지. 2023-11-15"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "0:비활성,1:활성,2:임시활성"
    },
    modify_status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: "N",
      comment: "사용자 수정여부(N:자동작성, Y:사용자 수정모드)"
    },
    visible: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1,
      comment: "0:비활성,1:활성"
    },
    user_permission_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    editor_html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    margin_top: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    margin_bottom: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    margin_left: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    margin_right: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'writing',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idwriting" },
        ]
      },
      {
        name: "ix_idusers",
        using: "BTREE",
        fields: [
          { name: "idusers" },
        ]
      },
    ]
  });
};