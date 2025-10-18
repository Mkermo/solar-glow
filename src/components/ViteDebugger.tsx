import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const ViteDebugger = () => {
    const [checks, setChecks] = useState({
        envVarsLoaded: null,
        supabaseUrlValid: null,
        supabaseKeyValid: null,
        supabaseClientCreated: null,
        canFetchData: null,
        viteVersion: null,
    });

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        // Check 1: Environment variables loaded
        const envVarsLoaded = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

        // Check 2: Supabase URL format
        const supabaseUrlValid = import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

        // Check 3: Supabase key format
        const supabaseKeyValid = import.meta.env.VITE_SUPABASE_ANON_KEY?.startsWith('eyJ');

        // Check 4: Supabase client created
        const supabaseClientCreated = !!supabase;

        // Check 5: Can fetch data
        let canFetchData = false;
        try {
            const { error } = await supabase.from('products').select('count').limit(1);
            canFetchData = !error;
        } catch (err) {
            canFetchData = false;
        }

        // Check 6: Vite version
        const viteVersion = import.meta.env.VITE ? 'Vite 5.x detected' : 'Unknown';

        setChecks({
            envVarsLoaded,
            supabaseUrlValid,
            supabaseKeyValid,
            supabaseClientCreated,
            canFetchData,
            viteVersion,
        });
    };

    const getIcon = (value) => {
        if (value === null) return <AlertCircle className="h-5 w-5 text-gray-400" />;
        return value ?
            <CheckCircle className="h-5 w-5 text-green-500" /> :
            <XCircle className="h-5 w-5 text-red-500" />;
    };

    const getStatus = (value) => {
        if (value === null) return 'Checking...';
        return value ? 'PASS' : 'FAIL';
    };

    return (
        <Card className="w-full max-w-2xl mx-auto my-8">
            <CardHeader>
                <CardTitle>Vite Configuration Diagnostics</CardTitle>
                <CardDescription>
                    Checking if Vite is correctly loading environment variables and bundling the app
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {getIcon(checks.envVarsLoaded)}
                            <span className="font-medium">Environment Variables Loaded</span>
                        </div>
                        <span className={checks.envVarsLoaded ? 'text-green-600' : 'text-red-600'}>
                            {getStatus(checks.envVarsLoaded)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {getIcon(checks.supabaseUrlValid)}
                            <span className="font-medium">Supabase URL Format Valid</span>
                        </div>
                        <span className={checks.supabaseUrlValid ? 'text-green-600' : 'text-red-600'}>
                            {getStatus(checks.supabaseUrlValid)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {getIcon(checks.supabaseKeyValid)}
                            <span className="font-medium">Supabase Key Format Valid</span>
                        </div>
                        <span className={checks.supabaseKeyValid ? 'text-green-600' : 'text-red-600'}>
                            {getStatus(checks.supabaseKeyValid)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {getIcon(checks.supabaseClientCreated)}
                            <span className="font-medium">Supabase Client Created</span>
                        </div>
                        <span className={checks.supabaseClientCreated ? 'text-green-600' : 'text-red-600'}>
                            {getStatus(checks.supabaseClientCreated)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            {getIcon(checks.canFetchData)}
                            <span className="font-medium">Can Fetch Data from Supabase</span>
                        </div>
                        <span className={checks.canFetchData ? 'text-green-600' : 'text-red-600'}>
                            {getStatus(checks.canFetchData)}
                        </span>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Environment Details</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Vite:</strong> {checks.viteVersion || 'Detecting...'}</p>
                            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not loaded'}</p>
                            <p><strong>API Key (first 20 chars):</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) || 'Not loaded'}...</p>
                            <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
                            <p><strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
                            <p><strong>Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    {(!checks.envVarsLoaded || !checks.canFetchData) && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-red-800 mb-2">⚠️ Issues Detected</h3>
                            <ul className="text-sm text-red-700 space-y-1">
                                {!checks.envVarsLoaded && (
                                    <li>• Environment variables are not being loaded by Vite. Check your .env file.</li>
                                )}
                                {!checks.supabaseUrlValid && (
                                    <li>• VITE_SUPABASE_URL format is invalid or missing.</li>
                                )}
                                {!checks.supabaseKeyValid && (
                                    <li>• VITE_SUPABASE_ANON_KEY format is invalid or missing.</li>
                                )}
                                {!checks.canFetchData && checks.supabaseClientCreated && (
                                    <li>• Cannot fetch data from Supabase. Check RLS policies or table existence.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ViteDebugger;