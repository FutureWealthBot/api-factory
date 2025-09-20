"use client";
import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
    const [usage, setUsage] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/usage')
            .then(res => res.json())
            .then(data => {
                setUsage(data.usage || []);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load usage metrics');
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
            <h2>Usage Analytics</h2>
            {loading && <p>Loading usage metrics...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <table border={1} cellPadding={6} style={{ marginTop: 12 }}>
                    <thead>
                        <tr>
                            <th>API Key</th>
                            <th>Usage Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usage.length === 0 ? (
                            <tr><td colSpan={2}>No usage data</td></tr>
                        ) : usage.map((row, i) => (
                            <tr key={i}>
                                <td>{row.api_key}</td>
                                <td>{row.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DashboardPage;