"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tPath = exports.sInfo = void 0;
exports.sInfo = {
    count: 3,
    rows: [
        {
            id: 1,
            from: "보낸사람: ",
            to: "To:",
            subject: "Subject: ",
            date: "Date: ",
            separator: "---------- Forwarded message ---------",
            site: "google"
        },
        {
            id: 2,
            from: "> 보낸사람: ",
            to: "> 받는사람: ",
            cc: "> 참조: ",
            subject: "> 제목: ",
            date: "> 날짜: ",
            separator: "-----Original Message-----",
            site: "naver"
        },
        {
            id: 2,
            from: "> 보낸사람: ",
            to: "> 받는사람: ",
            cc: "> 참조: ",
            subject: "> 제목: ",
            date: "> 날짜: ",
            from: "*From:* ",
            separator: "-----Original Message-----",
            site: "kakao"
        },
    ]
};
const ms = {
    a: "lawform",
    g: "google",
    n: "naver",
    k: "kakao"
};
exports.tPath = [
    {
        key: null,
        messageId: null,
        references: [],
        from: ms.a,
        to: [ms.g],
        cc: []
    },
    {
        key: "clm/email/av3vqv2p6ml3lu6957q35nlmvkebe5gu2oe87f81",
        messageId: "<CAAsHJtbbRKWJxFK9xKZ72XHEDJZJ4jxgm+HohuEouWnu5qjCSw@mail.gmail.com>",
        references: "<010c01972ec1192b-90ec635a-012f-4392-af55-589c4dd7d595-000000@ap-northeast-2.amazonses.com>",
        from: ms.g,
        to: [ms.n, ms.k],
        cc: [ms.a],
        text: `첫번째 메일 회신 테스트


---------- Forwarded message ---------
보낸사람: [로폼 비즈니스] <alert@clm.lawform.io>
Date: 2025년 6월 2일 (월) 오후 12:48
Subject: [결재 대기] 이메일 회신 테스트
To: <hjj0106+10@amicuslex.net>


[결재 대기]
이메일 회신 테스트
나의 결재 필요한 검토 요청이 등록되었습니다.
이메일 회신 테스트
하단 버튼을 클릭하여 확인해 주세요.
계약명
이메일 회신 테스트
요청자
김유정
요청일
2025-06-02 12:47:43
확인하기 <https://alpha.business.lfdev.io/clm/126301>
이용약관 <https://lawform.io/term-of-use>|개인정보처리방침
<https://lawform.io/privacy-policy>
© 2024 Amicus Lex Inc. all rights reserved.
`
    },
    {
        key: "clm/email/s94r4jd5b64jj04f8vjn6n1as81qg2848hds9ug1",
        messageId: "<20250602125354.yjyVZNkLTEez-pR8yqf-rw@hjj0106.kakao.com>",
        references: [],
        from: ms.k,
        to: [ms.n, ms.g],
        cc: [ms.a],
        text: `두번째 메일 회신 테스트







--------- 원본 메일 ---------


> 보낸사람: 조현진 <hjj0106@amicuslex.net>
> 받는사람: skyzzang0106@naver.com,hjj0106@kakao.com
> 참조: [로폼 비즈니스] <alert@clm.lawform.io>
> 날짜: 25.06.02 12:50 GMT +0900
> 제목: Fwd: [결재 대기] 이메일 회신 테스트
> 
> 
> 
> 
> 
> 첫번째 메일 회신 테스트
> 
> 
> 
> ---------- Forwarded message ---------
> 보낸사람: [로폼 비즈니스] <alert@clm.lawform.io [alert@clm.lawform.io]>
> Date: 2025년 6월 2일 (월) 오후 12:48
> Subject: [결재 대기] 이메일 회신 테스트
> To: <hjj0106+10@amicuslex.net [hjj0106%2B10@amicuslex.net]>
> 
> 
> 
> [https://cdn.lawform.io/email/lawform_business_icon.png]
> [결재 대기]
> 이메일 회신 테스트
> 나의 결재 필요한 검토 요청이 등록되었습니다.
> 이메일 회신 테스트
> 하단 버튼을 클릭하여 확인해 주세요.
> 계약명
> 이메일 회신 테스트
> 요청자
> 김유정
> 요청일
> 2025-06-02 12:47:43
> 확인하기[https://cdn.lawform.io/email/arrow_right_blue_1.png]
> [https://alpha.business.lfdev.io/clm/126301]
> 
> [https://cdn.lawform.io/email/lawform_business_gray_logo.png]
> 이용약관 [https://lawform.io/term-of-use]|개인정보처리방침
> [https://lawform.io/privacy-policy]
> © 2024 Amicus Lex Inc. all rights reserved.
> [https://qa.api.lawform.io/api/email_queue/open/116/655996/1/logo.png]


`
    },
    {
        key: null,
        messageId: null,
        references: [],
        from: ms.n,
        to: [ms.g],
        cc: []
    },
    {
        key: "clm/email/l35eugjfgo46t43thbe9eufi4706nim9dm80uc81",
        messageId: "<CAAsHJtbtTg93f6nrR15b6sY2D=CCsrTDwEW64xw0TbdgeaKRHQ@mail.gmail.com>",
        references: [
            "<20250602125354.yjyVZNkLTEez-pR8yqf-rw@hjj0106.kakao.com>",
            "<9d738eeaa1aed0cfc0cb379058562@cweb012.nm>",
        ],
        from: ms.g,
        to: [ms.n],
        cc: [ms.a],
        text: `네번째 메일 회신 테스트

        <hjj0106@kakao.com>
        위 메일 주소 입니다.

---------- Forwarded message ---------
보낸사람: 조현진 <skyzzang0106@naver.com>
Date: 2025년 6월 2일 (월) 오후 12:55
Subject: FW: Fwd: [결재 대기] 이메일 회신 테스트
To: <hjj0106@amicuslex.net>, <hjj0106@kakao.com>


세번째 메일 회신 테스트

블로그서명
[image: 블로그] <http://blog.naver.com/skyzzang0106> Code Base
<http://blog.naver.com/skyzzang0106>
<http://blog.naver.com/skyzzang0106>

-----Original Message-----
*From:* "조현진"<hjj0106@kakao.com>
*To:* "hjj0106"<hjj0106@amicuslex.net>; "skyzzang0106"<
skyzzang0106@naver.com>;
*Cc:* "alert"<alert@clm.lawform.io>;
*Sent:* 2025-06-02 (월) 12:53:54 (GMT+09:00)
*Subject:* FW: Fwd: [결재 대기] 이메일 회신 테스트

두번째 메일 회신 테스트



--------- 원본 메일 ---------

*보낸사람*: 조현진 <hjj0106@amicuslex.net>
*받는사람*: skyzzang0106@naver.com,hjj0106@kakao.com
*참조*: [로폼 비즈니스] <alert@clm.lawform.io>
*날짜*: 25.06.02 12:50 GMT +0900
*제목*: Fwd: [결재 대기] 이메일 회신 테스트


첫번째 메일 회신 테스트


---------- Forwarded message ---------
보낸사람: *[로폼 비즈니스]* <alert@clm.lawform.io>
Date: 2025년 6월 2일 (월) 오후 12:48
Subject: [결재 대기] 이메일 회신 테스트
To: <hjj0106+10@amicuslex.net>


[결재 대기]
이메일 회신 테스트
나의 결재 필요한 검토 요청이 등록되었습니다.
이메일 회신 테스트
하단 버튼을 클릭하여 확인해 주세요.
계약명
이메일 회신 테스트
요청자
김유정
요청일
2025-06-02 12:47:43
확인하기 <https://alpha.business.lfdev.io/clm/126301>
이용약관 <https://lawform.io/term-of-use>|개인정보처리방침
<https://lawform.io/privacy-policy>
© 2024 Amicus Lex Inc. all rights reserved.
`
    }
];
