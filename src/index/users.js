const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    idusers: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
	/* 나중에 회원 ID도 활용 할 예정  */
    id: DataTypes.INTEGER,
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_member_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_member_subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_is_master: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('P','C','A','S'),
      allowNull: false,
      defaultValue: "P",
      comment: "P:개인,C:기업,A:변호사,S:관리자"
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true,
      unique: "email_UNIQUE"
    },
    cid: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile_number: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    office_name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    office_number: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    office_zipcode: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    office_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    office_address_detail: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    education_level: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    school_level: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    school_grad_date: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    school_name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    school_status: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    attorney_exam: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    attorney_exam_number: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    work_field: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    self_introduction: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    signup_path: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    signup_path_extra: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    signup_recommend: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "추천인"
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "0 - 승인 \/ 1 - 대기 \/ 2 - 거절"
    },
    agree_service: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: "N"
    },
    agree_info: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: "N"
    },
    agree_msg: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: "N"
    },
    agree_push: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: "N"
    },
    profile_img: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    bank_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "계좌은행명"
    },
    bank_acc_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "계좌번호"
    },
    bank_acc_owner: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "예금주"
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
    new_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "1:변함없음 \/ 2:새 문서 완료"
    },
    tester: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      comment: "테스터일 경우 Y"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "0:지움\/1:활성"
    },
    program_group: {
      type: DataTypes.JSON,
      allowNull: true
    },
    seal_img: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: "개인 직인 이미지"
    },
    company: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "개인회원 회사명"
    },
    companyowner: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "개인회사 대표자명"
    },
    is_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_permission: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ims_permission: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_owner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_address1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_growth: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_growth_etc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_field: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_field_etc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_worker_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_owner_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_director: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    business_auditor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    business_stock_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_fortune: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_topics: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_capital: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    business_investment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    business_docs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bonus_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shareholder_matter:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '주총 사안 bitwise'
    },
    shareholder_procedure:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '주총 절차 1:전원 안건 동의 2:전원 소집통지절차 생략 동의 3:그 외'
    },
    signup_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autodoc_default_folder_cfs_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    esign_default_folder_cfs_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lawdoc_default_folder_cfs_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sso_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sso_source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sso_source_data: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_7free: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_employer: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    sign: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    daegu_log: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_del: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idusers" },
        ]
      },
      {
        name: "idusers_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idusers" },
        ]
      },
      {
        name: "email_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "email",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};