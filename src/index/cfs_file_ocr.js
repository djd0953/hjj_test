'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class cfs_file_ocr extends Model {
        static associate(models) {
            // define association here
        }
    }
    cfs_file_ocr.init(
        {
            user_id: DataTypes.INTEGER,
            cfs_id: DataTypes.INTEGER,
            cfs_file_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            server_id: DataTypes.STRING,
            filename: DataTypes.STRING,
            ocr_status: DataTypes.STRING,
            ocr_result_raw: DataTypes.JSON,
            ocr_result_html: DataTypes.TEXT,
            ocr_result_text: DataTypes.TEXT,
            ocr_result_postprocess: DataTypes.JSON,
            ocr_error_messages: DataTypes.JSON,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
            is_del: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'cfs_file_ocr',
        }
    )
    return cfs_file_ocr
}
