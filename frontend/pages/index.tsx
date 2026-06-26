import React, { useEffect, useMemo, useState } from 'react';

const MODES =
[
    'brack',
    'pass'
];

const ORIGIN = "http://localhost:9090";

// mock Difference 서버 (NestJS backend) 의 trigger endpoint
type HsadTrigger =
{
    label: string;
    path: string;
    payload: Record<string, string>;
};

// SPEC §3.2 기준 — JOB_NO / CTRT_CODE 등은 하드코딩 더미값
const HSAD_TRIGGERS: HsadTrigger[] =
[
    {
        label: '1-1. 계약검토완료목록',
        path: '/hsad/trigger/1',
        payload: { JOB_NO: 'PKR220004-J001' }
    },
    {
        label: '1-2. 계약검토완료진행현황',
        path: '/hsad/trigger/2',
        payload: { CTRT_CODE: '5' }
    },
    {
        label: '3. 기존계약서검토내역조회',
        path: '/hsad/trigger/3',
        payload: { CTRT_TITL: 'docx', CTRT_RQUN: '' }
    },
    {
        label: '4. 기존계약서검토내역업데이트',
        path: '/hsad/trigger/4',
        payload: { CTRT_NJOB: 'PKR220004-J003', CTRT_CODE: '5' }
    },
    {
        label: '5. 계약서스캔본등록여부확인',
        path: '/hsad/trigger/5',
        payload: { CTRT_NJOB: 'PKR220004-J003' }
    }
];

export const title = 'API Playground';

export default function Home()
{
    const [mode, setMode] = useState<string>('brack');
    const [keyword, setKeyword] = useState<string>('aws');
    const [keywordList, setKeywordList] = useState<string[]>([]);
    const [notes, setNotes] = useState<string>('');
    const [curl, setCurl] = useState<string>('-');
    const [statusText, setStatusText] = useState<string>('-');
    const [statusColor, setStatusColor] = useState<string>('#1c222b');
    const [result, setResult] = useState<string>('-');

    const [hsadStatus, setHsadStatus] = useState<string>('-');
    const [hsadStatusColor, setHsadStatusColor] = useState<string>('#1c222b');
    const [hsadResult, setHsadResult] = useState<string>('-');
    const [hsadLastUrl, setHsadLastUrl] = useState<string>('-');

    const resetCurl = () =>
    {
        setCurl(`curl -X GET "${ORIGIN}/code/${mode}/${keyword}"`);
    };

    useEffect(() =>
    {
        resetCurl();
    }, [mode, keyword]);

    const sendRequest = async () =>
    {
        if (!keyword) return;
        const url = `${ORIGIN}/code/${mode}/${keyword}`;
        resetCurl();
        setResult('Loading...');
        setStatusText('...');
        setStatusColor('#1c222b');

        try
        {
            const res = await fetch(url);
            const text = await res.text();
            let body = text;
            try
            {
                body = JSON.stringify(JSON.parse(text), null, 2);
            }
            catch
            {
                body = text || '(empty)';
            }

            setStatusText(`${res.status} ${res.statusText}`);
            setStatusColor(res.ok ? '#23565c' : '#b8513b');
            setResult(body);
        }
        catch (err)
        {
            setStatusText('Network error');
            setStatusColor('#b8513b');
            setResult(String(err));
        }
    };

    const triggerHsad = async (trigger: HsadTrigger) =>
    {
        const url = `${ORIGIN}${trigger.path}`;
        setHsadLastUrl(`POST ${url}\npayload: ${JSON.stringify(trigger.payload, null, 2)}`);
        setHsadStatus('...');
        setHsadStatusColor('#1c222b');
        setHsadResult('Loading...');

        try
        {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trigger.payload)
            });
            const text = await res.text();
            let body = text;
            try
            {
                body = JSON.stringify(JSON.parse(text), null, 2);
            }
            catch
            {
                body = text || '(empty)';
            }

            setHsadStatus(`${res.status} ${res.statusText}`);
            setHsadStatusColor(res.ok ? '#23565c' : '#b8513b');
            setHsadResult(body);
        }
        catch (err)
        {
            setHsadStatus('Network error');
            setHsadStatusColor('#b8513b');
            setHsadResult(String(err));
        }
    };

    console.log(keywordList);
    const keywordOptions = useMemo(
        () => keywordList.map((k) => (
            <option key={k} value={k}>
                {k}
            </option>
        )),
        [keywordList]
    );

    const getKeywords = async () =>
    {
        try 
        {
            const url = `${ORIGIN}/code/list`;
            const res = await fetch(url);
            const list = await res.json();
            setKeywordList(list);
        }
        catch (e: unknown) 
        {
            setKeywordList([]);
        }

    };

    useEffect(() =>
    {
        getKeywords();
    }, []);

    return (
        <>
            <div className="page-grid">
                <section className="panel">
                    <h2>Request</h2>
                    <div className="field">
                        <label>Debug Mode</label>
                        <div className="segmented">
                            {MODES && MODES.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    className={mode === m ? 'is-active' : ''}
                                    onClick={() => setMode(m)}
                                >{m}</button>
                            ))}
                        </div>
                    </div>

                    <div className="field">
                        <label>Keyword</label>
                        <select value={keyword} onChange={(e) => setKeyword(e.target.value)}>
                            {keywordOptions}
                        </select>
                    </div>

                    <div className="field">
                        <label>Notes</label>
                        <textarea rows={4} placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    <button id="send" className="primary" onClick={sendRequest}>Send Request</button>
                </section>

                <section className="panel">
                    <h2>Response</h2>
                    <div className="field">
                        <label>cURL</label>
                        <pre className="code">{curl}</pre>
                    </div>
                    <div className="field">
                        <label>Status</label>
                        <div className="status" style={{ color: statusColor }}>{statusText}</div>
                    </div>
                    <div className="field">
                        <label>Body</label>
                        <pre className="code">{result}</pre>
                    </div>
                </section>
            </div>

            <div className="page-grid" style={{ marginTop: 24 }}>
                <section className="panel">
                    <h2>HSAD Difference Triggers</h2>
                    <div className="field">
                        <label>Target Lawform</label>
                        <pre className="code">http://localhost:8000/api/hsad/difference/*</pre>
                    </div>
                    <div className="field">
                        <label>Mock</label>
                        <pre className="code">{ORIGIN}</pre>
                    </div>
                    <div className="segmented" style={{ flexWrap: 'wrap', gap: 8 }}>
                        {HSAD_TRIGGERS.map(t => (
                            <button
                                key={t.path}
                                type="button"
                                onClick={() => triggerHsad(t)}
                            >{t.label}</button>
                        ))}
                    </div>
                </section>

                <section className="panel">
                    <h2>HSAD Response</h2>
                    <div className="field">
                        <label>Request</label>
                        <pre className="code">{hsadLastUrl}</pre>
                    </div>
                    <div className="field">
                        <label>Status</label>
                        <div className="status" style={{ color: hsadStatusColor }}>{hsadStatus}</div>
                    </div>
                    <div className="field">
                        <label>Body</label>
                        <pre className="code">{hsadResult}</pre>
                    </div>
                </section>
            </div>
        </>
    );
}
