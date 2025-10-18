import React from 'react';
import ConnectionTester from '@/components/ConnectionTester';

export const NetworkTest = () => {
    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Network Connection Test</h1>
            <p className="text-center mb-8 max-w-2xl mx-auto">
                This page tests your device's ability to connect to Supabase database services.
                Use this to diagnose network, firewall, or connectivity issues.
            </p>

            <ConnectionTester />

            <div className="mt-12 bg-muted p-6 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Common Network Issues</h2>

                <h3 className="text-lg font-medium mt-6 mb-2">Firewall Blocking</h3>
                <p className="mb-4">
                    Your firewall might be blocking connections to Supabase. Try temporarily disabling
                    your firewall or adding exceptions for these domains:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>*.supabase.co</li>
                    <li>*.supabase.in</li>
                    <li>*.supabase.net</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-2">Network Restrictions</h3>
                <p className="mb-4">
                    Some networks (especially corporate, school, or public WiFi) block certain outbound connections.
                    Try using a different network like a mobile hotspot.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-2">Browser Extensions</h3>
                <p className="mb-4">
                    Privacy or security extensions can sometimes block API requests.
                    Try temporarily disabling extensions or using a private/incognito window.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-2">DNS Issues</h3>
                <p>
                    If DNS resolution is failing, try changing your DNS servers to Google DNS (8.8.8.8, 8.8.4.4)
                    or Cloudflare DNS (1.1.1.1).
                </p>
            </div>
        </div>
    );
};

export default NetworkTest;