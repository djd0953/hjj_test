import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

export const title = 'Logs';

export default function Logs() 
{
    return (
        <>
            <Head>
                <title>Logs - API Playground</title>
            </Head>

            <section className="card">
                <h2 className="text-lg font-semibold mb-3">Logs</h2>
                <p className="text-gray-700 mb-3">Log listing will go here (not yet implemented).</p>
                <p>
                    <Link href="/" className="text-teal-600">← Back to Playground</Link>
                </p>
            </section>
        </>
    );
}
