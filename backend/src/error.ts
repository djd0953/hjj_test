
const CF_ERROR_STATUS = {
    MISSING_PARMAETER: {
        code: 400,
        message: '필수 파라미터가 없음'
    },
    MEMBER_SESSION: {
        code: 401,
        message: '다시 로그인 해주세요.'
    },
    LOGIC_FAILED: {
        code: 402,
        message: ''
    },

    /* 일반 에러(1 ~) */
    MODIFY_USER: {
        code: 403,
        id: 1,
        name: 'MODIFY_USER',
        message: '정보 변경 중 에러가 발생했습니다.'
    },
    MODIFY_PASSWORD: {
        code: 403,
        id: 2,
        name: 'MODIFY_PASSWORD',
        message: '비밀번호 변경 중 에러가 발생했습니다.'
    },
    CREATE_PHONE: {
        code: 403,
        id: 3,
        name: 'CREATE_PHONE',
        message: '휴대폰 번호 변경 중 에러가 발생했습니다.'
    },
    MODIFY_PHONE: {
        code: 403,
        id: 3,
        name: 'MODIFY_PHONE',
        message: '휴대폰 번호 변경 중 에러가 발생했습니다.'
    },
    MISSMATCH_PASSWORD: {
        code: 403,
        id: 4,
        name: 'MISSMATCH_PASSWORD',
        message: '비밀번호가 일치하지 않습니다.'
    },
    MISSMATCH_COUPON_CODE: {
        code: 403,
        id: 5,
        name: 'MISSMATCH_COUPON_CODE',
        message: '유효하지 않은 쿠폰입니다.'
    },
    CREATE_COUPON: {
        code: 403,
        id: 6,
        name: 'CREATE_COUPON',
        message: '쿠폰 등록 중 에러가 발생했습니다.'
    },
    FAQ_MISSING_CATEGORY: {
        code: 403,
        id: 7,
        name: 'FAQ_MISSING_CATEGORY',
        message: 'Faq category가 존재하지 않습니다.'
    },
    FAQ_MISSING_SUBCATEGORY: {
        code: 403,
        id: 8,
        name: 'FAQ_MISSING_SUBCATEGORY',
        message: 'Faq subcategory가 존재하지 않습니다.'
    },
    ADMIN_LOGIN_EMAIL_NOT_IN_CONFIG: {
        code: 403,
        id: 9,
        name: 'ADMIN_LOGIN_EMAIL_NOT_IN_CONFIG',
        message: '개발팀에서 승인한 이메일 주소가 아님. (개발팀 문의)'
    },
    ESIGN_NOT_FOUND: {
        code: 403,
        id: 10,
        name: 'ESIGN_NOT_FOUND',
        message: '접근할 수 없는 전자서명입니다.'
    },
    ESIGN_SIGNER_UPDATE_FAILED: {
        code: 403,
        id: 11,
        name: 'ESIGN_SIGNER_UPDATE_FAILED',
        message: '서명정보 저장 과정에서 오류가 발생하였습니다. 다시 시도해주세요.'
    },
    USER_ID_NOT_FOUND: {
        code: 403,
        id: 12,
        name: 'USER_ID_NOT_FOUND',
        message: '넘겨준 user id로 회원이 존재하지 않음'
    },
    USER_DUPLICATE_EMAIL: {
        code: 403,
        id: 13,
        name: 'USER_DUPLICATE_EMAIL',
        message: '이미 이메일이 존재 함'
    },
    ESIGN_WRONG_PROGRESS_STATUS: {
        code: 403,
        id: 14,
        name: 'ESIGN_WRONG_PROGRESS_STATUS',
        message: '등록 되어 있지 않는 progress_status 값'
    },
    ESIGN_UPDATE_FAILED: {
        code: 403,
        id: 15,
        name: 'ESIGN_UPDATE_FAILED',
        message: 'esign db 업데이트 실패'
    },
    KAKAO_REQUEST_FAILED: {
        code: 403,
        id: 16,
        name: 'KAKAO_REQUEST_FAILED',
        message: '카카오페이 인증 요청 실패'
    },
    KAKAO_CONFIRM_FAILED: {
        code: 403,
        id: 17,
        name: 'KAKAO_CONFIRM_FAILED',
        message: '카카오페이 인증 실패'
    },
    BANNER_GROUP_ID_UPDATE_NOT_ARRAY: {
        code: 403,
        id: 18,
        name: 'BANNER_GROUP_ID_UPDATE_NOT_ARRAY',
        message: '업데이트할 배너가 정상 배열 아님'
    },
    ESIGN_SIGNER_DEADLINE_PASSED: {
        code: 403,
        id: 19,
        name: 'ESIGN_SIGNER_DEADLINE_PASSED',
        message: '서명 참여자 서명 가능 기간 지나감'
    },
    ESIGN_SIGNER_NOT_CURRENT_TURN: {
        code: 403,
        id: 20,
        name: 'ESIGN_SIGNER_NOT_CURRENT_TURN',
        message: '서명 참여자 서명 순서 사용 경우인데 현재 서명 순서가 아님'
    },
    USER_PERMISSION_NOT_FOUND: {
        code: 403,
        id: 21,
        name: 'USER_PERMISSION_NOT_FOUND',
        message: 'user permission 찾을 수 없음'
    },
    USER_PERMISSION_FAIL_CREATE: {
        code: 403,
        id: 22,
        name: 'USER_PERMISSION_FAIL_CREATE',
        message: 'user permission db insert 실패'
    },
    AUTODOC_DUPLICATE_MODIFY_NOT_ALLOWED: {
        code: 403,
        id: 23,
        name: 'AUTODOC_DUPLICATE_MODIFY_NOT_ALLOWED',
        message: '에디터 사용 중인 자동작성 문서는 복제 불가능'
    },
    PARAMETER_VALUE_ERROR: {
        code: 403,
        id: 25,
        name: 'PARAMETER_VALUE_ERROR',
        message: '서버 내부 parameter 오류'
    },
    PERMISSION_NEED_TO_BUY_DRIVE: {
        code: 403,
        id: 26,
        name: 'PERMISSION_NEED_TO_BUY_DRIVE',
        message: '드라이브 이용권이 없음'
    },
    PERMISSION_NEED_TO_BUY_CLOUD_ACTION: {
        code: 403,
        id: 27,
        name: 'PERMISSION_NEED_TO_BUY_CLOUD_ACTION',
        message: '드라이브 이용권 있으나 기능이용 모두 소진 (단건 결제)'
    },
    PERMISSION_CLOUD_ACTION_REDUCE_ERROR: {
        code: 403,
        id: 28,
        name: 'PERMISSION_CLOUD_ACTION_REDUCE_ERROR',
        message: '기능이용 값 수정하다가 오류 발생'
    },
    MONEY_NOT_ENOUGH: {
        code: 403,
        id: 29,
        name: 'MONEY_NOT_ENOUGH',
        message: '포인트 및 적립금이 부족함'
    },
    PERMISSION_NEED_TO_BUY_CLOUD_ESIGN: {
        code: 403,
        id: 30,
        name: 'PERMISSION_NEED_TO_BUY_CLOUD_ESIGN',
        message: '드라이브 이용권 있으나 전자서명 모두 소진 (단건 결제로 이동)'
    },
    PERMISSION_CLOUD_ESIGN_REDUCE_ERROR: {
        code: 403,
        id: 31,
        name: 'PERMISSION_CLOUD_ESIGN_REDUCE_ERROR',
        message: '드라이브 전자서명 cloud_esign 값 수정하다가 오류 발생'
    },
    LAWDOC_ALREADY_ACCEPT_REVIEW: {
        code: 409,
        id: 32,
        name: 'LAWDOC_ALREADY_ACCEPT_REVIEW',
        message: '이미 다른 분께서 먼저 신청하였습니다.'
    },
    COUPON_WRONG_CODE: {
        code: 403,
        id: 33,
        name: 'COUPON_WRONG_CODE',
        message: '잘못 된 쿠폰 코드 입니다'
    },
    LOGIN_EMAIL_NOT_FOUND: {
        code: 403,
        id: 34,
        name: 'LOGIN_EMAIL_NOT_FOUND',
        message: '가입 되어 있지 않은 이메일 주소 입니다'
    },
    LOGIN_WRONG_PASSWORD: {
        code: 403,
        id: 35,
        name: 'LOGIN_WRONG_PASSWORD',
        message: '이메일 혹은 비밀번호가 일치하지 않습니다'
    },
    COMMENT_NOT_FOUND: {
        code: 403,
        id: 36,
        name: 'COMMENT_NOT_FOUND',
        message: '코멘트 찾을 수 없습니다'
    },
    COMMENT_ATTACHMENT_NOT_FOUND: {
        code: 403,
        id: 36,
        name: 'COMMENT_ATTACHMENT_NOT_FOUND',
        message: '코멘트 첨부파일을 찾을 수 없습니다'
    },
    WRONG_USER_ACCOUNT_TYPE: {
        code: 403,
        id: 37,
        name: 'WRONG_USER_ACCOUNT_TYPE',
        message: '잘못 된 고객 유형 입니다'
    },
    LAWDOC_NOT_FOUND: {
        code: 403,
        id: 38,
        name: 'LAWDOC_NOT_FOUND',
        message: '해당 내용을 불러올 수 없습니다.'
    },
    AUTODOC_NOT_FOUND: {
        code: 403,
        id: 39,
        name: 'AUTODOC_NOT_FOUND',
        message: '접근 권한이 없는 문서입니다.'
    },
    PERMISSION_NEED_TO_BUY_CLOUD_CONTACT: {
        code: 403,
        id: 40,
        name: 'PERMISSION_NEED_TO_BUY_CLOUD_CONTACT',
        message: '드라이브 이용권 있으나 인적정보 모두 소진'
    },
    CFS_USER_NOT_COLLABORATOR: {
        code: 403,
        id: 41,
        name: 'CFS_USER_NOT_COLLABORATOR',
        message: '초대 받지 않은 문서 접근하려고 합니다'
    },
    CFS_NEED_USER_LOGIN: {
        code: 403,
        id: 42,
        name: 'CFS_NEED_USER_LOGIN',
        message: '로그인 해야 볼 수 있는 문서 입니다'
    },
    CFS_MISSING_COLLABORATOR_ID: {
        code: 403,
        id: 43,
        name: 'CFS_MISSING_COLLABORATOR_ID',
        message: '정상적인 순서로 문서를 접근하지 않았습니다.'
    },
    CFS_UNKOWN_CASE: {
        code: 403,
        id: 44,
        name: 'CFS_UNKOWN_CASE',
        message: '처리 되지 않은 경로로 접근 했습니다.'
    },
    CFS_PASSWORD_NOT_MATCH: {
        code: 403,
        id: 45,
        name: 'CFS_PASSWORD_NOT_MATCH',
        message: '비밀번호가 일치하지 않습니다'
    },
    CFS_NEED_TO_REQUEST_ACCESS: {
        code: 403,
        id: 46,
        name: 'CFS_NEED_TO_REQUEST_ACCESS',
        message: '문서에 대한 권한 요청 해야 됩니다.'
    },
    CFS_TOKEN_ERROR: {
        code: 403,
        id: 47,
        name: 'CFS_TOKEN_ERROR',
        message: 'cfs token에 대한 오류 '
    },
    CFS_NOT_FOUND: {
        code: 403,
        id: 48,
        name: 'CFS_NOT_FOUND',
        message: '삭제된 문서입니다.'
    },
    CFS_COLLABORATOR_TRY_CHANGE_ACCESS_WHEN_NOT_OWNER: {
        code: 403,
        id: 49,
        name: 'CFS_COLLABORATOR_TRY_CHANGE_ACCESS_WHEN_NOT_OWNER',
        message: '소유자만 사용 가능한 기능입니다.'
    },
    CFS_COLLABORATOR_TRY_CHANGE_ACCESS_FOR_NOT_COLLABORATOR: {
        code: 403,
        id: 50,
        name: 'CFS_COLLABORATOR_TRY_CHANGE_ACCESS_FOR_NOT_COLLABORATOR',
        message: 'CFS Collaborator가 아닌데 권한 수정하려고 하는 문제'
    },
    CFS_COLLABORATOR_WRONG_ACCESS_TYPE: {
        code: 403,
        id: 51,
        name: 'CFS_COLLABORATOR_WRONG_ACCESS_TYPE',
        message: '잘 못 된 access 값 (NONE, READ, WRITE 중 아님)'
    },
    CFS_COLLABORATOR_ATTEMPT_WRITE_BUT_NO_ACCESS: {
        code: 403,
        id: 52,
        name: 'CFS_COLLABORATOR_ATTEMPT_WRITE_BUT_NO_ACCESS',
        message: '수정 권한이 없습니다.'
    },
    CFS_COLLABORATOR_NOT_LAWFORM_MEMBER: {
        code: 403,
        id: 53,
        name: 'CFS_COLLABORATOR_NOT_LAWFORM_MEMBER',
        message: 'cfs collaborator 로폼 회원 아님'
    },
    FAILED_GENERATE_STAMP: {
        code: 403,
        id: 54,
        name: 'FAILED_GENERATE_STAMP',
        message: '직인을 만드는데 실패하였습니다. 가능한 직인 길이는 1~12자 입니다.'
    },
    FAILED_GENERATE_PDF: {
        code: 403,
        id: 55,
        name: 'FAILED_GENERATE_PDF',
        message: 'PDF를 만드는데 실패하였습니다. 계속될 경우 문의해주세요.'
    },
    USER_FAILED_UPDATE_TEAM: {
        code: 403,
        id: 56,
        name: 'USER_FAILED_UPDATE_TEAM',
        message: '회원 DB에 team_id 업데이트 실패'
    },
    USER_ALREADY_IN_ANOTHER_TEAM: {
        code: 403,
        id: 57,
        name: 'USER_ALREADY_IN_ANOTHER_TEAM',
        message: '회원 이미 다른 팀에 소속 됨'
    },
    TEAM_MEMBER_NOT_FOUND: {
        code: 403,
        id: 58,
        name: 'TEAM_MEMBER_NOT_FOUND',
        message: '회원 ID 과 Team Id가 일치하지 않음'
    },
    TEAM_MEMBER_NOT_FOUND_2: {
        code: 403,
        id: 59,
        name: 'TEAM_MEMBER_NOT_FOUND_2',
        message: '회원을 찾을 수가 없음'
    },
    TEAM_MEMBER_CATEGORY_CREATE_FAILED: {
        code: 403,
        id: 60,
        name: 'TEAM_MEMBER_CATEGORY_CREATE_FAILED',
        message: '부서 추가 실패'
    },
    TEAM_MEMBER_SUBCATEGORY_CREATE_FAILED: {
        code: 403,
        id: 61,
        name: 'TEAM_MEMBER_SUBCATEGORY_CREATE_FAILED',
        message: '팀 소카테고리 추가 실패'
    },
    TEAM_NOT_MY_TEAM: {
        code: 403,
        id: 62,
        name: 'TEAM_NOT_MY_TEAM',
        message: '다른 팀을 조회 하는 함'
    },
    COMMENT_CREATE_FAILED: {
        code: 403,
        id: 63,
        name: 'COMMENT_CREATE_FAILED',
        message: '코멘트 생성 실패'
    },
    COMMENT_ATTACHMENT_CREATE_FAILED: {
        code: 403,
        id: 63,
        name: 'COMMENT_ATTACHMENT_CREATE_FAILED',
        message: '코멘트 파일 업로드 실패'
    },
    DOCUMENT_SAMPLE_NOT_FOUND: {
        code: 403,
        id: 64,
        name: 'DOCUMENT_SAMPLE_NOT_FOUND',
        message: '샘플 PDF 찾 수 없음'
    },
    TEAM_ALREADY_PART_OF: {
        code: 403,
        id: 65,
        name: 'TEAM_ALREADY_PART_OF',
        message: '이미 다른 팀에 가입 되어 있습니다'
    },
    PROFILE_NOT_FOUND: {
        code: 403,
        id: 66,
        name: 'PROFILE_NOT_FOUND',
        message: '프로필 찾을 수 없습니다'
    },
    TEAM_NOT_TEAM_MASTER: {
        code: 403,
        id: 67,
        name: 'TEAM_NOT_TEAM_MASTER',
        message: '팀 마스터 아닙니다'
    },
    TEAM_NOT_SAME: {
        code: 403,
        id: 68,
        name: 'TEAM_NOT_SAME',
        message: '같은 팀이 아닙니다'
    },
    COUPON_ALREADY_EXSIST: {
        code: 403,
        id: 69,
        name: 'COUPON_ALREADY_EXSIST',
        message: '이미 등록 된 쿠폰 입니다'
    },
    COUPON_CREATE_FAILED: {
        code: 403,
        id: 70,
        name: 'COUPON_CREATE_FAILED',
        message: '쿠폰 생성 실패'
    },
    ESIGN_CREATE_FAILED: {
        code: 403,
        id: 71,
        name: 'ESIGN_CREATE_FAILED',
        message: 'esign db 생성 실패'
    },
    ESIGN_DATATYPE_WRONG: {
        code: 403,
        id: 72,
        name: 'ESIGN_DATATYPE_WRONG',
        message: '데이터 타입을 다시 확인해주세요'
    },
    ESIGN_OMETHING_WRONG_MULTER: {
        code: 403,
        id: 73,
        name: 'ESIGN_OMETHING_WRONG_MULTER',
        message: '첨부파일 처리에 오륙가 생겼습니다.'
    },
    ESIGN_IMG_CONVERT_FAILED: {
        code: 403,
        id: 74,
        name: 'ESIGN_IMG_CONVERT_FAILED',
        message: '이미지 변환에 실패했습니다.'
    },
    ADMIN_PERMISSION_EMAIL_LIST_ERROR: {
        code: 403,
        id: 75,
        name: 'ADMIN_PERMISSION_EMAIL_LIST_ERROR',
        message: '관리자 이메일 목록에 없는 계정입니다'
    },
    NOT_FOUND_GUEST_ID: {
        code: 403,
        id: 76,
        name: 'NOT_FOUND_GUEST_ID',
        message: '게스트 정보를 확인할 수 없습니다.'
    },
    NOT_CFS_FOLDER: {
        code: 403,
        id: 77,
        name: 'NOT_CFS_FOLDER',
        message: '폴더가 아닙니다.'
    },
    CFS_MOVE_FAILED: {
        code: 403,
        id: 78,
        name: 'CFS_MOVE_FAILED',
        message: '파일 이동 중 오류가 있습니다. (folder_id 또는 user_id)'
    },
    DB_FAIL_CREATE: {
        code: 403,
        id: 79,
        name: 'DB_FAIL_CREATE',
        message: 'DB에 데이터를 추가할 수 없습니다.'
    },
    DB_FAIL_UPDATE: {
        code: 403,
        id: 80,
        name: 'DB_FAIL_UPDATE',
        message: 'DB 데이터를 수정할 수 없습니다.'
    },
    PERMISSION_PRICE_IS_NOT_DEFINE: {
        code: 403,
        id: 81,
        name: 'PERMISSION_PRICE_IS_NOT_DEFINE',
        message: '결재 중 문제가 생겼습니다.(거래 금액 찾을 수 없음)'
    },
    TEAM_NO_ENOUGH_ROOM_FOR_MEMBER: {
        code: 403,
        id: 82,
        name: 'TEAM_NO_ENOUGH_ROOM_FOR_MEMBER',
        message: '추가할 수 있는 최대 팀원수에 도달하여 팀원을 추가할 수 없습니다.'
    },
    TEAM_NO_ENOUGH_PLACE_FOR_LOGO: {
        code: 403,
        id: 83,
        name: 'TEAM_NO_ENOUGH_PLACE_FOR_LOGO',
        message: '로고는 최대 10개까지 저장 가능합니다.'
    },
    FILE_UPLOAD_NOT_FOUND_USER: {
        code: 403,
        id: 84,
        name: 'FILE_UPLOAD_NOT_FOUND_USER',
        message: '파일 업로드하는 대상을 찾지 못했습니다.'
    },
    CFS_FILE_UPLOAD_ERROR: {
        code: 403,
        id: 85,
        name: 'CFS_FILE_UPLOAD_ERROR',
        message: '파일 업로드 중 오류가 발생했습니다.'
    },
    ADMIN_NOT_ALLOW_THIS_API: {
        code: 403,
        id: 84,
        name: 'ADMIN_NOT_ALLOW_THIS_API',
        message: '해당 페이지 사용 권한이 없는 계정입니다. (개발팀 문의)'
    },
    NOT_FOUND_BUSINESS_OWNER: {
        code: 403,
        id: 85,
        name: 'NOT_FOUND_BUSINESS_OWNER',
        message: '창업자명이 등록되지 않았습니다.'
    },
    NOT_MATCH_NAME_AND_BUSINESS_OWNER: {
        code: 403,
        id: 86,
        name: 'NOT_MATCH_NAME_AND_BUSINESS_OWNER',
        message:
            '창업자 인증이 되지 않았습니다.\n 창업자 인증은 가입자명과 창업자명이 동일해야 합니다.'
    },
    NOT_FOUND_PERMISSION_PRO_OR_BUSINESS: {
        code: 403,
        id: 87,
        name: 'NOT_FOUND_PERMISSION_PRO_OR_BUSINESS',
        message: '프로 또는 비지니스 드라이브를 찾을 수 없습니다.'
    },
    ALREADY_RECEIVED_PERMISSION: {
        code: 403,
        id: 88,
        name: 'ALREADY_RECEIVED_PERMISSION',
        message: '이미 지급받은 이용권입니다.'
    },
    REDIS_SET_FAILED: {
        code: 403,
        id: 89,
        name: 'REDIS_SET_FAILED',
        message: '레디스에 캐싱 데이터 업로드에 실패했습니다.'
    },
    REDIS_GET_FAILED: {
        code: 403,
        id: 90,
        name: 'REDIS_GET_FAILED',
        message: '레디스에서 캐싱 데이터를 가져오는데 실패했습니다.'
    },
    COUPON_TARGET_CREATE_FAILED: {
        code: 403,
        id: 91,
        name: 'COUPON_TARGET_CREATE_FAILED',
        message: 'coupon_target 생성 실패'
    },
    USER_COUPON_LOG_CREATE_FAILED: {
        code: 403,
        id: 92,
        name: 'USER_COUPON_LOG_CREATE_FAILED',
        message: 'user_coupon_log 생성 실패'
    },
    COUPON_EXPIRED: {
        code: 403,
        id: 93,
        name: 'COUPON_EXPIRED',
        message: '기한이 초과된 쿠폰 등록'
    },
    COUPON_OVER_COUNTED: {
        code: 403,
        id: 94,
        name: 'COUPON_OVER_COUNTED',
        message: '쿠폰 등록 수량 초과'
    },
    NOT_ALLOWED_COUPON: {
        code: 403,
        id: 95,
        name: 'NOT_ALLOWED_COUPON',
        message: '허용되지 않은 쿠폰'
    },
    DUPLICATED_COUPON_CODE: {
        code: 403,
        id: 96,
        name: 'DUPLICATED_COUPON_CODE',
        message: '이미 등록되어 있는 쿠폰 코드'
    },
    INVALID_COUPON_TYPE_DATA: {
        code: 403,
        id: 97,
        name: 'INVALID_COUPON_TYPE_DATA',
        message: '유효하지 않은 쿠폰 타입과 관련 데이터'
    },
    INVALID_COUPON_TARGET_DATA: {
        code: 403,
        id: 98,
        name: 'INVALID_COUPON_TARGET_DATA',
        message: 'target 제거 시 coupon_target.id이 없음'
    },
    FAILED_UPLOAD_STAMP: {
        code: 403,
        id: 99,
        name: 'FAILED_UPLOAD_STAMP',
        message: '직인 등록에 실패하였습니다.'
    },
    FAILED_UPDATE_STAMP: {
        code: 403,
        id: 100,
        name: 'FAILED_UPDATE_STAMP',
        message: '직인 등록에 실패하였습니다.'
    },
    FAILED_UPLOAD_CERTIFICATE: {
        code: 403,
        id: 101,
        name: 'FAILED_UPLOAD_CERTIFICATE',
        message: '인증서 등록에 실패하였습니다.'
    },
    RECOMMENDED_OVER_COUNT: {
        code: 403,
        id: 102,
        name: 'RECOMMENDED_OVER_COUNT',
        message: '추천 자동작성 수량 제한 초과'
    },
    NOT_FOUND_USER_ID_OR_TEAM_ID: {
        code: 403,
        id: 103,
        name: 'NOT_FOUND_USER_ID_OR_TEAM_ID',
        message: '팀원 조회 시 정보 누락(team_id)'
    },
    EXPIRED_USER_PERMISSION: {
        code: 403,
        id: 104,
        name: 'EXPIRED_USER_PERMISSION',
        message: '만료된 이용권입니다.'
    },
    ONLY_ONE_USED_USER_PERMISSION: {
        code: 403,
        id: 105,
        name: 'ONLY_ONE_USED_USER_PERMISSION',
        message: '사용중인 이용권이 한 개 입니다.'
    },
    MEMBER_USER_PERMISSION_NOT_ALLOW_STOP: {
        code: 403,
        id: 105,
        name: 'MEMBER_USER_PERMISSION_NOT_ALLOW_STOP',
        message: '팀 플랜은 중지할 수 없습니다.'
    },
    NO_ACTION_USER_PERMISSION: {
        code: 403,
        id: 106,
        name: 'NO_ACTION_USER_PERMISSION',
        message: '해당 권한이 없습니다.'
    },
    CURATION_BOOKMARK_NOT_FOUND: {
        code: 403,
        id: 107,
        name: 'CURATION_BOOKMARK_NOT_FOUND',
        message: '권한 없는 담기를 찾고 계십니다'
    },
    NOT_FOUND_TEAM: {
        code: 403,
        id: 108,
        name: 'NOT_FOUND_TEAM',
        message: '팀 정보를 불러올 수 없습니다.'
    },
    NOT_FOUND_KAKAO_ACCOUNT: {
        code: 403,
        id: 109,
        name: 'NOT_FOUND_KAKAO_ACCOUNT',
        message: '카카오 계정 정보를 불러올 수 없습니다.'
    },
    NOT_FOUND_GOOGLE_ACCOUNT: {
        code: 403,
        id: 121,
        name: 'NOT_FOUND_GOOGLE_ACCOUNT',
        message: '구글 계정 정보를 불러올 수 없습니다.'
    },
    NOT_FOUND_NAVER_ACCOUNT: {
        code: 403,
        id: 110,
        name: 'NOT_FOUND_NAVER_ACCOUNT',
        message: '네이버 계정 정보를 불러올 수 없습니다.'
    },
    NOT_FOUND_APPLE_ACCOUNT: {
        code: 403,
        id: 111,
        name: 'NOT_FOUND_APPLE_ACCOUNT',
        message: '애플 계정 정보를 불러올 수 없습니다.'
    },
    NOT_CONTRACT_MEMBER: {
        code: 403,
        id: 112,
        name: 'NOT_CONTRACT_MEMBER',
        message: '알바계약서 로폼 앱 회원이 아닙니다.'
    },
    NOT_BE_USED_COUPON: {
        code: 403,
        id: 113,
        name: 'NOT_BE_USED_COUPON',
        message: '사용할 수 없는 쿠폰입니다.'
    },
    CFS_WRONG_TYPE_CASE: {
        code: 403,
        id: 114,
        name: 'CFS_WRONG_TYPE_CASE',
        message: '파일 아닌데 접근 하고 있습니다.'
    },
    CFS_FOLDER_NO_ACCESS: {
        code: 404,
        id: 115,
        name: 'CFS_FOLDER_NO_ACCESS',
        message: '해당 폴더 접근 권한이 없습니다.'
    },
    /* 전자서명 - 카카오 메세지 오류, message는 해당 영역에서 받아서 처리해줌. */
    ESIGN_KAKAO_CERT_ERROR: {
        code: 403,
        id: 116,
        name: 'ESIGN_KAKAO_CERT_ERROR'
    },
    USER_EVENT_DEFINE_CATEGORY: {
        code: 403,
        id: 117,
        name: 'USER_EVENT_DEFINE_CATEGORY',
        message: '확인되지 않은 이벤트입니다.'
    },
    WRONG_CFS_FOLDER_MOVE_FAILED: {
        code: 403,
        id: 118,
        name: 'WRONG_CFS_FOLDER_MOVE_FAILED',
        message:
            '파일 이동 중 오류가 있습니다. (이동하려는 종착지 폴더가 현재 폴더와 일치하거나 하부에 있는 폴더입니다.)'
    },
    USER_DUPLICATE_CID: {
        code: 403,
        id: 119,
        name: 'USER_DUPLICATE_CID',
        message: '이미 존재하는 유저입니다.'
    },
    THIRDPARTY_MISSING_AUTHORIZATION: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_MISSING_AUTHORIZATION',
        message: 'headers에서 Authorization 설정이 제대로 되어 있지 않습니다'
    },
    THIRDPARTY_AUTHORIZATION_INVALID: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_AUTHORIZATION_INVALID',
        message: 'Authorization 진행하지 않았습니다.'
    },
    THIRDPARTY_SESSION_MISSING: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_SESSION_MISSING',
        message: '세션 값이 없습니다'
    },
    THIRDPARTY_SESSION_INVALID: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_SESSION_INVALID',
        message: '세션 값 오류 있거나 만료 되었습니다. 다시 로그인 해주세요.'
    },
    THIRDPARTY_DOCUMENT_NOT_FOUND: {
        code: 403,
        id: 120,
        name: 'THIRDPARTY_DOCUMENT_NOT_FOUND',
        message: '사용가능한 문서가 존재하지 않습니다.'
    },
    THIRDPARTY_ESIGN_NOT_FOUND: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_ESIGN_NOT_FOUND',
        message: '전자서명을 찾지 못 했습니다.'
    },
    THIRDPARTY_MAGAZINE_NO_ACCESS: {
        code: 403,
        id: 119,
        name: 'THIRDPARTY_MAGAZINE_NO_ACCESS',
        message: '권한 없는 매거진을 접근하고 있습니다.'
    },
    THIRDPARTY_ESIGN_CONFIRM_FAILED: {
        code: 403,
        id: 126,
        name: 'THIRDPARTY_ESIGN_CONFIRM_FAILED',
        message: '휴대폰 인증에 실패했습니다.'
    },
    THIRDPARTY_CIMS_LOGIN_FAILED: {
        code: 403,
        id: 126,
        name: 'THIRDPARTY_CIMS_LOGIN_FAILED',
        message: '로그인 권한이 없습니다.'
    },
    THIRDPARTY_CIMS_FILE_UPLOAD_FAILED: {
        code: 403,
        id: 126,
        name: 'THIRDPARTY_CIMS_FILE_UPLOAD_FAILED',
        message: '파일 업로드에 실패했습니다.'
    },
    DECRYPT_FAILED_DATA: {
        code: 403,
        id: 126,
        name: 'DECRYPT_FAILED_DATA',
        message: '복호화에 실패했습니다.'
    },
    DECRYPT_INAVLID_KEY_LENGTH: {
        code: 403,
        id: 126,
        name: 'DECRYPT_INAVLID_KEY_LENGTH',
        message: '유효하지 않은 key 입니다'
    },
    ALREADY_PARTICIPATE_EVENT: {
        code: 403,
        id: 115,
        name: 'ALREADY_PARTICIPATE_EVENT',
        message: '이미 참여한 이벤트 입니다.'
    },
    THIRDPARTY_LOGIN_FAILED: {
        code: 403,
        id: 115,
        name: 'THIRDPARTY_LOGIN_FAILED',
        message: '로그인에 실패했습니다.'
    },
    THIRDPARTY_CFS_REQUEST_CREATE_FAILED: {
        code: 403,
        id: 134,
        name: 'THIRDPARTY_CFS_REQUEST_CREATE_FAILED',
        message: '문서 신청하기 실패'
    },
    THIRDPARTY_CFS_REQUEST_ALREADY_EXSIST: {
        code: 403,
        id: 135,
        name: 'THIRDPARTY_CFS_REQUEST_ALREADY_EXSIST',
        message: '이미 문서 신청하기가 진행되었습니다.'
    },
    THIRDPARTY_CFS_AUTH_NOT_FOUND_MOBILE_NUMBER: {
        code: 403,
        id: 136,
        name: 'THIRDPARTY_CFS_AUTH_NOT_FOUND_MOBILE_NUMBER',
        message: '요청한 휴대전화번호와 일치하지 않습니다'
    },
    DOCUMENT_TEMPLATE_PARSING_FAILED: {
        code: 403,
        id: 136,
        name: 'DOCUMENT_TEMPLATE_PARSING_FAILED',
        message: '잘못된 문서 형식입니다.'
    },
    DOCUMENT_NOT_FOUND: {
        code: 403,
        id: 120,
        name: 'DOCUMENT_NOT_FOUND',
        message: '사용가능한 문서가 존재하지 않습니다.'
    },
    PERMISSION_NEED_TO_DOWNLOAD_LIST: {
        code: 403,
        id: 26,
        name: 'PERMISSION_NEED_TO_DOWNLOAD_LIST',
        message: '일괄 다운로드 기능 권한이 없습니다.'
    },
    ARTICLE_IS_NOT_MINE: {
        code: 403,
        id: 137,
        name: 'ARTICLE_IS_NOT_MINE',
        message: '게시글 작성자가 아닙니다.'
    },
    ARTICLE_COMMENT_IS_NOT_MINE: {
        code: 403,
        id: 138,
        name: 'ARTICLE_COMMENT_IS_NOT_MINE',
        message: '댓글 작성자가 아닙니다.'
    },
    QUIZ_FAILED_SUBMIT: {
        code: 403,
        id: 139,
        name: 'QUIZ_FAILED_SUBMIT',
        message: '퀴즈 참여에 실패하였습니다.'
    },
    USER_REWARD_CREATE_FAILED: {
        code: 403,
        id: 140,
        name: 'USER_REWARD_CREATE_FAILED',
        message: '보상 지급에 실패하였습니다.'
    },
    CLM_ATTACHMENT_NOT_FOUND: {
        code: 403,
        id: 160,
        name: 'CLM_ATTACHMENT_NOT_FOUND',
        message: '첨부 파일을 찾을 수 없습니다.'
    },
    CLM_ATTACHMENT_NO_ACCESS: {
        code: 403,
        id: 161,
        name: 'CLM_ATTACHMENT_NO_ACCESS',
        message: '첨부 파일에 대한 접근 권한이 없습니다.'
    },
    CLM_ATTACHMENT_TOKEN_ERROR: {
        code: 403,
        id: 162,
        name: 'CLM_ATTACHMENT_TOKEN_ERROR',
        message: '첨부 파일 token에 대한 오류'
    },
    CLM_CREATE_INVALID_FILE_TYPE: {
        code: 403,
        id: 162,
        name: 'CLM_CREATE_INVALID_FILE_TYPE',
        message: '문서만 계약서 요청 가능합니다.'
    },
    CLM_NOT_ALLOW_ERROR: {
        code: 403,
        id: 163,
        name: 'CLM_NOT_ALLOW_ERROR',
        message: '해당 계약서에 권한이 없습니다.'
    },
    FILE_CONVERSION_ERROR: {
        code: 403,
        id: 164,
        name: 'FILE_CONVERSION_ERROR',
        message: '파일 변경에 실패하였습니다.'
    },
    CLM_MISSING_CFS_ID: {
        code: 403,
        id: 165,
        name: 'CLM_MISSING_CFS_ID',
        message: '해당 계약서를 찾을 수 없습니다.'
    },
    CLM_MISSING_FILE_ID: {
        code: 403,
        id: 165,
        name: 'CLM_MISSING_FILE_ID',
        message: 'clm id로 파일을 찾을 수 없습니다.'
    },
    CLM_DESIGNATED_RESOURCE_NOT_FOUND: {
        code: 404,
        id: 167,
        name: 'CLM_DESIGNATED_RESOURCE_NOT_FOUND',
        message: '찾을 수 없는 리소스 입니다.'
    },
    CLM_INVALID_FILE: {
        code: 403,
        id: 168,
        name: 'CLM_INVALID_FILE',
        message: '올바르지 않은 파일입니다.'
    },
    FILE_NAME_ALREADY_USING: {
        code: 403,
        id: 169,
        name: 'FILE_NAME_ALREADY_USING',
        message: '이미 사용중인 파일명입니다. 파일명을 변경해주세요.'
    },
    NOT_COMPLETE_LECTURE: {
        code: 403,
        id: 170,
        name: 'NOT_COMPLETE_LECTURE',
        message: '강의를 보신 후 다시 시도해 주세요.'
    },
    USER_EDUCATION_ALREADY_EXSIST: {
        code: 409,
        id: 171,
        name: 'USER_EDUCATION_ALREADY_EXSIST',
        message: '이미 해당 강의를 수강 중입니다.'
    },
    MY_MENU_CREATE_ERROR: {
        code: 403,
        id: 172,
        name: 'MY_MENU_CREATE_ERROR',
        message: '나의 메뉴 등록에 실패하였습니다.'
    },
    USER_CONTACT_NOT_FOUND_USER_ID: {
        code: 403,
        id: 173,
        name: 'USER_CONTACT_NOT_FOUND_USER_ID',
        message: '회원 정보를 찾을 수 없습니다.'
    },
    NO_PERMISSION_STATISTICS: {
        code: 403,
        id: 174,
        name: 'NO_PERMISSION_STATISTICS',
        message: '통계 접근 권한이 없습니다.'
    },
    CLM_INVALID_PROGRESS: {
        code: 403,
        id: 175,
        name: 'CLM_INVALID_PROGRESS',
        message: '이미 지난 단계에서 작업하고 있습니다. 새로고침 해주세요.'
    },
    NOT_FOUND_PHONE_AUTH: {
        code: 403,
        id: 176,
        name: 'NOT_FOUND_PHONE_AUTH',
        message: '인증 내역이 없습니다'
    },
    ESIGN_SIGNERS_SIGN_NOT_FOUND: {
        code: 403,
        id: 174,
        name: 'ESIGN_SIGNERS_SIGN_NOT_FOUND',
        message: '서명을 찾지 못 했습니다.'
    },
    ESIGN_NOT_FOUND_WITH_SIGNER_ID: {
        code: 403,
        id: 177,
        name: 'ESIGN_NOT_FOUND_WITH_SIGNER_ID',
        message: 'signer id로 전자서명을 찾을 수 없습니다.'
    },
    CLM_CANCEL_PARTICIPATE: {
        code: 403,
        id: 178,
        name: 'CLM_CANCEL_PARTICIPATE',
        message: '초대가 취소되었습니다. 관리자에게 문의해 주세요.'
    },
    CLM_INVALID_PROGRESS_STATUS_ROLLBACK: {
        code: 403,
        id: 178,
        name: 'CLM_INVALID_PROGRESS_STATUS_ROLLBACK',
        message: '현재 단계와 동일한 상태입니다.'
    },
    CLM_NOT_FOUND_CHECK_LIST: {
        code: 403,
        id: 179,
        name: 'CLM_NOT_FOUND_CHECK_LIST',
        message: 'CLM에서 체크리스트를 찾지 못하였습니다.'
    },
    AZURE_OPENAI_RESPONSE_INVALID: {
        code: 403,
        id: 180,
        name: 'AZURE_OPENAI_RESPONSE_INVALID',
        message: 'Azure OpenAI에서 반환된 응답이 유효하지 않습니다.'
    },
    NOT_ALLOWED_TEAM: {
        code: 403,
        id: 181,
        name: 'NOT_ALLOWED_TEAM',
        message: '허용되지 않는 팀 전환입니다.'
    },
    PROJECT_NOT_ALLOW_ERROR: {
        code: 403,
        id: 182,
        name: 'PROJECT_NOT_ALLOW_ERROR',
        message: '해당 프로젝트에 대한 열람 권한이 없습니다.'
    },
    NOT_ALLOWED_TEAM_SELECT: {
        code: 403,
        id: 183,
        name: 'NOT_ALLOWED_TEAM_SELECT',
        message: '접근할 수 없는 팀입니다.'
    },
    NO_POISON_PILL_FOR_DOCUMENT: {
        code: 403,
        id: 184,
        name: 'NO_POISON_PILL_FOR_DOCUMENT',
        message: '독소 조항이 등록되지 않은 문서 입니다.'
    },
    NOT_FOUND_PURCHASE: {
        code: 403,
        id: 185,
        name: 'NOT_FOUND_PURCHASE',
        message: '구매내역을 찾을 수 없습니다.'
    },
    FAILED_PAYMENT_CONFIRM: {
        code: 403,
        id: 186,
        name: 'FAILED_PAYMENT_CONFIRM',
        message: '구매승인에 실패했습니다.'
    },
    AZURE_OPENAI_TOKEN_LIMIT: {
        code: 403,
        id: 188,
        name: 'AZURE_OPENAI_TOKEN_LIMIT',
        message: '입력 토큰 수가 한계치를 초과하였습니다.'
    },
    CLM_APPROVAL_FLOW_NOT_FOUND: {
        code: 403,
        id: 188,
        name: 'CLM_APPROVAL_FLOW_NOT_FOUND',
        message: '사전에 정의된 결재선이 없음.'
    },
    CLM_APPROVAL_NEXT_APPROVAL_ALREADY_DONE: {
        code: 403,
        id: 189,
        name: 'CLM_APPROVAL_NEXT_APPROVAL_ALREADY_DONE',
        message: '다음 결재자의 결재가 완료되어 수정이 불가능합니다.'
    },
    CLM_APPROVAL_INVALID_APPROVAL_TYPE: {
        code: 403,
        id: 190,
        name: 'CLM_APPROVAL_INVALID_APPROVAL_TYPE',
        message: '업데이트 할수 없는 결재 타입입니다.'
    },
    CLM_APPROVAL_PREVIOUS_APPROVAL_CANCELED: {
        code: 403,
        id: 200,
        name: 'CLM_APPROVAL_PREVIOUS_APPROVAL_CANCELED',
        message: '이전 결재자가 반려로 수정하였습니다.'
    },
    CLM_APPROVAL_FLOW_DUPLICATE: {
        code: 403,
        id: 201,
        name: 'CLM_APPROVAL_FLOW_DUPLICATE',
        message: '이미 지정된 결제선이 있습니다.'
    },
    JWT_VERIFICATION_FAILED: {
        code: 401,
        id: 211,
        name: 'JWT_VERIFICATION_FAILED',
        message: '유효하지 않은 JWT'
    },
    INVALID_USER: {
        code: 403,
        id: 202,
        name: 'INVALID_USER',
        message: '사용자 정보를 알 수 없습니다.'
    },
    INVALID_REQUEST: {
        code: 403,
        id: 203,
        name: 'INVALID_REQUEST',
        message: '요청하신 내용이 유효하지 않아 서버에서 처리할 수 없습니다.'
    },
    NOT_FOUND_SHAREHOLDER_MEETING: {
        code: 403,
        id: 204,
        name: 'NOT_FOUND_SHAREHOLDER_MEETING',
        message: '주주총회 정보를 찾을 수 없습니다.'
    },
    ALREADY_COMPLETE_SHAREHOLDER_MEETING: {
        code: 403,
        id: 205,
        name: 'ALREADY_COMPLETE_SHAREHOLDER_MEETING',
        message: '이미 완료된 주주총회 입니다.'
    },
    PROJECT_ATTACHMENT_NOT_FOUND: {
        code: 403,
        id: 206,
        name: 'PROJECT_ATTACHMENT_NOT_FOUND',
        message: '첨부 파일을 찾을 수 없습니다.'
    },
    PROJECT_ATTACHMENT_NO_ACCESS: {
        code: 403,
        id: 207,
        name: 'PROJECT_ATTACHMENT_NO_ACCESS',
        message: '첨부 파일에 대한 접근 권한이 없습니다.'
    },
    PROJECT_ATTACHMENT_TOKEN_ERROR: {
        code: 403,
        id: 208,
        name: 'PROJECT_ATTACHMENT_TOKEN_ERROR',
        message: '첨부 파일 token에 대한 오류'
    },
    LOG_UPDATE_TIME_IS_EXPIRED: {
        code: 403,
        id: 209,
        name: 'LOG_UPDATE_TIME_IS_EXPIRED',
        message: '10분이 경과한 코멘트는 수정 및 삭제가 불가능합니다.'
    },
    CLM_NOT_ALLOW_FINAL_REVIEW: {
        code: 403,
        id: 206,
        name: 'CLM_NOT_ALLOW_FINAL_REVIEW',
        message: '최종 결제 기능을 사용하고 있지 않습니다'
    },
    CLM_NOT_ALL_APPROVED: {
        code: 403,
        id: 207,
        name: 'CLM_NOT_ALL_APPROVED',
        message: '결재가 모두 완료되지 않았습니다.'
    },
    CLM_FILE_NOT_FOUND: {
        code: 403,
        id: 210,
        name: 'CLM_FILE_NOT_FOUND',
        message: '첨부된 계약서 파일이 없습니다.\n(데이터 이관으로 생성된 문서)'
    },
    TEAM_CANNOT_MODIFY_MASTER_ACTIVE: {
        code: 403,
        id: 211,
        name: 'TEAM_CANNOT_MODIFY_MASTER_ACTIVE',
        message: '팀 마스터 계정을 비활성화할 수 없습니다.'
    },
    TEAM_MEMBER_INACTIVATED: {
        code: 403,
        id: 212,
        name: 'TEAM_MEMBER_INACTIVATED',
        message: '계정이 비활성화 상태입니다.\n관리자에게 문의해 주세요.'
    },
    TEAM_MEMBER_LIMIT_EXCEEDED: {
        code: 403,
        id: 213,
        name: 'TEAM_MEMBER_LIMIT_EXCEEDED',
        message: '계약 인원수를 초과하였습니다.'
    },
    TEAM_MEMBER_CANNOT_ACCESS: {
        code: 401,
        id: 214,
        name: 'TEAM_MEMBER_CANNOT_ACCESS',
        message: '계정이 비활성화 상태입니다.'
    },
    EMAIL_SEND_FAILED: {
        code: 403,
        id: 215,
        name: 'EMAIL_SEND_FAILED',
        message: '이메일 전송에 실패하였습니다.'
    },
    NOT_FOUND_LOGIN_HISTORY: {
        code: 401,
        id: 216,
        name: 'NOT_FOUND_LOGIN_HISTORY',
        message: '잘못된 경로로 로그인이 시도되었습니다.'
    },
    EXPIRED_USER_SESSION: {
        code: 401,
        id: 217,
        name: 'EXPIRED_USER_SESSION',
        message: '유저의 로그인 만료일이 지났습니다.'
    },
    REMOTE_LOGOUT: {
        code: 401,
        id: 218,
        name: 'REMOTE_LOGOUT',
        message: '해당 계정은 원격으로 로그아웃 처리되었습니다.'
    },
    REMOTE_LOGOUT_SESSION_CONFLICT: {
        code: 401,
        id: 219,
        name: 'REMOTE_LOGOUT_SESSION_CONFLICT',
        message: '원격 로그 아웃 시키려는 기기가 현재 접속한 기기와 동일합니다.'
    },
    NOT_FOUND_EXCEL_BIND_KEY: {
        code: 403,
        id: 220,
        name: 'NOT_FOUND_EXCEL_BIND_KEY',
        message: '문서 대량 생성을 위한 설정 값을 찾을 수 없습니다.'
    },
    NOT_MATCH_WRITING_BULK_META_INFO_FILE: {
        code: 403,
        id: 221,
        name: 'NOT_MATCH_WRITING_BULK_META_INFO_FILE',
        message: '대량 생성 가능한 데이터 형식이 아닙니다.'
    },
    TEAM_FLEX_NOT_FOUND: {
        code: 403,
        id: 222,
        name: 'TEAM_FLEX_NOT_FOUND',
        message: 'Flex 연동 정보가 없습니다.'
    },
    TEAM_FLEX_TOKEN_CANNOT_FETCHED: {
        code: 403,
        id: 223,
        name: 'TEAM_FLEX_TOKEN_CANNOT_FETCHED',
        message: 'Flex 토큰 값을 가져오지 못했습니다.'
    },
    TEAM_FLEX_CATEGORIES_CANNOT_FETCHED: {
        code: 403,
        id: 224,
        name: 'TEAM_FLEX_CATEGORIES_CANNOT_FETCHED',
        message: 'Flex 카테고리(조직) 정보를 가져오지 못했습니다.'
    },
    TEAM_FLEX_ROLES_CANNOT_FETCHED: {
        code: 403,
        id: 225,
        name: 'TEAM_FLEX_CATEGORIES_CANNOT_FETCHED',
        message: 'Flex 직위/직책 정보를 가져오지 못했습니다.'
    },
    TEAM_FLEX_MEMBERS_CANNOT_FETCHED: {
        code: 403,
        id: 226,
        name: 'TEAM_FLEX_MEMBERS_CANNOT_FETCHED',
        message: 'Flex 멤버 정보를 가져오지 못했습니다.'
    },
    TEAM_FLEX_EMPLOYEE_NUMBER_CANNOT_FECTHED: {
        code: 403,
        id: 227,
        name: 'TEAM_FLEX_EMPLOYEE_NUMBER_CANNOT_FECTHED',
        message: 'Flex 사번 정보를 가져오지 못했습니다.'
    },
    TEAM_FLEX_UPSERT_FAILED: {
        code: 403,
        id: 228,
        name: 'TEAM_FLEX_UPSERT_FAILED',
        message: 'Flex와 로폼 비즈니스의 연동 정보를 생성하지 못했습니다.'
    },
    TEAM_FLEX_UPDATE_FAILED: {
        code: 403,
        id: 229,
        name: 'TEAM_FLEX_UPDATE_FAILED',
        message: 'Flex와 로폼 비즈니스의 연동 정보 수정에 실패했습니다.'
    },
    TEAM_FLEX_DELETE_FAILED: {
        code: 403,
        id: 230,
        name: 'TEAM_FLEX_DELETE_FAILED',
        message: 'Flex와 로폼 비즈니스의 연동 정보를 삭제하지 못했습니다.'
    },
    TEAM_FLEX_USER_BULK_CREATE_FAILED: {
        code: 403,
        id: 231,
        name: 'TEAM_FLEX_USER_BULK_CREATE_FAILED',
        message: 'Flex 연동 중 사용자 정보 추가에 실패하였습니다.'
    },
    TEAM_FLEX_USER_BULK_DELETE_FAILED: {
        code: 403,
        id: 232,
        name: 'TEAM_FLEX_USER_BULK_DELETE_FAILED',
        message: 'Flex 연동 중 사용자를 팀에서 삭제하는 데 실패하였습니다.'
    },
    TEAM_FLEX_SYNC_TEAM_MASTER_NOT_PROVIDED: {
        code: 403,
        id: 233,
        name: 'TEAM_FLEX_SYNC_TEAM_MASTER_NOT_PROVIDED',
        message: 'Flex 연동 시 팀 마스터 계정의 이메일을 제공하여야 합니다.'
    },
    TEAM_FLEX_SYNC_TEAM_MASTER_NOT_FOUND: {
        code: 403,
        id: 234,
        name: 'TEAM_FLEX_SYNC_TEAM_MASTER_NOT_FOUND',
        message: 'Flex 계정 정보 중, 제공된 팀 마스터의 이메일이 존재하지 않습니다.'
    },
    TEAM_MEMBER_CATEGORY_UPDATE_FAILED: {
        code: 403,
        id: 235,
        name: 'TEAM_MEMBER_CATEGORY_UPDATE_FAILED',
        message: '부서 정보 업데이트에 실패했습니다.'
    },
    TEAM_MEMBER_SUBCATEGORY_UPDATE_FAILED: {
        code: 403,
        id: 236,
        name: 'TEAM_MEMBER_SUBCATEGORY_UPDATE_FAILED',
        message: '팀 소카테고리 업데이트에 실패했습니다.'
    },
    USER_FAILED_UPDATE_TEAM_IS_ACTIVE: {
        code: 403,
        id: 237,
        name: 'USER_FAILED_UPDATE_TEAM_IS_ACTIVE',
        message: '팀 계정 활성화 여부 변경에 실패했습니다.'
    },
    USER_FLEX_CREATE_FAILED: {
        code: 403,
        id: 238,
        name: 'USER_FLEX_CREATE_FAILED',
        message: '사용자 Flex 연동 정보 생성에 실패했습니다.'
    },
    USER_FLEX_UPDATE_FAILED: {
        code: 403,
        id: 239,
        name: 'USER_FLEX_UPDATE_FAILED',
        message: '사용자 Flex 연동 정보 수정에 실패했습니다.'
    },
    USER_FLEX_FETCH_FAILED: {
        code: 403,
        id: 240,
        name: 'USER_FLEX_FETCH_FAILED',
        message: '사용자 Flex 연동 정보를 가져오는 데 실패했습니다.'
    },
    TEAM_FLEX_SYNC_LOG_CREATE_FAILED: {
        code: 403,
        id: 241,
        name: 'TEAM_FLEX_SYNC_LOG_CREATE_FAILED',
        message: 'Flex sync 로그를 생성하는 데 실패했습니다.'
    },
    TEAM_FLEX_SYNC_LOG_FETCH_FAILED: {
        code: 403,
        id: 242,
        name: 'TEAM_FLEX_SYNC_LOG_FETCH_FAILED',
        message: 'Flex sync 로그를 가져오는 데 실패했습니다.'
    },
    TEAM_FLEX_FULL_SYNC_NOT_PERFORMED: {
        code: 403,
        id: 243,
        name: 'TEAM_FLEX_FULL_SYNC_NOT_PERFORMED',
        message: '전체 동기화를 한 번 이상 실행하여야 부분 동기화를 실행할 수 있습니다.'
    },
    CLM_ALREADY_TERMINATING: {
        code: 403,
        id: 244,
        name: 'ALREADY_TERMINATING_CLM',
        message: '이미 해지 진행중 또는 해지된 계약 문서 입니다.'
    },
    CFS_FILE_COPY_FAILED: {
        code: 403,
        id: 245,
        name: 'CFS_FILE_COPY_FAILED',
        message: '파일 복사에 실패하였습니다.'
    },
    MESSEGE_ERROR: {
        code: 403,
        id: 246,
        name: 'MESSEGE_ERROR',
        message: 'messege에 잘못된 값이 있습니다.'
    },
    CLM_INVALID_LEGAL_REVIEW_APPROVAL: {
        code: 403,
        id: 247,
        name: 'CLM_INVALID_LEGAL_REVIEW_APPROVAL',
        message: '법무 검토 완료 승인이 유효하지 않습니다.'
    },
    CLM_INVALID_LEGAL_REVIEW_APPROVE_PERSON: {
        code: 403,
        id: 248,
        name: 'CLM_INVALID_LEGAL_REVIEW_APPROVE_PERSON',
        message: '법무 검토 완료 승인 담당자가 유효하지 않습니다.'
    },
    NOT_FOUND_RELATED_BLOG: {
        code: 403,
        id: 249,
        name: 'NOT_FOUND_RELATED_BLOG',
        message: '연관 블로그를 찾을 수 없습니다'
    },
    NOT_FOUND_BLOG: {
        code: 403,
        id: 250,
        name: 'NOT_FOUND_BLOG',
        message: '블로그를 찾을 수 없습니다'
    },
    OTP_NOT_ENABLED: {
        code: 403,
        id: 251,
        name: 'OTP_NOT_ENABLED',
        message: 'OTP가 활성화 되어 있지 않은 계정입니다.'
    },
    INVALID_OTP_CODE: {
        code: 403,
        id: 252,
        name: 'INVALID_OTP_CODE',
        message: '인증코드를 확인해 주세요.'
    },
    CONVERT_TO_PDF_HTML_FAILED: {
        code: 403,
        id: 253,
        name: 'CONVERT_TO_PDF_HTML_FAILED',
        message: '문서를 pdf, html로 변환하는 작업에 실패했습니다.'
    },
    EXTENSION_NOT_ALLOWED: {
        code: 403,
        id: 254,
        name: 'EXTENSION_NOT_ALLOWED',
        message: '허용되지 않은 확장자입니다.'
    },
    CLM_LEGAL_REVIEW_APPROVE_CANCEL: {
        code: 403,
        id: 257,
        name: 'CLM_LEGAL_REVIEW_APPROVE_CANCEL',
        message: '법무 검토 완료 승인 요청이 취소되어 승인할 수 없습니다.'
    },
    CLM_LEGAL_REVIEW_REJECT_CANCEL: {
        code: 403,
        id: 258,
        name: 'CLM_LEGAL_REVIEW_APPROVE_CANCEL',
        message: '법무 검토 완료 승인 요청이 취소되어 반려할 수 없습니다.'
    },
    CLM_LEGAL_REVIEW_INVALID_REQUEST: {
        code: 403,
        id: 259,
        name: 'CLM_LEGAL_REVIEW_APPROVE_CANCEL',
        message: '유효하지 않은 법무 검토 완료 승인 요청입니다.'
    },
    CLM_INVALID_LEGAL_REVIEW_APPROVE_REQUEST: {
        code: 403,
        id: 260,
        name: 'CLM_INVALID_LEGAL_REVIEW_APPROVE',
        message: '유효하지 않은 법무 검토 완료 승인 요청입니다.'
    },
    CLM_NOT_ALLOW_EDIT_REFERRER_USER: {
        code: 403,
        id: 261,
        name: 'CLM_NOT_ALLOW_EDIT_REFERRER_USER',
        message: '참조 수신자를 변경할 수 있는 권한이 존재하지 않습니다.'
    },
    CLM_CFS_FILE_IS_NOT_ALLOW_EXTENSION: {
        code: 403,
        id: 262,
        name: 'CLM_CFS_FILE_IS_NOT_ALLOW_EXTENSION',
        message: '유효하지 않은 다운로드 확장자입니다.'
    },
    PURCHASE_ALREADY_EXSIST: {
        code: 403,
        id: 263,
        name: 'PURCHASE_ALREADY_EXSIST',
        message: '이미 처리된 결제 입니다.'
    },
    CLM_NO_PERMISSION_DISABLE_EDITOR_USED: {
        code: 403,
        id: 264,
        name: 'CLM_NO_PERMISSION_DISABLE_EDITOR_USED',
        message: '해당 계약서를 편집기 사용 안 함으로 전환할 권한이 없습니다.'
    },
    CLM_CANNOT_DISABLE_EDITOR_USED: {
        code: 403,
        id: 265,
        name: 'CLM_CANNOT_DISABLE_EDITOR_USED',
        message: '해당 계약서는 편집기 사용 안 함으로 전환할 수 없습니다.'
    },
    CLM_CFS_NEEDED_FOR_REQUEST: {
        code: 403,
        id: 266,
        name: 'CLM_CFS_NEEDED_FOR_REQUEST',
        message: '계약 검토 요청을 진행하기 위해 계약서 등록이 필요합니다.'
    },
    USER_LAW_INFORMATION_LIST_CANNOT_FETCHED: {
        code: 403,
        id: 267,
        name: 'USER_LAW_INFORMATION_LIST_CANNOT_FETCHED',
        message: '사용자 관심 법령 리스트를 가져오지 못했습니다.'
    },
    USER_LAW_INFORMATION_NOTIFICATION_NOT_FOUND: {
        code: 403,
        id: 268,
        name: 'USER_LAW_INFORMATION_NOTIFICATION_NOT_FOUND',
        message: '사용자 관심법령 공포일/시행일 알림 정보가 없습니다.'
    },
    USER_LAW_INFORMATION_NOTIFICATION_CANNOT_FETCHED: {
        code: 403,
        id: 269,
        name: 'USER_LAW_INFORMATION_NOTIFICATION_CANNOT_FETCHED',
        message: '사용자 관심법령 공포일/시행일 알림 정보를 가져오지 못했습니다.'
    },
    USER_LAW_INFORMATION_NOTIFICATION_CREATE_FAILED: {
        code: 403,
        id: 270,
        name: 'USER_LAW_INFORMATION_NOTIFICATION_CREATE_FAILED',
        message: '사용자 관심법령 공포일/시행일 알림 정보를 생성하지 못했습니다.'
    },
    USER_LAW_INFORMATION_NOTIFICATION_UPDATE_FAILED: {
        code: 403,
        id: 271,
        name: 'USER_LAW_INFORMATION_NOTIFICATION_UPDATE_FAILED',
        message: '사용자 관심법령 공포일/시행일 알림 정보를 업데이트하지 못했습니다.'
    },
    /* 일반 에러(1 ~) 끝 */

    /* 법률 자문 관련 에러(2000 ~) */
    ADVICE_ID_EMPTY: {
        code: 400,
        id: 2000,
        name: 'ADVICE_ID_EMPTY',
        message: '법률 자문 고유키를 입력해주세요.'
    },
    ADVICE_ATTACHMENT_TOKEN_ERROR: {
        code: 403,
        id: 2001,
        name: 'ADVICE_ATTACHMENT_TOKEN_ERROR',
        message: '첨부 파일 token에 대한 오류'
    },
    ADVICE_ATTACHMENT_NOT_FOUND: {
        code: 403,
        id: 2002,
        name: 'ADVICE_ATTACHMENT_NOT_FOUND',
        message: '첨부 파일을 찾을 수 없습니다.'
    },
    ADVICE_MISSING_FILE_ID: {
        code: 403,
        id: 2003,
        name: 'ADVICE_MISSING_FILE_ID',
        message: 'advice_id로 파일을 찾을 수 없습니다.'
    },
    ADVICE_ATTACHMENT_NO_ACCESS: {
        code: 403,
        id: 2004,
        name: 'ADVICE_ATTACHMENT_NO_ACCESS',
        message: '첨부 파일에 대한 접근 권한이 없습니다.'
    },
    ADVICE_INVALID_PROGRESS: {
        code: 403,
        id: 2005,
        name: 'ADVICE_INVALID_PROGRESS',
        message: '이미 지난 단계에서 작업하고 있습니다. 새로고침 해주세요.'
    },
    ADVICE_INVALID_APPROVAL_USER: {
        code: 403,
        id: 2006,
        name: 'ADVICE_INVALID_APPROVAL_USER',
        message: '유효하지 않은 결재자입니다.'
    },
    ADVICE_ONLY_DRAFT_STATUS: {
        code: 403,
        id: 2007,
        name: 'ADVICE_ONLY_DRAFT_STATUS',
        message: '자문 요청을 할 수 없는 상태입니다.'
    },
    ADVICE_ONLY_REQUESTER_STATUS: {
        code: 403,
        id: 2008,
        name: 'ADVICE_ONLY_REQUESTER_STATUS',
        message: '법률 자문 담당자에게 자문 요청을 할 수 없는 상태입니다.'
    },
    ADVICE_ONLY_AFTER_REVIEW_REQUEST_STATUS: {
        code: 403,
        id: 2009,
        name: 'ADVICE_ONLY_AFTER_REVIEW_REQUEST_STATUS',
        message: '중단을 요청 할 수 없는 상태입니다.'
    },
    ADVICE_COMPLETE_ONLY_REQUESTER_STATUS: {
        code: 403,
        id: 2010,
        name: 'ADVICE_COMPLETE_ONLY_REQUESTER_STATUS',
        message: '법률 자문을 완료할 수 없는 상태입니다.'
    },
    ADVICE_ONLY_REVIEW_REQUEST_STATUS: {
        code: 403,
        id: 2011,
        name: 'ADVICE_ONLY_REVIEW_REQUEST_STATUS',
        message: '취소를 할 수 없는 상태입니다.'
    },
    ADVICE_ONLY_LEGAL_REVIEW_STATUS: {
        code: 403,
        id: 2012,
        name: 'ADVICE_ONLY_LEGAL_REVIEW_STATUS',
        message: '요청자에게 요청할 수 없는 상태입니다.'
    },
    ADVICE_ONLY_ASSIGN_OR_CHANGE_REVIEW_STATUS: {
        code: 403,
        id: 2013,
        name: 'ADVICE_ONLY_ASSIGN_OR_CHANGE_REVIEW_STATUS',
        message: '법률 자문 담당자를 변경할 수 없는 상태입니다.'
    },
    ADVICE_HAS_DENIED_BEFORE_CURRENT_APPROVAL_USER: {
        code: 403,
        id: 2014,
        name: 'ADVICE_HAS_DENIED_BEFORE_CURRENT_APPROVAL_USER',
        message: '이전 결재자가 반려하였습니다.'
    },
    ADVICE_COMPLETE_PERMISSION_DENIED: {
        code: 403,
        id: 2016,
        name: 'ADVICE_COMPLETE_PERMISSION_DENIED',
        message: '법률 자문을 완료할 권한이 없습니다.'
    },
    ADVICE_NO_PERMISSION_DISABLE_EDITOR_USED: {
        code: 403,
        id: 2017,
        name: 'ADVICE_NO_PERMISSION_DISABLE_EDITOR_USED',
        message: '해당 계약서를 편집기 사용 안 함으로 전환할 권한이 없습니다.'
    },
    ADVICE_CANNOT_DISABLE_EDITOR_USED: {
        code: 403,
        id: 2018,
        name: 'ADVICE_CANNOT_DISABLE_EDITOR_USED',
        message: '해당 법률 자문은 편집기 사용 안 함으로 전환할 수 없습니다.'
    },
    /* 법률 자문 관련 에러(2000 ~) 끝 */

    /* 송무 관련 에러(6000 ~) */
    LITIGATION_NOT_ALLOW_ERROR: {
        code: 403,
        id: 6000,
        name: 'LITIGATION_NOT_ALLOW_ERROR',
        message: '해당 사건에 권한이 없습니다.'
    },
    LITIGATION_NOT_DRAFT: {
        code: 403,
        id: 6001,
        name: 'LITIGATION_NOT_DRAFT',
        message: '해당 송무 상태가 임시 저장 상태가 아닙니다.'
    },
    LITIGATION_ID_EMPTY: {
        code: 403,
        id: 6002,
        name: 'LITIGATION_ID_EMPTY',
        message: '해당 송무 id가 존재하지 않습니다.'
    },
    LITIGATION_ATTACHMENT_NOT_FOUND: {
        code: 403,
        id: 6003,
        name: 'LITIGATION_ATTACHMENT_NOT_FOUND',
        message: '해당 첨부파일이 존재하지 않습니다.'
    },
    LITIGATION_ATTACHMENT_TOKEN_ERROR: {
        code: 403,
        id: 6004,
        name: 'LITIGATION_ATTACHMENT_TOKEN_ERROR',
        message: '다운로드 토큰이 유효하지 않습니다.'
    },
    LITIGATION_INVALID_ASSIGN_OR_CHANGE: {
        code: 403,
        id: 6005,
        name: 'LITIGATION_INVALID_ASSIGN_OR_CHANGE',
        message: '법무 담당자를 설정할 수 없는 상태입니다.'
    },
    LITIGATION_INVALID_PAUSE: {
        code: 403,
        id: 6005,
        name: 'LITIGATION_INVALID_PAUSE',
        message: '중단할 수 없는 상태입니다.'
    },
    LITIGATION_INVALID_COMPLETE: {
        code: 403,
        id: 6006,
        name: 'LITIGATION_INVALID_COMPLETE',
        message: '종결할 수 없는 상태입니다.'
    },
    LITIGATION_NOT_FOUND: {
        code: 403,
        id: 6007,
        name: 'LITIGATION_NOT_FOUND',
        message: '조회할 수 없는 송무입니다.'
    },
    LITIGATION_SCHEDULE_NOT_FOUND: {
        code: 403,
        id: 6008,
        name: 'LITIGATION_SCHEDULE_NOT_FOUND',
        message: '조회할 수 없는 송무 일정입니다.'
    },
    LITIGATION_SCHEDULE_LOG_NOT_FOUND: {
        code: 403,
        id: 6009,
        name: 'LITIGATION_SCHEDULE_LOG_NOT_FOUND',
        message: '조회할 수 없는 송무 일정 코멘트입니다.'
    },
    LITIGATION_ATTACHMENT_NO_ACCESS: {
        code: 403,
        id: 6010,
        name: 'LITIGATION_ATTACHMENT_NO_ACCESS',
        message: '첨부파일에 접근할 수 없습니다.'
    },
    LITIGATION_LOG_NOT_FOUND: {
        code: 403,
        id: 6011,
        name: 'LITIGATION_LOG_NOT_FOUND',
        message: '코멘트에 존재하지 않습니다.'
    },
    LITIGATION_SCRAP_ERROR: {
        code: 403,
        id: 6012,
        name: 'LITIGATION_SCRAP_ERROR',
        message: '대법원 스크래핑 과정에서 오류가 발생하였습니다.'
    },
    LITIGATION_INVALID_CASE_CODE: {
        code: 403,
        id: 6013,
        name: 'LITIGATION_INVALID_CASE_CODE',
        message: '대법원 사건번호 형식이 유효하지 않습니다.'
    },
    LITIGATION_SCRAP_NOT_EXIST_CASE: {
        code: 403,
        id: 6014,
        name: 'LITIGATION_SCRAP_NOT_EXIST_CASE',
        message: '존재하지 않는 사건입니다.'
    },
    /* 송무 관련 에러(6000 ~) 끝 */

    TEAM_WATERMARK_ACCESS_NOT_ALLOWED: {
        code: 403,
        id: 2030,
        name: 'TEAM_WATERMARK_ACCESS_NOT_ALLOWED',
        message: '해당 팀 워터마크에 대한 접근 권한이 없습니다'
    },
    /* ***************************************************
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * |||||||||||||||||||||||||||||||||||||||||||||||||||
     *
     * 신규 오류 코드는 여기 위에서 이어서 작성 해주세요
     *
     * ***************************************************/

    AI_PROCESSING_ERROR: {
        code: 403,
        id: 99994,
        name: 'aiProcessingError',
        message: 'AI 분석이 실패하였습니다.'
    },
    CFS_FILE_HTML_NOT_FOUND_ERROR: {
        code: 403,
        id: 99995,
        name: 'htmlNotFoundError',
        message: '분석할 문서 정보를 찾지 못했습니다.'
    },

    SERIALIZER_INVALID_OBJ: {
        code: 403,
        id: 99996,
        name: 'serializerInvalidObject',
        message: 'serializer에 유효하지 않은 객체가 넘어 왔음'
    },
    SERIALIZER_NULL_OBJ: {
        code: 403,
        id: 99997,
        name: 'serializerNullObject',
        message: 'serializer에 null 객체가 넘어 왔음'
    },
    DB_NOT_FOUND: {
        code: 403,
        id: 99998,
        name: 'dbNotFound',
        message: 'DB에서 찾을 수 없는 record'
    },
    ETC_ERROR: {
        code: 403,
        id: 99999,
        name: 'etcError',
        message: '기타 서버 오류'
    }
};

// class LFException {
//     constructor(status) {
//         this.status = status
//         this.name = status.name

//         let err = {}
//         Error.captureStackTrace(err)
//         this.stack = err.stack
//     }

//     getResult() {
//         return {
//             code: 402 /* LOGIC_FAILED 공유 번호 */,
//             error_id: this.status.id,
//             message: this.status.message,
//         }
//     }
// }

export default CF_ERROR_STATUS;
