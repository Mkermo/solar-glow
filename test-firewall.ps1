Write-Host "======= SUPABASE FIREWALL TEST =======" -ForegroundColor Cyan
Write-Host "Testing connection to: ketesbnrumxbvwuaqefa.supabase.co" -ForegroundColor White
Write-Host ""

# Test 1: DNS Resolution
Write-Host "Test 1: DNS Resolution" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $dns = Resolve-DnsName ketesbnrumxbvwuaqefa.supabase.co -ErrorAction Stop
    Write-Host "[SUCCESS] DNS Resolution: PASSED" -ForegroundColor Green
    Write-Host "  IP Address: $($dns.IPAddress)" -ForegroundColor Gray
} catch {
    Write-Host "[FAILED] DNS Resolution: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 2: TCP Connection to Port 443
Write-Host "Test 2: TCP Connection (Port 443)" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$tcpTest = Test-NetConnection -ComputerName ketesbnrumxbvwuaqefa.supabase.co -Port 443 -WarningAction SilentlyContinue
if ($tcpTest.TcpTestSucceeded) {
    Write-Host "[SUCCESS] TCP Connection: PASSED" -ForegroundColor Green
    Write-Host "  Remote Address: $($tcpTest.RemoteAddress)" -ForegroundColor Gray
    Write-Host "  Source Address: $($tcpTest.SourceAddress.IPAddress)" -ForegroundColor Gray
} else {
    Write-Host "[FAILED] TCP Connection: BLOCKED" -ForegroundColor Red
    Write-Host "  FIREWALL IS LIKELY BLOCKING THIS CONNECTION" -ForegroundColor Red -BackgroundColor Yellow
}
Write-Host ""

# Test 3: HTTPS Request
Write-Host "Test 3: HTTPS Request" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "https://ketesbnrumxbvwuaqefa.supabase.co" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    $stopwatch.Stop()
    Write-Host "✓ HTTPS Request: SUCCESS" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "  Response Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ HTTPS Request: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Message -like "*timed out*") {
        Write-Host "  ** TIMEOUT - FIREWALL MAY BE BLOCKING **" -ForegroundColor Red -BackgroundColor Yellow
    }
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
    Write-Host "  Could not check firewall status" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Check for blocking rules
Write-Host "Test 5: Check Outbound Blocking Rules" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $blockingRules = Get-NetFirewallRule | Where-Object {
        $_.Direction -eq "Outbound" -and 
        $_.Action -eq "Block" -and 
        $_.Enabled -eq "True"
    } | Select-Object -First 5 DisplayName
    
    if ($blockingRules.Count -gt 0) {
        Write-Host "  Found $($blockingRules.Count) active blocking rules:" -ForegroundColor Yellow
        foreach ($rule in $blockingRules) {
            Write-Host "    - $($rule.DisplayName)" -ForegroundColor Gray
        }
        Write-Host "  Note: These may or may not affect Supabase" -ForegroundColor Gray
    } else {
        Write-Host "  No outbound blocking rules found" -ForegroundColor Green
    }
} catch {
    Write-Host "  Could not check firewall rules" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Test Supabase REST API
Write-Host "Test 6: Supabase REST API" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $apiUrl = "https://ketesbnrumxbvwuaqefa.supabase.co/rest/v1/"
    $headers = @{
        "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc"
    }
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri $apiUrl -Headers $headers -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    $stopwatch.Stop()
    Write-Host "✓ Supabase API: SUCCESS" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "  Response Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ Supabase API: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "======= TEST SUMMARY =======" -ForegroundColor Cyan
Write-Host ""

$allTestsPassed = $tcpTest.TcpTestSucceeded

if ($allTestsPassed) {
    Write-Host "✓ CONNECTION IS WORKING" -ForegroundColor Green
    Write-Host "  Your firewall does NOT appear to be blocking Supabase." -ForegroundColor Green
    Write-Host "  If your app still has issues, the problem is likely:" -ForegroundColor Yellow
    Write-Host "    - In your application code" -ForegroundColor Gray
    Write-Host "    - Browser security settings" -ForegroundColor Gray
    Write-Host "    - RLS policies in Supabase" -ForegroundColor Gray
} else {
    Write-Host "✗ CONNECTION IS BLOCKED" -ForegroundColor Red
    Write-Host "  Your firewall IS likely blocking Supabase connections." -ForegroundColor Red
    Write-Host ""
    Write-Host "  SOLUTIONS:" -ForegroundColor Yellow
    Write-Host "  1. Temporarily disable Windows Firewall to confirm:" -ForegroundColor White
    Write-Host "     - Open 'firewall.cpl'" -ForegroundColor Gray
    Write-Host "     - Turn off firewall (both private and public)" -ForegroundColor Gray
    Write-Host "     - Test your app again" -ForegroundColor Gray
    Write-Host "     - Re-enable firewall after testing" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Add firewall exception for Node.js:" -ForegroundColor White
    Write-Host "     - Open 'wf.msc'" -ForegroundColor Gray
    Write-Host "     - Outbound Rules > New Rule" -ForegroundColor Gray
    Write-Host "     - Program > Browse to node.exe" -ForegroundColor Gray
    Write-Host "     - Allow the connection" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Try connecting via mobile hotspot" -ForegroundColor White
    Write-Host "     - This rules out network-level blocking" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======= END OF TEST =======" -ForegroundColor Cyan