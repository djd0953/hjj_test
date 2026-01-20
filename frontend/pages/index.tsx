import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';

const KEYWORDS = 
[
    'aws',
    'cleanDocx',
    'diffDocx',
    'email',
    'excelFileCheck',
    'excelWritingBulkChk',
    'fixDocx',
    'jwt',
    'kms',
    'lcs',
    'organization',
    'sentEvent',
    'separateCode',
    'sm',
    'templateDataParse',
    'test',
    'uaparse',
    'uuid'
];

const MODES = 
[
    'brack',
    'pass'
];

const ORIGIN = "http://localhost:9090"

export const title = 'API Playground';

export default function Home() 
{
    const [mode, setMode] = useState<string>('brack');
    const [keyword, setKeyword] = useState<string>('aws');
    const [notes, setNotes] = useState<string>('');
    const [curl, setCurl] = useState<string>('-');
    const [statusText, setStatusText] = useState<string>('-');
    const [statusColor, setStatusColor] = useState<string>('#1c222b');
    const [result, setResult] = useState<string>('-');

    const resetCurl = () => 
    {
        setCurl(`curl -X GET "${ORIGIN}/${mode}/${keyword}"`);
    }

    useEffect(() => 
    {
        resetCurl()
    }, [mode, keyword]);

    const sendRequest = async () => 
    {
        if (!keyword) return;
        const url = `${ORIGIN}/${mode}/${keyword}`;
        resetCurl()
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

    const keywordOptions = useMemo(
        () => KEYWORDS.map((k) => (
            <option key={k} value={k}>
                {k}
            </option>
        )),
        []
    );

    /**
.card 
{
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 24px 60px rgba(24, 32, 43, 0.12);
}
.segmented { display: inline-flex; background: #f2f5f6; border-radius: 999px; padding: 4px; gap: 6px; }
.segmented button { border: none; background: transparent; padding: 8px 16px; border-radius: 999px; font-weight: 600; cursor: pointer; color: #6a7380; }
.segmented button.is-active { background: #2f6f76; color: #fff; }
     */

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
        </>
    );
}
