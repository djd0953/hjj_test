const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('documents', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    idcategory_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'category_1',
        key: 'idcategory_1'
      }
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    subtitle: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    h2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desc1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desc2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    dc_price: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dc_rate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extra_dc_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    description: {
      type: DataTypes.JSON,
      allowNull: true
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
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    signer_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    minimum_input_field: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    service: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '적용되는 서비스 bitwise 0:main 1:lawform_app 2:imshop 4:대구은행 8:대구기업은행 16:로엘'
    },
    status: {
      type: DataTypes.ENUM('Y','N','P'),
      allowNull: true,
      defaultValue: "Y",
      comment: "노출 상태 Y:노출, N:비노출, P:준비중"
    },
    category_sub: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "[1, 2, 3, 4, 5, 6]"
    },
    contract: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: "N",
      comment: "계약문서 여부(Y,N)"
    },
    ai_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ai_is_used: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ai_output_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    template_json: {
      type: DataTypes.JSON,
      allowNull: true
    },
    template_category: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dev_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: ''
    },
  }, {
    sequelize,
    tableName: 'documents',
    timestamps: false,
    indexes: [
      {
        /* ToDo: iddocuments 삭제 및 id를 primary key로 */
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FK_documents_category_1",
        using: "BTREE",
        fields: [
          { name: "idcategory_1" },
        ]
      },
    ]
  });
};