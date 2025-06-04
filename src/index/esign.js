const { Model } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    class esign extends Model {
        static associate(models) {
            // define association here
        }
    }
    esign.init(
        {
            user_id: DataTypes.INTEGER,
            writing_id: DataTypes.INTEGER,
            writing_peer_reviews_id: DataTypes.INTEGER,
            writing_type: DataTypes.INTEGER,
            document_id: DataTypes.INTEGER,
            contract_html: DataTypes.TEXT,
            title: DataTypes.STRING(512),
            event: DataTypes.INTEGER,
            last_possible_sign_datetime: DataTypes.DATE,
            progress_status: DataTypes.INTEGER,
            use_sequence_sign: DataTypes.INTEGER,
            current_sequence_sign: DataTypes.INTEGER,
            is_f2f_sign: DataTypes.INTEGER,
            file_name: DataTypes.STRING,
            page_width: DataTypes.INTEGER,
            page_height: DataTypes.INTEGER,
            cancel_reason: DataTypes.TEXT,
            cancel_at: DataTypes.DATE,
            cancel_signer_id: DataTypes.INTEGER,
            cancel_user_id: DataTypes.INTEGER,
            cancel_type: DataTypes.INTEGER,
            register_complete_at: DataTypes.DATE,
            sign_complete_at: DataTypes.DATE,
            user_permission_id: DataTypes.INTEGER,
            updated_at: DataTypes.DATE,
            created_at: DataTypes.DATE,
            is_del: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            tableName: 'esign',
        }
    )
    return esign
}
