import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

export const title = 'About';
export const subTitle = "About";

export default function About() {
    return (
        <>
            <section className="card">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-gray-700 mb-3">This is an additional page alongside the API playground.</p>
                <p>
                    <Link href="/" className="text-teal-600">← Back to Playground</Link>
                </p>
            </section>
        </>
    );
}
