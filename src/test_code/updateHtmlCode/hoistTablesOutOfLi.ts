import { JSDOM } from 'jsdom';

export async function hoistTablesOutOfLi(html: string): Promise<string> 
{
    const dom = new JSDOM();
    const document = dom.window.document;

    const wrap = document.createElement('div');
    wrap.innerHTML = html;

    // 테이블을 "직속"으로 가진 li만, 가장 안쪽부터(같은 깊이는 뒤→앞) 처리
    const allLis: HTMLLIElement[] = Array.from(wrap.querySelectorAll('li'))
        .filter((li) =>
            Array.from(li.querySelectorAll('table')).some((t) => t.closest('li') === li)
        )
        .sort((a, b) => 
        {
            const da = liDepth(a),
                db = liDepth(b);
            if (db !== da) return db - da;
            const pos = a.compareDocumentPosition(b);
            if (pos & 4) return 1;
            if (pos & 2) return -1;
            return 0;
        });

    for (const li of allLis) 
    {
        const listEl = li.parentElement as HTMLOListElement | HTMLUListElement | null;
        if (!listEl || !/^(ul|ol)$/i.test(listEl.tagName)) continue;
        const listTag = listEl.tagName.toLowerCase();

        // 현재 li의 "직속" table만
        const tables = Array.from(li.querySelectorAll('table')).filter(
            (t) => t.closest('li') === li
        );
        if (tables.length === 0) continue;

        // 1) li 내용을 테이블 경계로 분해 → 텍스트는 모두 li 안으로 재조립(= 위로 올리기)
        const preFrag = fragBefore(li, tables[0]);
        const betweenFrags: DocumentFragment[] = [];
        for (let i = 0; i < tables.length - 1; i++) 
        {
            betweenFrags.push(fragBetween(li, tables[i], tables[i + 1]));
        }
        const postFrag = fragAfter(li, tables[tables.length - 1]);

        li.innerHTML = '';
        appendIfMeaningful(li, preFrag);
        for (const frag of betweenFrags) appendIfMeaningful(li, frag);
        appendIfMeaningful(li, postFrag);

        // 2) 표 블록(원본 이동)
        const tableBlock = document.createElement('div');
        tableBlock.className = 'list-table-block';
        for (const t of tables) 
        {
            // t.setAttribute('style', 'width: 20cm;')
            tableBlock.appendChild(t);
        } // move

        // 3) 현재 li 이후 형제 li들을 tail로 떼어 새 리스트로 이어갈 준비
        const tailLis: HTMLLIElement[] = [];
        {
            let p = li.nextElementSibling;
            while (p && p.tagName.toLowerCase() === 'li') 
            {
                const next = p.nextElementSibling;
                tailLis.push(p as HTMLLIElement);
                p.remove();
                p = next;
            }
        }

        // ─────────────────────────────────────────────────────────────
        // 케이스 A: 최상위 리스트(부모가 li가 아님) → listEl을 둘로 나누고 표를 사이에
        // ─────────────────────────────────────────────────────────────
        if (listEl.parentElement && listEl.parentElement.tagName.toLowerCase() !== 'li') 
        {
            // 표 배치: listEl 바로 뒤 (li 밖)
            listEl.parentElement.insertBefore(tableBlock, listEl.nextSibling);

            // tail이 있으면 listEl과 같은 태그의 새 리스트로 재시작
            if (tailLis.length > 0) 
            {
                const newList = document.createElement(listTag) as
                    | HTMLOListElement
                    | HTMLUListElement;
                carryListAttrs(listEl, newList);

                if (listTag === 'ol') 
                {
                    const startAttr = parseInt(
                        (listEl as HTMLOListElement).getAttribute('start') || '1',
                        10
                    );
                    const prevIndex = indexAmongLis(li, listEl); // 변형 전 기준
                    const resumeStart = startAttr + prevIndex + 1 // 현재 li는 소비됨
                    ;(newList as HTMLOListElement).setAttribute('start', String(resumeStart));
                }

                tailLis.forEach((tli) => newList.appendChild(tli));
                // 표 바로 뒤에 새 리스트
                tableBlock.parentElement?.insertBefore(newList, tableBlock.nextSibling);
            }
            continue;
        }

        // ─────────────────────────────────────────────────────────────
        // 케이스 B: 중첩(부모가 li) → 바깥 리스트를 둘로 나누고, 그 사이에 표(+내부 tail) 배치
        // 구조: outerList > outerLi(… listEl …)
        // ─────────────────────────────────────────────────────────────
        const outerLi = listEl.parentElement as HTMLLIElement;
        const outerList = outerLi?.parentElement as HTMLOListElement | HTMLUListElement | null;
        if (!outerLi || !outerList || !/^(ul|ol)$/i.test(outerList.tagName)) 
        {
            // 방어: 비정형이면 그냥 outerLi 바로 뒤(여전히 li 밖)로
            outerLi.parentElement?.insertBefore(tableBlock, outerLi.nextSibling);
            if (tailLis.length) 
            {
                const newList = document.createElement(listTag) as
                    | HTMLOListElement
                    | HTMLUListElement;
                carryListAttrs(listEl, newList);
                if (listTag === 'ol') 
                {
                    const startAttr = parseInt(
                        (listEl as HTMLOListElement).getAttribute('start') || '1',
                        10
                    );
                    const prevIndex = indexAmongLis(li, listEl);
                    const resumeStart = startAttr + prevIndex + 1
                    ;(newList as HTMLOListElement).setAttribute('start', String(resumeStart));
                }
                tailLis.forEach((tli) => newList.appendChild(tli));
                tableBlock.parentElement?.insertBefore(newList, tableBlock.nextSibling);
            }
            continue;
        }

        // 바깥 리스트를 분할: outerLi까지는 그대로 outerList에 남기고,
        // 그 뒤 형제 li들은 newOuterList로 이동
        const newOuterList = document.createElement(outerList.tagName.toLowerCase()) as
            | HTMLOListElement
            | HTMLUListElement;
        carryListAttrs(outerList, newOuterList);

        if (outerList.tagName.toLowerCase() === 'ol') 
        {
            const startAttrOuter = parseInt(
                (outerList as HTMLOListElement).getAttribute('start') || '1',
                10
            );
            const prevIndexOuter = indexAmongLis(outerLi, outerList);
            const resumeStartOuter = startAttrOuter + prevIndexOuter + 1
            ;(newOuterList as HTMLOListElement).setAttribute('start', String(resumeStartOuter));
        }

        // outerLi 뒤의 형제 li들을 newOuterList로 이동
        {
            let p = outerLi.nextElementSibling;
            while (p && p.tagName.toLowerCase() === 'li') 
            {
                const next = p.nextElementSibling;
                newOuterList.appendChild(p);
                p = next;
            }
        }

        // ① newOuterList를 outerList 뒤에 (비어있다면 나중에 제거)
        outerList.parentElement?.insertBefore(newOuterList, outerList.nextSibling);

        // ② 표를 outerList와 newOuterList 사이(= 어떤 li에도 속하지 않음)에 둠
        outerList.parentElement?.insertBefore(tableBlock, newOuterList);

        // ③ 내부 tail(현재 listEl에서 잘라낸 형제 li들)이 있으면
        //    현재 listEl과 같은 태그로 새 리스트를 만들어 표 뒤에 둔다.
        if (tailLis.length > 0) 
        {
            const newInnerList = document.createElement(listTag) as
                | HTMLOListElement
                | HTMLUListElement;
            carryListAttrs(listEl, newInnerList);
            if (listTag === 'ol') 
            {
                const startAttr = parseInt(
                    (listEl as HTMLOListElement).getAttribute('start') || '1',
                    10
                );
                const prevIndex = indexAmongLis(li, listEl);
                const resumeStart = startAttr + prevIndex + 1
                ;(newInnerList as HTMLOListElement).setAttribute('start', String(resumeStart));
            }
            tailLis.forEach((tli) => newInnerList.appendChild(tli));
            // 표 바로 뒤에 내부 tail 리스트 배치
            tableBlock.parentElement?.insertBefore(newInnerList, tableBlock.nextSibling);
        }

        // ④ 비어있는 새 바깥 리스트는 제거
        if (!newOuterList.firstElementChild) newOuterList.remove();
    }

    return wrap.innerHTML;

    // ───────────── helpers ─────────────
    function liDepth(li: Element): number 
    {
        let d = 0;
        let cur: Element | null = li;
        while ((cur = cur.parentElement?.closest?.('li') || null))
        { 
            d++; 
        }
        return d;
    }

    // 같은 리스트의 '직계' li 배열에서 li의 인덱스 (변형 전 기준으로 사용)
    function indexAmongLis(li: Element, listEl: HTMLOListElement | HTMLUListElement): number 
    {
        let lis: Element[] = [];
        try 
        {
            lis = Array.from(listEl.querySelectorAll(':scope > li'));
        }
        catch 
        {
            lis = Array.from(listEl.children).filter((el) => el.tagName.toLowerCase() === 'li');
        }
        const idx = lis.indexOf(li);
        return idx < 0 ? 0 : idx;
    }

    function fragBefore(container: Element, endNode: Node): DocumentFragment 
    {
        const r = document.createRange();
        r.selectNodeContents(container);
        r.setEndBefore(endNode);
        return r.cloneContents();
    }
    function fragBetween(container: Element, startNode: Node, endNode: Node): DocumentFragment 
    {
        const r = document.createRange();
        r.selectNodeContents(container);
        r.setStartAfter(startNode);
        r.setEndBefore(endNode);
        return r.cloneContents();
    }
    function fragAfter(container: Element, startNode: Node): DocumentFragment 
    {
        const r = document.createRange();
        r.selectNodeContents(container);
        r.setStartAfter(startNode);
        return r.cloneContents();
    }
    function appendIfMeaningful(target: Element, frag: DocumentFragment) 
    {
        const text = (frag.textContent || '').replace(/\u00A0/g, ' ').trim();
        const hasEl = Array.from(frag.childNodes).some((n) => n.nodeType === 1);
        if (text.length > 0 || hasEl) target.appendChild(frag);
    }

    // 클래스/스타일/타입(start/type) 등 기본 속성만 최소 보존
    function carryListAttrs(src: Element, dst: Element) 
    {
        const cls = src.getAttribute('class');
        if (cls) dst.setAttribute('class', cls);
        const sty = src.getAttribute('style');
        if (sty) dst.setAttribute('style', sty);
        if (src.tagName.toLowerCase() === 'ol') 
        {
            const typeAttr = (src as HTMLOListElement).getAttribute('type');
            if (typeAttr) (dst as HTMLOListElement).setAttribute('type', typeAttr);
        }
    }
}