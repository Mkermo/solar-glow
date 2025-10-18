# How to Check if Windows Defender Firewall is Blocking Supabase Connection

## Quick Test: Is Windows Firewall the Problem?

### Method 1: Temporarily Disable Windows Defender Firewall (Quick Test)

**⚠️ WARNING: Only do this temporarily for testing! Re-enable it after.**

1. Press `Windows Key + R`
2. Type: `firewall.cpl` and press Enter
3. Click "Turn Windows Defender Firewall on or off" on the left
4. Select "Turn off Windows Defender Firewall" for **both** Private and Public networks
5. Click OK
6. Try running your app again at http://localhost:3000
7. **If it works now**, Windows Firewall was blocking it!
8. **Important**: Turn the firewall back ON after testing

---

## Method 2: Check Firewall Logs (More Detailed)

### Step 1: Enable Firewall Logging

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter (opens Windows Defender Firewall with Advanced Security)
3. In the left panel, click "Windows Defender Firewall with Advanced Security"
4. In the right panel under "Actions", click "Properties"
5. Go to each tab (Domain Profile, Private Profile, Public Profile) and do the following:
   - Click "Customize" under Logging
   - Set "Log dropped packets" to **Yes**
   - Set "Log successful connections" to **Yes** (optional but helpful)
   - Note the log file location (usually `C:\Windows\System32\LogFiles\Firewall\pfirewall.log`)
   - Click OK

### Step 2: Try Connecting to Supabase

1. Open your app at http://localhost:3000
2. Wait for the product loading to fail
3. Open the firewall log file at: `C:\Windows\System32\LogFiles\Firewall\pfirewall.log`
4. Look for entries containing:
   - `ketesbnrumxbvwuaqefa.supabase.co`
   - `172.64.149.246` (Supabase IP address)
   - Port `443` (HTTPS)
   - `DROP` or `BLOCK` in the action column

**Example of a blocked connection:**

```
2025-10-18 14:30:45 DROP TCP 192.168.1.100 172.64.149.246 54321 443 - - - - - - -
```

---

## Method 3: Check Outbound Rules

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter
3. Click on "Outbound Rules" in the left panel
4. Look for any rules that might block:
   - Node.js
   - Chrome/Edge/Your Browser
   - Port 443 (HTTPS)
   - Any rules mentioning "Supabase" or blocking "All programs"

---

## Method 4: Use PowerShell to Test Connection

Run this PowerShell command to test if you can reach Supabase:

\`\`\`powershell
Test-NetConnection -ComputerName ketesbnrumxbvwuaqefa.supabase.co -Port 443
\`\`\`

**Expected output if working:**

```
ComputerName     : ketesbnrumxbvwuaqefa.supabase.co
RemoteAddress    : 172.64.149.246
RemotePort       : 443
InterfaceAlias   : Wi-Fi
SourceAddress    : 192.168.1.100
TcpTestSucceeded : True
```

**If blocked:**

```
TcpTestSucceeded : False
```

---

## Method 5: Test with curl or Invoke-WebRequest

### Using PowerShell:

\`\`\`powershell
Invoke-WebRequest -Uri "https://ketesbnrumxbvwuaqefa.supabase.co" -TimeoutSec 10
\`\`\`

**If firewall is blocking:**

- You'll get a timeout error
- Or: "The operation has timed out"
- Or: "Unable to connect to the remote server"

**If working:**

- You'll get a response (even if it's a 404, that's fine - it means connection works!)

---

## How to Fix: Add Firewall Exceptions

### Option 1: Allow Node.js Through Firewall

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter
3. Click "Outbound Rules" in the left panel
4. Click "New Rule..." in the right panel
5. Select "Program" and click Next
6. Click "Browse" and navigate to your Node.js installation:
   - Usually: `C:\Program Files\nodejs\node.exe`
   - Or run in PowerShell: `where.exe node` to find it
7. Click Next
8. Select "Allow the connection"
9. Click Next
10. Check all boxes (Domain, Private, Public)
11. Click Next
12. Name it: "Node.js - Allow Outbound"
13. Click Finish

### Option 2: Allow Your Browser Through Firewall

Repeat the steps above but for your browser:

- Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Firefox: `C:\Program Files\Mozilla Firefox\firefox.exe`

### Option 3: Allow Specific Port/Domain

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter
3. Click "Outbound Rules" → "New Rule..."
4. Select "Port" and click Next
5. Select "TCP"
6. Select "Specific remote ports" and enter: `443`
7. Click Next
8. Select "Allow the connection"
9. Click Next
10. Check all profiles (Domain, Private, Public)
11. Click Next
12. Name it: "Allow HTTPS to Supabase"
13. Click Finish

---

## Quick Commands to Run

### 1. Test DNS Resolution

\`\`\`powershell
nslookup ketesbnrumxbvwuaqefa.supabase.co
\`\`\`

### 2. Test Connection

\`\`\`powershell
Test-NetConnection -ComputerName ketesbnrumxbvwuaqefa.supabase.co -Port 443
\`\`\`

### 3. Test HTTP Request

\`\`\`powershell
curl https://ketesbnrumxbvwuaqefa.supabase.co
\`\`\`

### 4. Check Active Firewall Rules Blocking Node

\`\`\`powershell
Get-NetFirewallRule | Where-Object {$_.Direction -eq "Outbound" -and $_.Action -eq "Block" -and $\_.Enabled -eq "True"} | Select-Object DisplayName, Description
\`\`\`

---

## Other Security Software to Check

Windows Defender Firewall isn't the only thing that could block connections:

### Antivirus Software

- **McAfee**: Check "Firewall" settings
- **Norton**: Check "Smart Firewall"
- **Avast/AVG**: Check "Firewall" in settings
- **Kaspersky**: Check "Network Settings"
- **Bitdefender**: Check "Firewall" module

### VPN Software

- If you're using a VPN, try disconnecting it temporarily
- Some VPNs block certain connections

### Proxy Settings

1. Press `Windows Key + R`
2. Type: `inetcpl.cpl` and press Enter
3. Go to "Connections" tab
4. Click "LAN settings"
5. Make sure "Use a proxy server" is **unchecked** (unless you need it)

---

## Final Test Script

Save this as `test-firewall.ps1` and run in PowerShell:

\`\`\`powershell
Write-Host "======= FIREWALL TEST =======" -ForegroundColor Cyan

# Test 1: DNS

Write-Host "`nTest 1: DNS Resolution" -ForegroundColor Yellow
try {
$dns = Resolve-DnsName ketesbnrumxbvwuaqefa.supabase.co
    Write-Host "✓ DNS works: $($dns.IPAddress)" -ForegroundColor Green
} catch {
Write-Host "✗ DNS failed: $($\_.Exception.Message)" -ForegroundColor Red
}

# Test 2: TCP Connection

Write-Host "`nTest 2: TCP Connection (Port 443)" -ForegroundColor Yellow
$tcpTest = Test-NetConnection -ComputerName ketesbnrumxbvwuaqefa.supabase.co -Port 443 -WarningAction SilentlyContinue
if ($tcpTest.TcpTestSucceeded) {
Write-Host "✓ TCP connection successful" -ForegroundColor Green
} else {
Write-Host "✗ TCP connection failed (FIREWALL LIKELY BLOCKING)" -ForegroundColor Red
}

# Test 3: HTTPS Request

Write-Host "`nTest 3: HTTPS Request" -ForegroundColor Yellow
try {
$response = Invoke-WebRequest -Uri "https://ketesbnrumxbvwuaqefa.supabase.co" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ HTTPS request successful (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
Write-Host "✗ HTTPS request failed: $($\_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n======= TEST COMPLETE =======" -ForegroundColor Cyan
Write-Host "`nIf TCP or HTTPS tests failed, Windows Firewall is likely blocking the connection." -ForegroundColor Yellow
\`\`\`

Run it with:
\`\`\`powershell
cd "c:\Users\MkerM\Desktop\proj ver\solar-glow"
powershell -ExecutionPolicy Bypass -File test-firewall.ps1
\`\`\`

---

## Summary: Is My Firewall Blocking Supabase?

✅ **Firewall is NOT blocking if:**

- Test-NetConnection returns `TcpTestSucceeded : True`
- curl/Invoke-WebRequest returns a response (even 404 is OK)
- Temporarily disabling firewall doesn't fix the issue

❌ **Firewall IS blocking if:**

- Test-NetConnection returns `TcpTestSucceeded : False`
- curl/Invoke-WebRequest times out
- Disabling firewall makes your app work
- Firewall logs show DROP/BLOCK for Supabase IP

---

## Next Steps After Identifying the Issue

1. If firewall is blocking: Add Node.js and browser exceptions (see "How to Fix" above)
2. If firewall is NOT blocking: Check the browser console for JavaScript errors
3. Try the NetworkTest page: http://localhost:3000/network-test (I created this for you)
4. Check if your ISP or network admin is blocking Supabase
5. Try connecting via mobile hotspot to rule out network-level blocking
