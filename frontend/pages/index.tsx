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

export default function Home() 
{
    const [mode, setMode] = useState<string>('brack');
    const [keyword, setKeyword] = useState<string>('aws');
    const [notes, setNotes] = useState<string>('');
    const [curl, setCurl] = useState<string>('-');
    const [statusText, setStatusText] = useState<string>('-');
    const [statusColor, setStatusColor] = useState<string>('#1c222b');
    const [result, setResult] = useState<string>('-');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    useEffect(() => 
    {
        setCurl(`curl -X GET "${origin}/${mode}/${keyword}`);
    }, [origin, mode, keyword]);

    const sendRequest = async () => 
    {
        if (!keyword) return;
        const url = `http://localhost:9090/${mode}/${keyword}`;
        setCurl(`curl -X GET "${origin}/${mode}/${keyword}`);
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

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>API Playground</title>
                <link rel="stylesheet" href="/ui/app.css" />
            </Head>

            <div className="app">
                <header className="topbar">
                    <div className="brand">
                        <span className="logo">API</span>
                        <div className="meta">
                            <h1> </h1>
                            <p> </p>
                        </div>
                    </div>
                    <div className="env">
                        <span className="pill">GET</span>
                        <span className="pill">/b/:keyword</span>
                        <span className="pill">/p/:keyword</span>
                    </div>
                </header>

                <main className="layout">
                    <section className="panel">
                        <h2>Request</h2>
                        <div className="field">
                            <label htmlFor="mode">Debug Mode</label>
                            <div className="segmented" id="mode">
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
                            <label htmlFor="keyword">Keyword</label>
                            <select id="keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)}>
                                {keywordOptions}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="notes">Notes</label>
                            <textarea id="notes" rows={4} placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <button id="send" className="primary" onClick={sendRequest}>
                            Send Request
                        </button>
                    </section>

                    <section className="panel">
                        <h2>Response</h2>
                        <div className="field">
                            <label>cURL</label>
                            <pre id="curl" className="code">{curl}</pre>
                        </div>
                        <div className="field">
                            <label>Status</label>
                            <div id="status" className="status" style={{ color: statusColor }}>
                                {statusText}
                            </div>
                        </div>
                        <div className="field">
                            <label>Body</label>
                            <pre id="result" className="code">{result}</pre>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
