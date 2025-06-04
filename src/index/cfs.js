'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs.init(
        {
            user_id: DataTypes.INTEGER,
            type: DataTypes.ENUM('autodoc', 'lawdoc', 'esign', 'folder'),
            document_id: DataTypes.INTEGER,
            document_template_id: DataTypes.INTEGER,
            writing_id: DataTypes.INTEGER,
            esign_id: DataTypes.INTEGER,
            lawdoc_id: DataTypes.INTEGER,
            cfs_file_id: DataTypes.INTEGER,
            folder_name: DataTypes.STRING,
            used_password: DataTypes.INTEGER,
            password: DataTypes.STRING,
            access: DataTypes.STRING,
            last_edit_cfs_collaborator_id: DataTypes.INTEGER,
            service: DataTypes.INTEGER,
            private_html: DataTypes.TEXT,
            gld_thread_id: DataTypes.INTEGER,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            created_ymd: DataTypes.STRING,
            created_ym: DataTypes.STRING,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs',
        }
    )
    return cfs
}
