# HOW TO UPDATE PROXY CODE

## When To Use This
Use this guide when updating the reverse proxy logic or modifying proxied routes from the Cloudflare dashboard.

---

## Update Worker Code

1. Log in to Cloudflare Dashboard  
2. Go to **Workers & Pages**  
3. Select your Worker (e.g. `polygon-proxy`)  
4. Click **Edit Code**

---

## Update Routes Configuration

Locate the configuration block:

```js
const PROXY_ROUTES = [...];
````

Replace the routes with the new set:

```js
const PROXY_ROUTES = [
  '/',
  '/about',
  '/launch/build-with-oms',
  '/polygon-pos',
  '/trails'
];
```

---

## Route Changes

### ✅ Newly Added Routes

* `/`
* `/launch/build-with-oms`
* `/polygon-pos`
* `/trails`

### ♻️ Existing Routes

* `/about`

### ❌ Removed Routes

* `/contact-us`

---

## Deploy Changes

1. Click **Save and Deploy**
2. Wait ~10–30 seconds
3. Verify behavior in browser

---

## Quick Verification Checklist

* `/` → Proxied
* `/about` → Proxied
* `/launch/build-with-oms` → Proxied
* `/polygon-pos` → Proxied
* `/trails` → Proxied
* `/contact-us` → NOT proxied

---

## Notes

* Route matching uses prefix logic
* No DNS changes required
* No Worker route changes required
