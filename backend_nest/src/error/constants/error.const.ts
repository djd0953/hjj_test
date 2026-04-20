export const API_ERROR_CODE =
{
    /**
     * [4xx - Client Error]
     * 400 Bad Request
     *  - 요청 형식 오류 (필수값 누락, 타입 오류, JSON 파싱 실패 등)
     */
    INVALID_JSON:
    {
        status: 400,
        title:
        {
            'ko-KR': '파싱 오류',
            en: 'Parse Error',
            ja: 'パースエラー'
        },
        message:
        {
            'ko-KR': 'JSON 파싱에 실패했습니다.',
            en: 'Failed to parse JSON.',
            ja: 'JSONのパースに失敗しました。'
        }
    },

    MISSING_REQUIRED_FIELD:
    {
        status: 400,
        title:
        {
            'ko-KR': '요청 오류',
            en: 'Request Error',
            ja: 'リクエストエラー'
        },
        message:
        {
            'ko-KR': '필수값이 누락되었습니다.',
            en: 'A required field is missing.',
            ja: '必須項目が不足しています。'
        }
    },

    /**
     * 401 Unauthorized
     *  - 인증 실패 (토큰 없음, 토큰 만료, 유효하지 않은 토큰)
     */ 
    /**
     * 403 Forbidden
     *  - 권한 없음 (인증은 되었지만 접근 권한 부족)
     */
    /**
     * 404 Not Found
     *  - 리소스를 찾을 수 없음 (존재하지 않는 데이터)
     */
    NOT_SET_S3_PATH: 
    {
        status: 404,
        title: 
        {
            'ko-KR': '파일 없음',
            en: 'File Not Found',
            ja: 'ファイルが見つかりません'
        },
        message: 
        {
            'ko-KR': '해당 파일을 찾을 수 없습니다.',
            en: 'The requested file could not be found.',
            ja: '該当ファイルが見つかりません。'
        }
    },

    /**
     * 409 Conflict
     *  - 리소스 충돌 (중복 데이터, 상태 충돌)
     */
    /**
     * 422 Unprocessable Entity
     *  - 요청 형식은 정상이나 비즈니스 규칙 위반
     *    (예: 이메일 형식은 맞지만 이미 사용 중인 경우 등)
     */

    INVALID_EMAIL:
    {
        status: 422,
        title:
        {
            'ko-KR': '입력 오류',
            en: 'Invalid Input',
            ja: '入力エラー'
        },
        message:
        {
            'ko-KR': '이메일을 확인해주세요.',
            en: 'Please check your email address.',
            ja: 'メールアドレスをご確認ください。'
        }
    },

    /**
     * 429 Too Many Requests
     *  - 요청 제한 초과 (rate limit)
     */

    /**
    * [5xx - Server Error]
    * 500 Internal Server Error
    *  - 서버 내부 오류 (예상하지 못한 에러)
    */

    NOT_AWS_PERMISSION: 
    {
        status: 500,
        title: 
        {
            'ko-KR': '권한 오류',
            en: 'Permission Error',
            ja: '権限エラー'
        },
        message: 
        {
            'ko-KR': '알 수 없는 오류가 발생했습니다.',
            en: 'An unknown error occurred.',
            ja: '不明なエラーが発生しました。'
        }
    },

    NOT_SET_ENVIRONMENT:
    {
        status: 500,
        title:
        {
            'ko-KR': '설정 오류',
            en: 'Configuration Error',
            ja: '設定エラー'
        },
        message:
        {
            'ko-KR': '알 수 없는 오류가 발생했습니다.',
            en: 'An unknown error occurred.',
            ja: '不明なエラーが発生しました。'
        }
    }

    /**
    * 502 Bad Gateway
    *  - 외부 서비스 호출 실패 (API Gateway, OpenSearch, 외부 API 등)
    *
    * 503 Service Unavailable
    *  - 서비스 일시적 불가 (서버 다운, 점검, 과부하 등)
    *
    * 504 Gateway Timeout
    *  - 외부 서비스 응답 지연 (timeout)
    */
} as const;
