const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_qna', {
    idx: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idusers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    service: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    answertype: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: "답변유형"
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    questiontype: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: "질문분류"
    },
    registerdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "질문 최초 등록 시간"
    },
    answerdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "답변 최종 수정,저장 시간"
    },
    modifieddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "질문 최종 수정 시간"
    },
    status: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      defaultValue: "N",
      comment: "상태 ( 답변 전:'N', 답변 후:'Y', 전화답변:'C', 질문 삭제 :'D' )"
    },
    sms_status:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "답변 SMS 전송여부 ( 1 미전송 2 전송 )"
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "비고"
    },
    process: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "처리유형"
    },
    answerer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "답변자"
    },
    program_group: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "프로그램 그룹"
    },
    public: {
      type: DataTypes.ENUM('Y','N'),
      allowNull: true,
      comment: "공개유무"
    },
    files: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "첨부파일"
    },
    answerfiles: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "답변첨부파일"
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
	},
    updated_at: {
      type: DataTypes.STRING,
      allowNull: true,
	},
    is_del: {
      type: DataTypes.INTEGER,
      allowNull: true,
	},
  }, {
    sequelize,
    tableName: 'users_qna',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idx" },
        ]
      },
    ]
  });
};