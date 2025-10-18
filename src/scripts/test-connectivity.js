// Simple script to test Supabase connectivity
// This script tests all different connection methods to Supabase
// Run with: node src/scripts/test-connectivity.js

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const dns = require('dns');

// Supabase credentials from .env
const supabaseUrl = 'https://ketesbnrumxbvwuaqefa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc';

console.log('======= SUPABASE CONNECTION TEST =======');
console.log(`Testing connection to: ${supabaseUrl}`);

// Test 1: Basic HTTPS connection
console.log('\n----- TEST 1: HTTPS Direct Connection -----');

function testHttpsConnection() {
    return new Promise((resolve) => {
        console.log(`Making HTTPS request to ${supabaseUrl}`);
        const startTime = Date.now();

        https.get(supabaseUrl, (res) => {
            const duration = Date.now() - startTime;
            console.log(`✅ HTTPS Connection successful`);
            console.log(`   Status code: ${res.statusCode}`);
            console.log(`   Response time: ${duration}ms`);

            res.on('data', () => { });
            res.on('end', () => {
                resolve(true);
            });
        }).on('error', (err) => {
            console.log(`❌ HTTPS Connection failed: ${err.message}`);
            resolve(false);
        });
    });
}

// Test 2: DNS Resolution
async function testDnsResolution() {
    console.log('\n----- TEST 2: DNS Resolution -----');
    console.log(`Resolving hostname: ketesbnrumxbvwuaqefa.supabase.co`);

    return new Promise((resolve) => {
        dns.lookup('ketesbnrumxbvwuaqefa.supabase.co', (err, address) => {
            if (err) {
                console.log(`❌ DNS resolution failed: ${err.message}`);
                resolve(false);
            } else {
                console.log(`✅ DNS resolution successful: ${address}`);
                resolve(true);
            }
        });
    });
}

// Test 3: Supabase REST API
async function testSupabaseRest() {
    console.log('\n----- TEST 3: Supabase REST API -----');
    console.log('Testing REST API connection (products table)');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const startTime = Date.now();
        const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .limit(1);

        const duration = Date.now() - startTime;

        if (error) {
            console.log(`❌ REST API Error: ${error.message}`);
            console.log(`   Error code: ${error.code || 'none'}`);
            console.log(`   Response time: ${duration}ms`);
            return false;
        }

        console.log(`✅ REST API connection successful`);
        console.log(`   Response time: ${duration}ms`);
        console.log(`   Data received: ${JSON.stringify(data).substring(0, 100)}...`);
        return true;
    } catch (err) {
        console.log(`❌ REST API Exception: ${err.message}`);
        return false;
    }
}

// Test 4: WebSocket Connection
async function testWebsocket() {
    console.log('\n----- TEST 4: WebSocket Connection -----');
    console.log(`Testing WebSocket connection to: wss://ketesbnrumxbvwuaqefa.supabase.co/realtime/v1`);

    return new Promise((resolve) => {
        try {
            const ws = new WebSocket('wss://ketesbnrumxbvwuaqefa.supabase.co/realtime/v1', {
                headers: {
                    apikey: supabaseKey
                }
            });

            const timeout = setTimeout(() => {
                console.log('❌ WebSocket connection timed out after 5 seconds');
                ws.terminate();
                resolve(false);
            }, 5000);

            ws.on('open', () => {
                console.log('✅ WebSocket connection successful');
                clearTimeout(timeout);
                ws.close();
                resolve(true);
            });

            ws.on('error', (err) => {
                console.log(`❌ WebSocket Error: ${err.message}`);
                clearTimeout(timeout);
                resolve(false);
            });
        } catch (err) {
            console.log(`❌ WebSocket Exception: ${err.message}`);
            resolve(false);
        }
    });
}

// Test 5: Authentication
async function testAuth() {
    console.log('\n----- TEST 5: Authentication API -----');
    console.log('Testing Supabase Auth API (getSession)');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const startTime = Date.now();
        const { data, error } = await supabase.auth.getSession();
        const duration = Date.now() - startTime;

        if (error) {
            console.log(`❌ Auth API Error: ${error.message}`);
            console.log(`   Response time: ${duration}ms`);
            return false;
        }

        console.log(`✅ Auth API connection successful`);
        console.log(`   Response time: ${duration}ms`);
        console.log(`   Session: ${data.session ? 'Active' : 'None'}`);
        return true;
    } catch (err) {
        console.log(`❌ Auth API Exception: ${err.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const testResults = {
        https: await testHttpsConnection(),
        dns: await testDnsResolution(),
        rest: await testSupabaseRest(),
        websocket: await testWebsocket(),
        auth: await testAuth()
    };

    // Summary
    console.log('\n======= TEST RESULTS SUMMARY =======');
    console.log(`HTTPS Connection: ${testResults.https ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`DNS Resolution: ${testResults.dns ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`REST API: ${testResults.rest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`WebSocket: ${testResults.websocket ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Auth API: ${testResults.auth ? '✅ PASSED' : '❌ FAILED'}`);

    // Diagnostics and recommendations
    console.log('\n======= DIAGNOSIS =======');

    if (!testResults.dns) {
        console.log('❌ DNS ISSUE: Cannot resolve Supabase hostname');
        console.log('   Recommendation: Check your DNS settings or internet connection');
        console.log('   Try using a different DNS server or network');
    }

    if (testResults.dns && !testResults.https) {
        console.log('❌ HTTPS CONNECTION ISSUE: DNS works but cannot connect via HTTPS');
        console.log('   Recommendation: Check if a firewall is blocking outbound HTTPS connections');
        console.log('   Try temporarily disabling firewall or antivirus');
    }

    if (testResults.https && !testResults.rest) {
        console.log('❌ SUPABASE API ISSUE: HTTPS works but Supabase REST API fails');
        console.log('   Recommendation: Check Supabase console for service status');
        console.log('   Verify your API key is correct');
    }

    if (testResults.rest && !testResults.websocket) {
        console.log('❌ WEBSOCKET ISSUE: REST works but WebSockets failing');
        console.log('   Recommendation: Check if firewall is blocking WebSocket connections');
        console.log('   Some networks (like corporate) block WebSocket traffic');
    }

    if (testResults.rest && testResults.dns && testResults.https && testResults.websocket && testResults.auth) {
        console.log('✅ ALL TESTS PASSED: Connection to Supabase appears to be working properly');
        console.log('   If your app is still having issues, the problem may be in your code or browser');
    }

    console.log('\n======= NEXT STEPS =======');

    if (!testResults.https || !testResults.dns) {
        console.log('1. Try connecting from a different network (e.g., mobile hotspot)');
        console.log('2. Check your network/firewall settings');
        console.log('3. Verify you can access https://app.supabase.com in your browser');
    } else if (!testResults.rest || !testResults.auth) {
        console.log('1. Verify your Supabase URL and API key are correct');
        console.log('2. Check if Supabase service is operational in the dashboard');
        console.log('3. Try creating a new API key in Supabase dashboard');
    } else if (!testResults.websocket) {
        console.log('1. Your app might work with REST API but have issues with realtime');
        console.log('2. Consider disabling realtime features if behind restrictive firewall');
    } else {
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Add more detailed error logging to your application code');
        console.log('3. Verify browser extensions are not interfering with connections');
    }
}

// Run all tests
runAllTests();