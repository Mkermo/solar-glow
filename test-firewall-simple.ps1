Write-Host "======= SUPABASE FIREWALL TEST =======" -ForegroundColor Cyan
Write-Host "Testing connection to: ketesbnrumxbvwuaqefa.supabase.co"
Write-Host ""

# Test 1: DNS Resolution
Write-Host "Test 1: DNS Resolution" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $dns = Resolve-DnsName ketesbnrumxbvwuaqefa.supabase.co -ErrorAction Stop
    Write-Host "[SUCCESS] DNS works!" -ForegroundColor Green
    Write-Host "  IP Address: $($dns.IPAddress)"
} catch {
    Write-Host "[FAILED] DNS failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: TCP Connection to Port 443
Write-Host "Test 2: TCP Connection (Port 443)" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$tcpTest = Test-NetConnection -ComputerName ketesbnrumxbvwuaqefa.supabase.co -Port 443 -WarningAction SilentlyContinue
if ($tcpTest.TcpTestSucceeded) {
    Write-Host "[SUCCESS] TCP Connection works!" -ForegroundColor Green
    Write-Host "  Remote Address: $($tcpTest.RemoteAddress)"
} else {
    Write-Host "[FAILED] TCP Connection is BLOCKED!" -ForegroundColor Red
    Write-Host "  ** FIREWALL IS LIKELY BLOCKING **" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: HTTPS Request
Write-Host "Test 3: HTTPS Request" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "https://ketesbnrumxbvwuaqefa.supabase.co" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    $stopwatch.Stop()
    Write-Host "[SUCCESS] HTTPS Request works!" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)"
    Write-Host "  Response Time: $($stopwatch.ElapsedMilliseconds)ms"
} catch {
    Write-Host "[FAILED] HTTPS Request failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 4: Check Firewall Status
Write-Host "Test 4: Windows Firewall Status" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $firewallStatus = Get-NetFirewallProfile | Select-Object Name, Enabled
    foreach ($profile in $firewallStatus) {
        if ($profile.Enabled) {
            Write-Host "  $($profile.Name): ENABLED" -ForegroundColor Yellow
        } else {
            Write-Host "  $($profile.Name): DISABLED" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  Could not check firewall status"
}
Write-Host ""

# Summary
Write-Host "======= TEST SUMMARY =======" -ForegroundColor Cyan
Write-Host ""

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "[SUCCESS] CONNECTION IS WORKING" -ForegroundColor Green
    Write-Host "Your firewall does NOT appear to be blocking Supabase."
    Write-Host "If your app still has issues, check:" -ForegroundColor Yellow
    Write-Host "  - Browser console for errors"
    Write-Host "  - RLS policies in Supabase dashboard"
    Write-Host "  - Application code for bugs"
} else {
    Write-Host "[BLOCKED] CONNECTION IS BLOCKED!" -ForegroundColor Red
    Write-Host "Your firewall IS blocking Supabase connections."
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Yellow
    Write-Host "1. Temporarily disable Windows Firewall:"
    Write-Host "   - Run: firewall.cpl"
    Write-Host "   - Turn off firewall (both private and public)"
    Write-Host "   - Test your app again"
    Write-Host "   - Re-enable firewall after"
    Write-Host ""
    Write-Host "2. Add firewall exception for Node.js:"
    Write-Host "   - Run: wf.msc"
    Write-Host "   - Go to: Outbound Rules > New Rule"
    Write-Host "   - Choose: Program"
    Write-Host "   - Browse to: node.exe location"
    Write-Host "   - Action: Allow the connection"
    Write-Host ""
    Write-Host "3. Try mobile hotspot to rule out network blocking"
}

Write-Host ""
Write-Host "======= END OF TEST =======" -ForegroundColor Cyan