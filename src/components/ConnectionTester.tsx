import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export const ConnectionTester = () => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState({
        https: null,
        rest: null,
        auth: null,
        products: null
    });
    const [testCompleted, setTestCompleted] = useState(false);

    const runAllTests = async () => {
        setTesting(true);
        setResults({
            https: null,
            rest: null,
            auth: null,
            products: null
        });
        setTestCompleted(false);

        // Test 1: HTTPS
        try {
            const startTime = Date.now();
            const response = await fetch(supabase.supabaseUrl);
            const duration = Date.now() - startTime;
            setResults(prev => ({
                ...prev,
                https: {
                    success: response.ok,
                    message: `Status: ${response.status} (${duration}ms)`
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                https: {
                    success: false,
                    message: `Error: ${error.message}`
                }
            }));
        }

        // Test 2: Auth API
        try {
            const startTime = Date.now();
            const { data, error } = await supabase.auth.getSession();
            const duration = Date.now() - startTime;

            setResults(prev => ({
                ...prev,
                auth: {
                    success: !error,
                    message: error ?
                        `Error: ${error.message} (${duration}ms)` :
                        `Success (${duration}ms)`
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                auth: {
                    success: false,
                    message: `Exception: ${error.message}`
                }
            }));
        }

        // Test 3: REST API
        try {
            const startTime = Date.now();
            const { error } = await supabase.from('products').select('count').limit(1);
            const duration = Date.now() - startTime;

            setResults(prev => ({
                ...prev,
                rest: {
                    success: !error,
                    message: error ?
                        `Error: ${error.message} (${error.code}) (${duration}ms)` :
                        `Success (${duration}ms)`
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                rest: {
                    success: false,
                    message: `Exception: ${error.message}`
                }
            }));
        }

        // Test 4: Products Table
        try {
            const startTime = Date.now();
            const { data, error } = await supabase
                .from('products')
                .select('id, name')
                .limit(5);
            const duration = Date.now() - startTime;

            setResults(prev => ({
                ...prev,
                products: {
                    success: !error && data?.length > 0,
                    message: error ?
                        `Error: ${error.message} (${duration}ms)` :
                        `Success: Found ${data?.length || 0} products (${duration}ms)`
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                products: {
                    success: false,
                    message: `Exception: ${error.message}`
                }
            }));
        }

        setTesting(false);
        setTestCompleted(true);
    };

    useEffect(() => {
        runAllTests();
    }, []);

    const getStatusIcon = (result) => {
        if (result === null) return <Loader2 className="h-5 w-5 animate-spin" />;
        if (result.success) return <CheckCircle className="h-5 w-5 text-green-500" />;
        return <XCircle className="h-5 w-5 text-red-500" />;
    };

    const getDiagnosis = () => {
        if (!testCompleted) return null;

        // All successful
        if (results.https?.success && results.auth?.success && results.rest?.success && results.products?.success) {
            return (
                <div className="p-4 bg-green-100 text-green-800 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <h3 className="font-medium">All connection tests passed</h3>
                    </div>
                    <p className="mt-2">Supabase connectivity is working properly. If you're still having issues, the problem may be elsewhere in your code.</p>
                </div>
            );
        }

        // Detect common patterns

        // Network connectivity issue
        if (!results.https?.success) {
            return (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-medium">Network Connectivity Issue</h3>
                    </div>
                    <p className="mt-2">Your device cannot reach Supabase. This could be due to:</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li>Firewall blocking the connection</li>
                        <li>Network restrictions</li>
                        <li>DNS resolution problems</li>
                        <li>Internet connectivity issues</li>
                    </ul>
                    <p className="mt-2"><strong>Try:</strong> Using a different network (like a mobile hotspot), checking your firewall settings, or temporarily disabling security software.</p>
                </div>
            );
        }

        // Auth API issue but HTTPS works
        if (results.https?.success && !results.auth?.success) {
            return (
                <div className="p-4 bg-amber-100 text-amber-800 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-medium">Authentication API Issue</h3>
                    </div>
                    <p className="mt-2">You can reach Supabase, but the authentication API is failing. This could indicate:</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li>Incorrect Supabase API key</li>
                        <li>Supabase service disruption</li>
                        <li>API endpoint blocked by network policy</li>
                    </ul>
                    <p className="mt-2"><strong>Try:</strong> Checking your API key in .env file, or checking Supabase service status.</p>
                </div>
            );
        }

        // REST/Products issue but Auth works
        if (results.auth?.success && (!results.rest?.success || !results.products?.success)) {
            return (
                <div className="p-4 bg-amber-100 text-amber-800 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-medium">Database Access Issue</h3>
                    </div>
                    <p className="mt-2">You can authenticate with Supabase, but can't access the database. This could indicate:</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li>Row Level Security (RLS) policies blocking access</li>
                        <li>Missing database tables</li>
                        <li>Required database functions not installed</li>
                        <li>Database service disruption</li>
                    </ul>
                    <p className="mt-2"><strong>Try:</strong> Checking RLS policies in Supabase dashboard, creating missing tables, or installing required database functions.</p>
                </div>
            );
        }

        // General case
        return (
            <div className="p-4 bg-amber-100 text-amber-800 rounded-lg mt-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Connection Issues Detected</h3>
                </div>
                <p className="mt-2">Some connection tests failed. Review the results above for specific errors.</p>
            </div>
        );
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Supabase Connection Test</CardTitle>
                <CardDescription>
                    Tests your device's connectivity to Supabase services
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(results.https)}
                            <span>HTTPS Connection</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{results.https?.message || 'Testing...'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(results.auth)}
                            <span>Authentication API</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{results.auth?.message || 'Testing...'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(results.rest)}
                            <span>Database REST API</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{results.rest?.message || 'Testing...'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(results.products)}
                            <span>Products Table Query</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{results.products?.message || 'Testing...'}</span>
                    </div>
                </div>

                {getDiagnosis()}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={runAllTests}
                    disabled={testing}
                    className="w-full"
                >
                    {testing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Tests...
                        </>
                    ) : 'Run Tests Again'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ConnectionTester;