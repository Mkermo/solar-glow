# Direct Test: Check Supabase Connection

## Quick Test in Browser Console

1. **Open your browser** with the app running
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Paste and run these commands one at a time:

### Test 1: Check Connection

```javascript
const { supabase } = await import("/src/lib/supabase.ts");
console.log("Supabase client loaded:", supabase ? "Yes" : "No");
```

### Test 2: Get Current Session

```javascript
const { data: session } = await supabase.auth.getSession();
console.log("Current session:", session);
```

### Test 3: Check Products Table

```javascript
const { data, error, status } = await supabase
  .from("products")
  .select("count(*)", { count: "exact" })
  .limit(1);

console.log("Product count query:");
console.log("Status:", status);
console.log("Error:", error);
console.log("Data:", data);
console.log("Count:", data?.[0]?.count);
```

### Test 4: Get One Product

```javascript
const { data, error, status } = await supabase
  .from("products")
  .select("*")
  .limit(1);

console.log("Single product query:");
console.log("Status:", status);
console.log("Error:", error);
console.log("Data:", data);
```

### Test 5: Check Hidden Products

```javascript
const { data, error, status } = await supabase
  .from("products")
  .select("*")
  .eq("is_hidden", false)
  .limit(5);

console.log("Non-hidden products:");
console.log("Status:", status);
console.log("Error:", error);
console.log("Count:", data?.length);
console.log("First product:", data?.[0]);
```

## Expected Results:

- **Test 1**: Should show "Supabase client loaded: Yes"
- **Test 2**: Session should be null or have user data
- **Test 3**: Should show products count (not 0)
- **Test 4**: Should return one product object or error
- **Test 5**: Should return multiple products or error

## What Error Means:

| Error              | Likely Cause             | Fix                                      |
| ------------------ | ------------------------ | ---------------------------------------- |
| `code: "PGRST301"` | RLS policy blocking      | Disable RLS or create public read policy |
| `code: "PGRST100"` | Table doesn't exist      | Check table name in database             |
| `code: "42P01"`    | Table not found          | Create products table                    |
| Network error      | Supabase down or blocked | Check Supabase status, firewall          |
| `CORS` error       | Security policy          | Check CSP settings                       |

## If You Get Errors:

**Copy the entire error object and paste it here - that's what we need to fix it.**
