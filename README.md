# Polygon Reverse Proxy

A lightweight reverse proxy built for Cloudflare Workers that selectively routes specific paths to a target domain while passing through all other requests to the original domain.

## Overview

This reverse proxy acts as a smart router that:
- Intercepts requests to specific configured routes
- Forwards those requests to a target domain
- Passes all other requests through unchanged to the original domain
- Preserves all request headers, methods, query parameters, and body content

## How It Works

The proxy uses pattern matching to determine which requests to forward:

1. **Request Interception**: Every incoming request is analyzed
2. **Route Matching**: The pathname is checked against configured proxy routes
3. **Conditional Forwarding**: 
   - Matching routes → forwarded to `PROXY_TARGET`
   - Non-matching routes → passed through to original domain
4. **Response Relay**: The target server's response is returned to the client

## Configuration

### PROXY_TARGET
The destination domain where specific routes will be forwarded.

```javascript
const PROXY_TARGET = '<new-domain.com>';
```

### PROXY_ROUTES
An array of path patterns that should be proxied to the target domain.

```javascript
const PROXY_ROUTES = ['/', '/about', '/contactUs'];
```

## Route Matching Logic

The proxy matches routes using exact path matching and prefix matching:

- **Exact Match**: `/about` matches exactly `/about`
- **Prefix Match**: `/about` also matches `/about/team`, `/about/history`, etc.

Example with current configuration:
- `example.com/` → forwarded to `new-domain.com/`
- `example.com/about` → forwarded to `new-domain.com/about`
- `example.com/contactUs` → forwarded to `new-domain.com/contactUs`
- `example.com/products` → passed through to `example.com/products`

## Request Preservation

The proxy maintains complete request integrity:
- **Method**: GET, POST, PUT, DELETE, etc.
- **Headers**: All original headers are forwarded
- **Body**: Request body is passed through unchanged
- **Query Parameters**: All query strings are preserved

Example:
```
Original: POST https://example.com/contactUs?source=landing
Proxied:  POST https://new-domain.com/contactUs?source=landing
```

## Deployment

Follow these steps to deploy the reverse proxy from scratch:

### Step 1: Create a Cloudflare Worker

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Select **Create Worker**
5. Give your worker a name (e.g., `polygon-proxy`)
6. Click **Deploy**

### Step 2: Add the Proxy Code

1. After deployment, click **Edit Code** to open the code editor
2. Delete the default code
3. Copy and paste the entire content of `reverse-proxy.js`
4. Update the configuration:
   - Set `PROXY_TARGET` to your target domain (e.g., `new-domain.com`)
   - Configure `PROXY_ROUTES` with the paths you want to proxy (e.g., `['/', '/about', '/contactUs']`)
5. Click **Save and Deploy**

### Step 3: Configure DNS Records

1. In Cloudflare Dashboard, go to your domain's DNS settings
2. Configure DNS records for both domains:

**For the base/original domain (example.com):**
- If an existing DNS record exists:
  - Click **Edit** on the existing record
  - Update the **Target** to: `cdn.webflow.com`
  - Ensure **Proxy status**: ☁️ **Proxied** (Orange cloud enabled)
  - **TTL**: Auto
- If no record exists:
  - Click **Add record**
  - **Type**: `CNAME`
  - **Name**: `@` (for root domain)
  - **Target**: `cdn.webflow.com`
  - **Proxy status**: ☁️ **Proxied** (Orange cloud enabled)
  - **TTL**: Auto

**For the new target subdomain (e.g., new.example.com):**
- Click **Add record**
- **Type**: `CNAME`
- **Name**: `new` (or your subdomain name)
- **Target**: `cdn.webflow.com`
- **Proxy status**: ☁️ **Proxied** (Orange cloud enabled)
- **TTL**: Auto

### Step 4: Configure Worker Routes

1. Go back to **Workers & Pages** in Cloudflare Dashboard
2. Select your worker (e.g., `polygon-proxy`)
3. Go to **Settings** → **Triggers**
4. Under **Routes**, click **Add route**
5. Configure the route:
   - **Route**: `example.com/*` (replace `example.com` with your actual domain)
   - **Worker**: Select your deployed worker
   - **Zone**: Select your domain
6. Click **Add route**

### Step 5: Verify Deployment

1. Wait 1-2 minutes for DNS and route propagation
2. Visit your domain in a browser
3. Check the Cloudflare Workers logs:
   - Go to your worker in the dashboard
   - Navigate to **Observability** tab to view real-time logs
   - Access your domain in a browser to generate log entries
4. Verify that:
   - Proxied routes (e.g., `/`, `/about`, `/contactUs`) are forwarded to `PROXY_TARGET`
   - Non-proxied routes are passed through to the original domain

### Deployment Checklist

- [ ] Cloudflare Worker created and named
- [ ] Proxy code deployed with correct `PROXY_TARGET` and `PROXY_ROUTES`
- [ ] Base domain DNS record updated/added pointing to `cdn.webflow.com` (Proxied/Orange cloud)
- [ ] New subdomain DNS record added pointing to `cdn.webflow.com` (Proxied/Orange cloud)
- [ ] Worker route configured for your domain pattern (e.g., `example.com/*`)
- [ ] Observability logs verified showing correct routing behavior

## Notes

- The proxy preserves the original request's pathname and search parameters
- Response status codes, headers, and body are all forwarded from the target
- Console logs are available in Cloudflare Workers dashboard for debugging
