import type { Request, Response } from "express";
import { createHash } from "crypto";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";

type CrawlResult = {
    sha256: string;
    title?: string;
};

function sha256(text: string) {
    return createHash("sha256").update(text, "utf8").digest("hex");
}

/** 공통 정규화 */
function normalizeText(raw: string) {
    return (
        raw
            // zero-width / 특수 공백 제거
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            // 줄바꿈/탭 -> 공백
            .replace(/[\r\n\t]+/g, " ")
            // 연속 공백 -> 1칸
            .replace(/\s{2,}/g, " ")
            // 글머리 기호 통일(원하면)
            .replace(/[•·]/g, "-")
            // 숫자 천단위 콤마 제거(원하면)
            .replace(/(\d),(?=\d{3}\b)/g, "$1")
            .trim()
    );
}

/** LG(계정 약관) 쪽에서 흔한 부가 링크/메뉴 텍스트 제거 */
function lgeNoiseFilter(text: string) {
    const lines = text
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean);

    const blacklist = [
        "본문",
        "바로가기",
        "알기",
        "쉬운",
        "개인정보",
        "처리방침",
        "동영상",
        "인포그래픽",
        "주요",
        "개정",
        "내용"
    ];

    // 너무 공격적으로 지우면 본문 훼손될 수 있어서:
    // "정확히 일치하는 문구" 위주로 제거(권장)
    const exactPhrases = [
        "본문 바로가기",
        "알기 쉬운 개인정보 처리방침",
        "동영상 개인정보 처리방침",
        "개인정보 처리방침 인포그래픽",
        "주요 개정 내용"
    ];

    let joined = lines.join(" ");
    for (const p of exactPhrases) {
        // 공백 정규화된 상태에서 제거
        joined = joined.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), " ");
    }

    // 제거 후 다시 공백 정리
    return joined.replace(/\s{2,}/g, " ").trim();
}

type Best = {
    el: cheerio.Cheerio<Element>;
    score: number;
};

function pickMainContainer($: cheerio.CheerioAPI) {
    // 2) terms/privacy 같은 키워드가 class/id에 있는 큰 블록 우선
    const keyword = /(terms|term|privacy|policy|detail|content|container)/i;
    let best: Best | null = null;

    $("div, section").each((_, node) => {
        const el = $(node);
        const attr = `${el.attr("id") ?? ""} ${el.attr("class") ?? ""}`;
        const textLen = el.text().replace(/\s+/g, " ").trim().length;
        const score = textLen + (keyword.test(attr) ? 5000 : 0);
        if (!best || score > best.score) best = { el, score };
    });

    if (best) return (best as Best).el;

    return $("body");
}

export async function crawlAndHash(url: string): Promise<CrawlResult> {
    const res = await fetch(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
            "accept-language": "ko-KR,ko;q=0.9,en;q=0.7"
        }
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1) 명백한 노이즈 제거
    $("script, style, noscript, iframe").remove();

    // 헤더/푸터/네비게이션은 페이지마다 다르니 범용으로 약하게 제거
    $("header, footer, nav").remove();

    // 2) 본문 컨테이너 선택
    const main = pickMainContainer($);

    // 3) 텍스트 추출
    const rawText = main.text();

    // 4) 정규화
    const normalized = normalizeText(rawText);
    const hash = sha256(normalized);

    // title은 optional (표시용)
    const title = $("title").first().text().trim() || undefined;

    return {
        sha256: hash,
        title
    };
}

export const effectiveDate = async () => {
    // const url = `https://account.lge.co.kr/terms/emp/detailView?tmsId=A_ITG_PRV_GDPR`;
    const url = `https://www.samsung.com/sec/info/privacy/01/rc/`;
    const r = await crawlAndHash(url);

    return r;
};
